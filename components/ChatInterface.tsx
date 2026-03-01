"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Message, ChatSession } from "@/types/chat";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { Sidebar } from "./Sidebar";
import { TypingIndicator } from "./TypingIndicator";
import { Menu, Sparkles, Zap } from "lucide-react";

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
    const [selectedModel, setSelectedModel] = useState("openai/gpt-oss-120b");
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
                body: JSON.stringify({ messages: sessionMessages, model: selectedModel }),
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
    }, [input, isLoading, activeSessionId, sessions, updateSessions, selectedModel]);

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
        <div className="flex h-screen overflow-hidden bg-gray-950">
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
            <main className="flex flex-col flex-1 overflow-hidden relative">
                {/* Top bar */}
                <header className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-black/20 backdrop-blur-sm">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 rounded-xl hover:bg-white/5 text-white/50 hover:text-white/80 transition-colors"
                    >
                        <Menu size={18} />
                    </button>
                    <div className="flex-1">
                        <h2 className="text-sm font-semibold text-white">
                            {activeSession?.title ?? "Gemini AI Chat"}
                        </h2>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-xs text-white/30">{selectedModel}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20">
                        <Zap size={12} className="text-violet-400" />
                        <span className="text-xs text-violet-300 font-medium">Online</span>
                    </div>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {messages.length === 0 ? (
                        /* Welcome screen */
                        <div className="flex flex-col items-center justify-center h-full gap-8 px-4 py-12">
                            <div className="text-center space-y-3">
                                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-900/50 ring-1 ring-white/10">
                                    <Sparkles size={36} className="text-white" />
                                </div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-violet-200 to-purple-300 bg-clip-text text-transparent">
                                    Gemini AI
                                </h1>
                                <p className="text-white/40 text-sm max-w-xs">
                                    Asisten AI cerdas yang siap membantu. Tanya apa saja!
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                                {SUGGESTIONS.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setInput(s.text)}
                                        className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 hover:bg-white/8 border border-white/8 hover:border-violet-500/30 text-left transition-all duration-200 group hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <span className="text-xl">{s.icon}</span>
                                        <span className="text-sm text-white/60 group-hover:text-white/80 leading-snug">
                                            {s.text}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="py-4 space-y-1 max-w-4xl mx-auto w-full">
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
                    selectedModel={selectedModel}
                    onModelChange={setSelectedModel}
                />
            </main>
        </div>
    );
}
