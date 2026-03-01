"use client";

import React, { useRef, useEffect, KeyboardEvent } from "react";
import { Send, Square } from "lucide-react";

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    onStop?: () => void;
    isLoading: boolean;
    disabled?: boolean;
    selectedModel: string;
    onModelChange: (model: string) => void;
}

const MODELS = [
    { id: "gemini-3.0-flash", name: "Gemini 3 Flash", type: "gemini" },
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", type: "gemini" },
    { id: "llama3-70b-8192", name: "Llama 3 70B", type: "groq" },
    { id: "llama3-8b-8192", name: "Llama 3 8B", type: "groq" },
    { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B", type: "groq" },
    { id: "openai/gpt-oss-120b", name: "GPT-OSS 120B", type: "groq" },
];

export function ChatInput({
    value,
    onChange,
    onSend,
    onStop,
    isLoading,
    disabled,
    selectedModel,
    onModelChange,
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
        <div className="p-4 border-t border-white/5">
            <div className="max-w-4xl mx-auto">
                {/* Model selector */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <span className="text-xs text-white/30 shrink-0">Model:</span>
                    <div className="flex flex-wrap gap-1">
                        {MODELS.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => onModelChange(m.id)}
                                className={`text-xs px-2.5 py-1 rounded-full transition-all duration-200 ${selectedModel === m.id
                                    ? "bg-violet-500/30 text-violet-300 border border-violet-500/50"
                                    : "text-white/30 hover:text-white/60 border border-transparent hover:border-white/10"
                                    }`}
                            >
                                {m.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Input area */}
                <div className="relative flex items-end gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3 focus-within:border-violet-500/50 transition-all duration-300 focus-within:bg-white/8 focus-within:shadow-[0_0_30px_rgba(139,92,246,0.15)]">
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Tanya apapun kepada Astra Chat..."
                        rows={1}
                        disabled={disabled}
                        className="flex-1 bg-transparent text-white placeholder-white/25 resize-none outline-none text-sm leading-relaxed max-h-48 scrollbar-thin scrollbar-thumb-white/10"
                    />

                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-white/20">
                            {value.length > 0 ? `${value.length}` : "⏎ kirim"}
                        </span>
                        {isLoading ? (
                            <button
                                onClick={onStop}
                                className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all duration-200 border border-red-500/30"
                            >
                                <Square size={16} fill="currentColor" />
                            </button>
                        ) : (
                            <button
                                onClick={onSend}
                                disabled={!value.trim() || isLoading}
                                className="p-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all duration-200 shadow-lg shadow-violet-900/40 hover:shadow-violet-800/50 hover:scale-105 active:scale-95"
                            >
                                <Send size={16} />
                            </button>
                        )}
                    </div>
                </div>

                <p className="text-center text-xs text-white/15 mt-2">
                    Astra Chat dapat membuat kesalahan. Periksa informasi penting.
                </p>
            </div>
        </div>
    );
}
