"use client";

import React, { useState } from "react";
import { Message } from "@/types/chat";
import { Copy, Check, User, Sparkles, Terminal } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MessageBubbleProps {
    message: Message;
}

function CodeBlock({ language, code }: { language: string; code: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="my-4 rounded-xl overflow-hidden border border-slate-700/60 bg-slate-950/80 shadow-md">
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900/90 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                    <Terminal size={12} className="text-sky-400" />
                    <span>{language || "code"}</span>
                </div>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                >
                    {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                </button>
            </div>
            <SyntaxHighlighter
                style={oneDark}
                language={language || "text"}
                PreTag="div"
                customStyle={{
                    margin: 0,
                    padding: "0.85rem 1rem",
                    background: "transparent",
                    fontSize: "0.82rem",
                    lineHeight: "1.6",
                    fontFamily: "var(--font-mono)",
                }}
            >
                {code}
            </SyntaxHighlighter>
        </div>
    );
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const [copied, setCopied] = useState(false);
    const isUser = message.role === "user";

    const handleCopy = async () => {
        await navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const time = new Date(message.timestamp).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div
            className={`group w-full max-w-4xl mx-auto px-4 py-3 animate-fadeIn flex gap-3.5 ${
                isUser ? "flex-row-reverse" : "flex-row"
            }`}
        >
            {/* Avatar Icon */}
            <div
                className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-sm mt-0.5 ${
                    isUser
                        ? "bg-sky-600 text-white shadow-sky-900/30"
                        : "bg-slate-800 border border-slate-700/80 text-sky-400"
                }`}
            >
                {isUser ? <User size={15} /> : <Sparkles size={15} />}
            </div>

            {/* Bubble & Editorial Layout */}
            <div className={`flex flex-col flex-1 min-w-0 ${isUser ? "items-end" : "items-start"}`}>
                <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[11px] font-medium text-slate-400">
                        {isUser ? "Kamu" : "Astra AI"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{time}</span>
                </div>

                <div
                    className={`relative text-sm leading-relaxed ${
                        isUser
                            ? "max-w-[85%] bg-sky-700 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-md border border-sky-600/60"
                            : "w-full text-slate-200 pl-1 pr-4"
                    } ${message.isStreaming ? "streaming-cursor" : ""}`}
                >
                    {isUser ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                        <div className="prose prose-invert prose-sm max-w-none text-slate-200">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    code({ className, children, ...rest }) {
                                        const match = /language-(\w+)/.exec(className || "");
                                        const isBlock = !!match;
                                        const codeText = String(children).replace(/\n$/, "");
                                        return isBlock ? (
                                            <CodeBlock language={match[1]} code={codeText} />
                                        ) : (
                                            <code className="bg-slate-800/80 text-sky-300 border border-slate-700/50 px-1.5 py-0.5 rounded text-[12px] font-mono" {...rest}>
                                                {children}
                                            </code>
                                        );
                                    },
                                    p: ({ children }) => <p className="mb-3 last:mb-0 text-slate-200/90 leading-relaxed">{children}</p>,
                                    ul: ({ children }) => <ul className="my-2.5 ml-4 list-disc space-y-1.5 text-slate-300">{children}</ul>,
                                    ol: ({ children }) => <ol className="my-2.5 ml-4 list-decimal space-y-1.5 text-slate-300">{children}</ol>,
                                    li: ({ children }) => <li className="text-slate-300 leading-normal">{children}</li>,
                                    h1: ({ children }) => <h1 className="text-lg font-bold text-slate-100 mt-4 mb-2 pb-1 border-b border-slate-800">{children}</h1>,
                                    h2: ({ children }) => <h2 className="text-base font-semibold text-slate-100 mt-3.5 mb-2">{children}</h2>,
                                    h3: ({ children }) => <h3 className="text-sm font-semibold text-slate-200 mt-2.5 mb-1">{children}</h3>,
                                    blockquote: ({ children }) => (
                                        <blockquote className="border-l-2 border-sky-500/80 bg-slate-900/50 rounded-r-lg pl-3.5 py-1.5 my-3 text-slate-300 italic">
                                            {children}
                                        </blockquote>
                                    ),
                                    table: ({ children }) => (
                                        <div className="overflow-x-auto my-3 border border-slate-800 rounded-xl">
                                            <table className="min-w-full text-xs divide-y divide-slate-800">
                                                {children}
                                            </table>
                                        </div>
                                    ),
                                    th: ({ children }) => <th className="bg-slate-900/80 px-3.5 py-2 text-left font-semibold text-slate-300">{children}</th>,
                                    td: ({ children }) => <td className="px-3.5 py-2 text-slate-300 bg-slate-950/40">{children}</td>,
                                    a: ({ children, href }) => (
                                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 underline underline-offset-2">
                                            {children}
                                        </a>
                                    ),
                                    strong: ({ children }) => <strong className="font-semibold text-slate-100">{children}</strong>,
                                    hr: () => <hr className="border-slate-800 my-4" />,
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>

                {/* Micro Action: Copy */}
                <div className="flex items-center gap-2 mt-1 px-1">
                    <button
                        onClick={handleCopy}
                        className="opacity-0 group-hover:opacity-100 transition-all duration-150 flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 px-1.5 py-0.5 rounded hover:bg-slate-800/60"
                        title="Salin isi pesan"
                    >
                        {copied ? (
                            <>
                                <Check size={11} className="text-emerald-400" />
                                <span className="text-emerald-400">Disalin</span>
                            </>
                        ) : (
                            <>
                                <Copy size={11} />
                                <span>Salin</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
