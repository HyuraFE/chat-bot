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
                    className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-30 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:relative inset-y-0 left-0 z-40 lg:z-auto
          w-72 flex flex-col
          bg-slate-950/80 backdrop-blur-xl border-r border-slate-800/80
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800/80">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-sky-400 shadow-sm">
                            <Sparkles size={16} />
                        </div>
                        <div>
                            <h1 className="text-sm font-semibold text-slate-100 tracking-tight">Astra Chat</h1>
                            <p className="text-[11px] text-slate-400">Nordic Edition</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* New Chat Button */}
                <div className="p-3">
                    <button
                        onClick={onNewChat}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold tracking-wide transition-all duration-150 shadow-sm shadow-sky-950"
                    >
                        <Plus size={15} />
                        Percakapan Baru
                    </button>
                </div>

                {/* Sessions list */}
                <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
                    {sessions.length === 0 ? (
                        <div className="text-center py-10 px-4">
                            <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-2 text-slate-500">
                                <MessageSquare size={18} />
                            </div>
                            <p className="text-xs text-slate-400 font-medium">Belum ada riwayat</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">Mulai obrolan baru dengan Astra</p>
                        </div>
                    ) : (
                        sessions.map((session) => {
                            const active = activeSessionId === session.id;
                            return (
                                <div
                                    key={session.id}
                                    className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all duration-150 border ${
                                        active
                                            ? "bg-slate-800/90 border-slate-700/90 text-white shadow-xs"
                                            : "hover:bg-slate-900/60 text-slate-400 hover:text-slate-200 border-transparent"
                                    }`}
                                    onClick={() => onSelectSession(session.id)}
                                >
                                    <MessageSquare size={13} className={`shrink-0 ${active ? "text-sky-400" : "text-slate-500"}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate">{session.title}</p>
                                        <p className="text-[10px] text-slate-500 font-mono truncate">
                                            {session.messages.length} pesan
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteSession(session.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-rose-500/20 hover:text-rose-400 text-slate-500 transition-all"
                                        title="Hapus chat"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                        <span>Astra AI v0.1</span>
                        <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Ready
                        </span>
                    </div>
                </div>
            </aside>
        </>
    );
}
