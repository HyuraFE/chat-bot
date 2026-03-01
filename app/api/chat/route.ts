import { GoogleGenerativeAI, Content } from "@google/generative-ai";
import { NextRequest } from "next/server";
import Groq from "groq-sdk";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { messages, model = "openai/gpt-oss-120b" } = body;

        console.log("[API] model:", model, "| messages:", messages?.length);

        if (!messages || messages.length === 0) {
            return Response.json({ error: "No messages provided" }, { status: 400 });
        }

        const isGroq = !model.startsWith("gemini");

        if (isGroq) {
            if (!process.env.GROQ_API_KEY) {
                return Response.json({ error: "GROQ_API_KEY is not set" }, { status: 500 });
            }

            const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

            // Format messages for Groq
            const groqMessages = messages.map((msg: { role: string; content: string }) => ({
                role: msg.role === "assistant" || msg.role === "model" ? "assistant" : "user",
                content: msg.content,
            }));

            const chatCompletion = await groq.chat.completions.create({
                messages: groqMessages,
                model: model,
                stream: true,
                temperature: 0.9,
                max_completion_tokens: 8192,
            });

            const encoder = new TextEncoder();
            const stream = new ReadableStream({
                async start(controller) {
                    try {
                        for await (const chunk of chatCompletion) {
                            const content = chunk.choices[0]?.delta?.content || "";
                            if (content) {
                                const data = JSON.stringify({ text: content });
                                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                            }
                        }
                        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                    } catch (err) {
                        console.error("[Groq API] Stream error:", err);
                        const errMsg = err instanceof Error ? err.message : "Stream failed";
                        controller.enqueue(
                            encoder.encode(`data: ${JSON.stringify({ error: errMsg })}\n\n`)
                        );
                    } finally {
                        controller.close();
                    }
                },
            });

            return new Response(stream, {
                headers: {
                    "Content-Type": "text/event-stream; charset=utf-8",
                    "Cache-Control": "no-cache, no-transform",
                    Connection: "keep-alive",
                    "X-Accel-Buffering": "no",
                    "Transfer-Encoding": "chunked",
                },
            });
        }

        // Gemini Logic
        if (!process.env.GEMINI_API_KEY) {
            return Response.json({ error: "GEMINI_API_KEY is not set" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const geminiModel = genAI.getGenerativeModel({
            model,
            generationConfig: {
                maxOutputTokens: 8192,
                temperature: 0.9,
                topP: 0.95,
            },
        });

        // Build history from all previous messages except the last user message
        const historyMessages = messages.slice(0, -1);
        const lastMessage = messages[messages.length - 1];

        // Gemini requires alternating user/model turns starting with user
        const history: Content[] = [];
        for (let i = 0; i < historyMessages.length; i++) {
            const msg = historyMessages[i];
            const geminiRole = msg.role === "assistant" ? "model" : "user";
            if (!msg.content?.trim()) continue;
            history.push({
                role: geminiRole,
                parts: [{ text: msg.content }],
            });
        }

        const chat = geminiModel.startChat({ history });
        const result = await chat.sendMessageStream(lastMessage.content);

        // Stream SSE response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of result.stream) {
                        const text = chunk.text();
                        if (text) {
                            const data = JSON.stringify({ text });
                            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                        }
                    }
                    controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                } catch (err) {
                    console.error("[Gemini API] Stream error:", err);
                    const errMsg = err instanceof Error ? err.message : "Stream failed";
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ error: errMsg })}\n\n`)
                    );
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream; charset=utf-8",
                "Cache-Control": "no-cache, no-transform",
                Connection: "keep-alive",
                "X-Accel-Buffering": "no",
                "Transfer-Encoding": "chunked",
            },
        });

    } catch (error: unknown) {
        console.error("[API] Error:", error);
        let message =
            error instanceof Error ? error.message : "Internal server error";

        if (message.includes("429") || message.includes("Too Many Requests") || message.includes("quota")) {
            message = "⚠️ API Key limit tercapai (Too Many Requests). Silakan tunggu beberapa saat atau perbarui kuota API Key Anda.";
        }

        return Response.json({ error: message }, { status: 500 });
    }
}
