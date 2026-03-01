"use client";

import React, { useState } from "react";
import { Message } from "@/types/chat";
import { Copy, Check, User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MessageBubbleProps {
    message: Message;
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
            className={`group flex gap-3 px-4 py-2 animate-fadeIn ${isUser ? "flex-row-reverse" : "flex-row"
                }`}
        >
            {/* Avatar */}
            <div
                className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm ${isUser
                        ? "bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-900/40"
                        : "bg-gradient-to-br from-blue-500 via-violet-600 to-purple-600 shadow-lg shadow-violet-900/40"
                    }`}
            >
                {isUser ? <User size={15} className="text-white" /> : <Sparkles size={15} className="text-white" />}
            </div>

            {/* Bubble */}
            <div className={`flex flex-col gap-1 max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium text-white/40">
                        {isUser ? "Kamu" : "Gemini AI"}
                    </span>
                    <span className="text-xs text-white/20">{time}</span>
                </div>

                <div
                    className={`relative rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser
                            ? "bg-gradient-to-br from-violet-600 to-purple-700 text-white rounded-tr-sm shadow-lg shadow-violet-900/30"
                            : "bg-white/5 backdrop-blur-sm border border-white/10 text-white/90 rounded-tl-sm"
                        } ${message.isStreaming ? "streaming-cursor" : ""}`}
                >
                    {isUser ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                        <div className="prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    code({ className, children, ...rest }) {
                                        const match = /language-(\w+)/.exec(className || "");
                                        const isBlock = !!match;
                                        return isBlock ? (
                                            <div className="my-3 rounded-xl overflow-hidden border border-white/10">
                                                <div className="flex items-center justify-between bg-white/5 px-4 py-2 border-b border-white/10">
                                                    <span className="text-xs text-white/40 font-mono">{match[1]}</span>
                                                </div>
                                                <SyntaxHighlighter
                                                    style={oneDark}
                                                    language={match[1]}
                                                    PreTag="div"
                                                    customStyle={{
                                                        margin: 0,
                                                        background: "rgba(0,0,0,0.4)",
                                                        fontSize: "0.8rem",
                                                    }}
                                                >
                                                    {String(children).replace(/\n$/, "")}
                                                </SyntaxHighlighter>
                                            </div>
                                        ) : (
                                            <code className="bg-white/10 text-violet-300 px-1.5 py-0.5 rounded text-xs font-mono" {...rest}>
                                                {children}
                                            </code>
                                        );
                                    },
                                    p: ({ children }) => <p className="mb-2 last:mb-0 text-white/85">{children}</p>,
                                    ul: ({ children }) => <ul className="my-2 ml-4 list-disc space-y-1 text-white/85">{children}</ul>,
                                    ol: ({ children }) => <ol className="my-2 ml-4 list-decimal space-y-1 text-white/85">{children}</ol>,
                                    li: ({ children }) => <li className="text-white/85">{children}</li>,
                                    h1: ({ children }) => <h1 className="text-xl font-bold text-white mt-4 mb-2">{children}</h1>,
                                    h2: ({ children }) => <h2 className="text-lg font-semibold text-white mt-3 mb-2">{children}</h2>,
                                    h3: ({ children }) => <h3 className="text-base font-semibold text-white mt-2 mb-1">{children}</h3>,
                                    blockquote: ({ children }) => (
                                        <blockquote className="border-l-2 border-violet-500 pl-3 my-2 text-white/60 italic">
                                            {children}
                                        </blockquote>
                                    ),
                                    table: ({ children }) => (
                                        <div className="overflow-x-auto my-3">
                                            <table className="min-w-full border border-white/10 rounded-lg overflow-hidden text-xs">
                                                {children}
                                            </table>
                                        </div>
                                    ),
                                    th: ({ children }) => <th className="bg-white/10 px-3 py-2 text-left font-semibold text-white/80 border-b border-white/10">{children}</th>,
                                    td: ({ children }) => <td className="px-3 py-2 text-white/70 border-b border-white/5">{children}</td>,
                                    a: ({ children, href }) => (
                                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline underline-offset-2">
                                            {children}
                                        </a>
                                    ),
                                    strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                                    hr: () => <hr className="border-white/10 my-3" />,
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                            {message.isStreaming && (
                                <span className="inline-block w-0.5 h-4 bg-violet-400 animate-pulse ml-0.5 align-middle" />
                            )}
                        </div>
                    )}
                </div>

                {/* Copy button */}
                <button
                    onClick={handleCopy}
                    className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1 text-xs text-white/30 hover:text-white/60 px-2 py-1 rounded-lg hover:bg-white/5"
                >
                    {copied ? (
                        <>
                            <Check size={11} />
                            <span>Disalin!</span>
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
    );
}
