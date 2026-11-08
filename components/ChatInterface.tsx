"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Message, ChatSession } from "@/types/chat";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { Sidebar } from "./Sidebar";
import { TypingIndicator } from "./TypingIndicator";
import { Menu, Sparkles, Zap } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

const generateId = () => Math.random().toString(36).slice(2, 11);

const STORAGE_KEY = "gemini-chat-sessions";

function loadSessions(): ChatSession[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw).map((s: ChatSession) => ({
            ...s,
            createdAt: new Date(s.createdAt),
            updatedAt: new Date(s.updatedAt),
            messages: s.messages.map((m: Message) => ({
                ...m,
                timestamp: new Date(m.timestamp),
            })),
        }));
    } catch {
        return [];
    }
}

function saveSessions(sessions: ChatSession[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch { }
}

export function ChatInterface() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Load sessions from localStorage on mount
    useEffect(() => {
        const loaded = loadSessions();
        setSessions(loaded);
        if (loaded.length > 0) {
            setActiveSessionId(loaded[0].id);
        }
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [sessions, isTyping]);

    const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;
    const messages = activeSession?.messages ?? [];

    const updateSessions = useCallback((updated: ChatSession[]) => {
        setSessions(updated);
        saveSessions(updated);
    }, []);

    const createNewSession = useCallback(() => {
        const id = generateId();
        const newSession: ChatSession = {
            id,
            title: "Chat Baru",
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const updated = [newSession, ...sessions];
        updateSessions(updated);
        setActiveSessionId(id);
        setSidebarOpen(false);
    }, [sessions, updateSessions]);

    const handleSend = useCallback(async () => {
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;

        // Create session if none exists
        let sessionId = activeSessionId;
        let currentSessions = sessions;

        if (!sessionId) {
            const id = generateId();
            const newSession: ChatSession = {
                id,
                title: trimmed.slice(0, 40),
                messages: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            currentSessions = [newSession, ...sessions];
            sessionId = id;
            setActiveSessionId(id);
        }

        const userMessage: Message = {
            id: generateId(),
            role: "user",
            content: trimmed,
            timestamp: new Date(),
        };

        const assistantMessage: Message = {
            id: generateId(),
            role: "assistant",
            content: "",
            timestamp: new Date(),
            isStreaming: true,
        };

        const updatedSession = currentSessions.map((s) =>
            s.id === sessionId
                ? {
                    ...s,
                    messages: [...s.messages, userMessage, assistantMessage],
                    title:
                        s.messages.length === 0
                            ? trimmed.slice(0, 40)
                            : s.title,
                    updatedAt: new Date(),
                }
                : s
        );

        updateSessions(updatedSession);
        setInput("");
        setIsLoading(true);
        setIsTyping(true);

        abortControllerRef.current = new AbortController();

        try {
            const sessionMessages = [
                ...(currentSessions.find((s) => s.id === sessionId)?.messages ?? []),
                userMessage,
            ].map((m) => ({ role: m.role, content: m.content }));

            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: sessionMessages }),
                signal: abortControllerRef.current.signal,
            });

            if (!res.ok) throw new Error("Request failed");

            const reader = res.body!.getReader();
            const decoder = new TextDecoder();
            let fullText = "";
            setIsTyping(false);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split("\n");

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        const data = line.slice(6).trim();
                        if (data === "[DONE]") break;
                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.text) {
                                fullText += parsed.text;
                                setSessions((prev) => {
                                    const updated = prev.map((s) =>
                                        s.id === sessionId
                                            ? {
                                                ...s,
                                                messages: s.messages.map((m) =>
                                                    m.id === assistantMessage.id
                                                        ? { ...m, content: fullText, isStreaming: true }
                                                        : m
                                                ),
                                            }
                                            : s
                                    );
                                    saveSessions(updated);
                                    return updated;
                                });
                            }
                        } catch { }
                    }
                }
            }

            // Finalize
            setSessions((prev) => {
                const updated = prev.map((s) =>
                    s.id === sessionId
                        ? {
                            ...s,
                            messages: s.messages.map((m) =>
                                m.id === assistantMessage.id
                                    ? { ...m, content: fullText, isStreaming: false }
                                    : m
                            ),
                        }
                        : s
                );
                saveSessions(updated);
                return updated;
            });
        } catch (err: unknown) {
            if (err instanceof Error && err.name === "AbortError") {
                setSessions((prev) => {
                    const updated = prev.map((s) =>
                        s.id === sessionId
                            ? {
                                ...s,
                                messages: s.messages.map((m) =>
                                    m.id === assistantMessage.id
                                        ? { ...m, isStreaming: false }
                                        : m
                                ),
                            }
                            : s
                    );
                    saveSessions(updated);
                    return updated;
                });
            } else {
                setSessions((prev) => {
                    const updated = prev.map((s) =>
                        s.id === sessionId
                            ? {
                                ...s,
                                messages: s.messages.map((m) =>
                                    m.id === assistantMessage.id
                                        ? {
                                            ...m,
                                            content: "Maaf, terjadi kesalahan. Silakan coba lagi.",
                                            isStreaming: false,
                                        }
                                        : m
                                ),
                            }
                            : s
                    );
                    saveSessions(updated);
                    return updated;
                });
            }
        } finally {
            setIsLoading(false);
            setIsTyping(false);
        }
    }, [input, isLoading, activeSessionId, sessions, updateSessions]);

    const handleStop = useCallback(() => {
        abortControllerRef.current?.abort();
    }, []);

    const handleDeleteSession = useCallback(
        (id: string) => {
            const updated = sessions.filter((s) => s.id !== id);
            updateSessions(updated);
            if (activeSessionId === id) {
                setActiveSessionId(updated.length > 0 ? updated[0].id : null);
            }
        },
        [sessions, activeSessionId, updateSessions]
    );

    const SUGGESTIONS = [
        { icon: "✨", text: "Jelaskan konsep machine learning" },
        { icon: "💻", text: "Buatkan kode React komponen modal" },
        { icon: "📝", text: "Bantu saya membuat email profesional" },
        { icon: "🌏", text: "Apa ibukota dari setiap negara ASEAN?" },
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-slate-950">
            {/* Sidebar */}
            <Sidebar
                sessions={sessions}
                activeSessionId={activeSessionId}
                onNewChat={createNewSession}
                onSelectSession={(id) => {
                    setActiveSessionId(id);
                    setSidebarOpen(false);
                }}
                onDeleteSession={handleDeleteSession}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main */}
            <main className="flex flex-col flex-1 overflow-hidden relative bg-slate-950/60">
                {/* Top bar */}
                <header className="flex items-center gap-3 px-5 py-3 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                        <Menu size={18} />
                    </button>
                    <div className="flex-1 min-w-0 pr-2">
                        <h2 className="text-sm font-semibold text-slate-100 truncate">
                            {activeSession?.title ?? "Astra Chat"}
                        </h2>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                            <span className="text-[11px] text-slate-400 font-mono truncate">gemini-3.5-flash-lite</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20">
                            <Zap size={11} className="text-sky-400" />
                            <span className="text-[11px] text-sky-300 font-medium">Gemini Active</span>
                        </div>
                        {/* Clerk Avatar Profile */}
                        <div className="pl-1 flex items-center justify-center">
                            <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: "w-8 h-8 shadow-sm ring-1 ring-slate-700" } }} />
                        </div>
                    </div>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                    {messages.length === 0 ? (
                        /* Welcome screen */
                        <div className="flex flex-col items-center justify-center h-full gap-8 px-4 py-12">
                            <div className="text-center space-y-3 max-w-sm">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400 shadow-lg shadow-black/30">
                                    <Sparkles size={28} />
                                </div>
                                <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
                                    Astra Chat
                                </h1>
                                <p className="text-slate-400 text-xs leading-relaxed">
                                    Ruang percakapan cerdas dengan tata letak minimalis dan performa responsif.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg">
                                {SUGGESTIONS.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setInput(s.text)}
                                        className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-sky-500/40 text-left transition-all duration-150 group shadow-xs"
                                    >
                                        <span className="text-lg shrink-0">{s.icon}</span>
                                        <span className="text-xs text-slate-300 group-hover:text-white leading-normal font-medium">
                                            {s.text}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="py-4 space-y-1 w-full">
                            {messages.map((message) => (
                                <MessageBubble key={message.id} message={message} />
                            ))}
                            {isTyping && <TypingIndicator />}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input */}
                <ChatInput
                    value={input}
                    onChange={setInput}
                    onSend={handleSend}
                    onStop={handleStop}
                    isLoading={isLoading}
                />
            </main>
        </div>
    );
}
