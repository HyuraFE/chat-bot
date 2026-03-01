"use client";

import React from "react";
import { ChatSession } from "@/types/chat";
import { Plus, MessageSquare, Trash2, X, Sparkles } from "lucide-react";

interface SidebarProps {
    sessions: ChatSession[];
    activeSessionId: string | null;
    onNewChat: () => void;
    onSelectSession: (id: string) => void;
    onDeleteSession: (id: string) => void;
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({
    sessions,
    activeSessionId,
    onNewChat,
    onSelectSession,
    onDeleteSession,
    isOpen,
    onClose,
}: SidebarProps) {
    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:relative inset-y-0 left-0 z-40 lg:z-auto
          w-72 flex flex-col
          bg-black/40 backdrop-blur-xl border-r border-white/5
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-900/40">
                            <Sparkles size={16} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-sm font-semibold text-white">Gemini Chat</h1>
                            <p className="text-xs text-white/30">AI Assistant</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* New Chat Button */}
                <div className="p-3">
                    <button
                        onClick={onNewChat}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all duration-200 shadow-lg shadow-violet-900/40 hover:shadow-violet-800/50 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Plus size={16} />
                        Chat Baru
                    </button>
                </div>

                {/* Sessions list */}
                <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
                    {sessions.length === 0 ? (
                        <div className="text-center py-8">
                            <MessageSquare size={24} className="text-white/20 mx-auto mb-2" />
                            <p className="text-xs text-white/25">Belum ada percakapan</p>
                        </div>
                    ) : (
                        sessions.map((session) => (
                            <div
                                key={session.id}
                                className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${activeSessionId === session.id
                                        ? "bg-violet-500/20 border border-violet-500/30 text-white"
                                        : "hover:bg-white/5 text-white/60 hover:text-white/80 border border-transparent"
                                    }`}
                                onClick={() => onSelectSession(session.id)}
                            >
                                <MessageSquare size={14} className="shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">{session.title}</p>
                                    <p className="text-xs text-white/30 truncate">
                                        {session.messages.length} pesan
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteSession(session.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/20 hover:text-red-400 text-white/40 transition-all duration-200"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-white/5">
                    <p className="text-xs text-white/20 text-center">
                        Powered by Google Gemini
                    </p>
                </div>
            </aside>
        </>
    );
}
