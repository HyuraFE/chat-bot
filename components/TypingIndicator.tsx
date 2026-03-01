"use client";

export function TypingIndicator() {
    return (
        <div className="flex items-center gap-1 px-4 py-3">
            <div className="flex items-center gap-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
                <span className="block w-2 h-2 rounded-full bg-violet-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="block w-2 h-2 rounded-full bg-violet-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="block w-2 h-2 rounded-full bg-violet-400 animate-bounce" />
            </div>
        </div>
    );
}
