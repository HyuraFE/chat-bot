export type Role = "user" | "assistant";

export interface Message {
    id: string;
    role: Role;
    content: string;
    timestamp: Date;
    isStreaming?: boolean;
}

export interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
}
