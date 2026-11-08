"use client";

import React, { useRef, useEffect, KeyboardEvent } from "react";
import { Send, Square, Sparkles } from "lucide-react";

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    onStop?: () => void;
    isLoading: boolean;
    disabled?: boolean;
}

export function ChatInput({
    value,
    onChange,
    onSend,
    onStop,
    isLoading,
    disabled,
}: ChatInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [value]);

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!isLoading && value.trim()) onSend();
        }
    };

    return (
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 backdrop-blur-md">
            <div className="max-w-4xl mx-auto">
                {/* Input Container */}
                <div className="relative flex flex-col bg-slate-900/80 border border-slate-800 hover:border-slate-700 focus-within:border-sky-500/50 rounded-2xl p-3 shadow-lg shadow-black/20 transition-all duration-200">
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ketik pertanyaan atau pesanmu di sini..."
                        rows={1}
                        disabled={disabled}
                        className="w-full bg-transparent text-slate-100 placeholder-slate-500 resize-none outline-none text-sm leading-relaxed max-h-44 scrollbar-thin scrollbar-thumb-slate-700 px-1 pt-1 pb-2"
                    />

                    {/* Bottom Bar: Static Model Badge + Char count + Send */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60 mt-1">
                        {/* Fixed Model Indicator */}
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[11px] font-mono select-none">
                            <Sparkles size={12} className="text-sky-400" />
                            <span>Gemini 3.5 Flash Lite</span>
                        </div>

                        {/* Actions Right */}
                        <div className="flex items-center gap-2.5 shrink-0 pl-2">
                            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline-block">
                                {value.length > 0 ? `${value.length} char` : "Enter ↵"}
                            </span>
                            {isLoading ? (
                                <button
                                    onClick={onStop}
                                    className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition-all border border-rose-500/30"
                                    title="Stop generating"
                                >
                                    <Square size={15} fill="currentColor" />
                                </button>
                            ) : (
                                <button
                                    onClick={onSend}
                                    disabled={!value.trim() || isLoading}
                                    className="p-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all shadow-md shadow-sky-950 hover:shadow-sky-800/40"
                                    title="Kirim pesan"
                                >
                                    <Send size={15} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <p className="text-center text-[11px] text-slate-500 mt-2">
                    Astra Chat dapat membuat kesalahan. Harap periksa kembali informasi penting.
                </p>
            </div>
        </div>
    );
}
