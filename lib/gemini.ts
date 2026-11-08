import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY!;

export const genAI = new GoogleGenerativeAI(apiKey);

export const DEFAULT_MODEL = "gemini-3.5-flash-lite";

export const getModel = (modelName: string = DEFAULT_MODEL) => {
    return genAI.getGenerativeModel({ model: modelName });
};
