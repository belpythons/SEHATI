import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const geminiService = {
  async generateResponse(messages: any[]) {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: messages,
    });

    return result.text;
  },
};