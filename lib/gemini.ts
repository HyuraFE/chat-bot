import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY!;

export const genAI = new GoogleGenerativeAI(apiKey);

export const getModel = (modelName: string = "gemini-3.0-flash") => {
    return genAI.getGenerativeModel({ model: modelName });
};

export const AVAILABLE_MODELS = [
    { id: "gemini-3.0-flash", name: "Gemini 3 Flash", description: "Standard generation" },
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", description: "Fast & balanced" },
];
