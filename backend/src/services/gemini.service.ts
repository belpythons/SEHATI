import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { logger } from "../utils/logger";

export interface StreamChatParams {
  systemInstruction?: string;
  query: string;
  history?: Array<{ role: "user" | "model"; text: string }>;
  model?: string;
}

export interface GenerateResponseParams {
  systemInstruction?: string;
  query: string;
  model?: string;
}

const DEFAULT_MODELS = ["gemini-3.6-flash", "gemini-3.5-flash"];

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured in backend environment variables."
    );
  }
  return new GoogleGenAI({ apiKey });
}

export const geminiService = {
  /**
   * Check if Gemini API key is configured
   */
  isConfigured(): boolean {
    return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  },

  /**
   * Stream response from Google Gemini API using @google/genai SDK
   */
  async *streamChat(params: StreamChatParams): AsyncGenerator<string, void, unknown> {
    const {
      systemInstruction,
      query,
      history = [],
      model = process.env.GEMINI_MODEL || "gemini-3.6-flash",
    } = params;

    const ai = getGeminiClient();

    // Prepare contents payload with conversation history if available
    const contents: any[] = [];

    if (history.length > 0) {
      for (const msg of history) {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        });
      }
    }

    // Append latest user query
    contents.push({
      role: "user",
      parts: [{ text: query }],
    });

    const candidateModels = [
      model,
      ...DEFAULT_MODELS.filter((m) => m !== model),
    ];

    let lastError: any = null;

    for (const candidateModel of candidateModels) {
      try {
        const responseStream = await ai.models.generateContentStream({
          model: candidateModel,
          contents,
          config: systemInstruction
            ? {
                systemInstruction,
                temperature: 0.7,
              }
            : {
                temperature: 0.7,
              },
        });

        for await (const chunk of responseStream) {
          if (chunk.text) {
            yield chunk.text;
          }
        }
        return;
      } catch (error: any) {
        lastError = error;
        logger.warn(`Gemini streaming failed with model ${candidateModel}:`, error?.message || error);
        // If it's a 404 model not found, try the next model candidate
        if (error?.status === 404 || error?.statusCode === 404 || error?.message?.includes("404") || error?.message?.includes("not found")) {
          continue;
        }
        throw error;
      }
    }

    if (lastError) {
      throw lastError;
    }
  },

  /**
   * Non-streaming response generator (fallback or single completion)
   */
  async generateResponse(params: GenerateResponseParams): Promise<string> {
    const {
      systemInstruction,
      query,
      model = process.env.GEMINI_MODEL || "gemini-3.6-flash",
    } = params;

    const ai = getGeminiClient();
    const candidateModels = [
      model,
      ...DEFAULT_MODELS.filter((m) => m !== model),
    ];

    let lastError: any = null;

    for (const candidateModel of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: candidateModel,
          contents: query,
          config: systemInstruction
            ? {
                systemInstruction,
                temperature: 0.7,
              }
            : undefined,
        });

        return response.text || "";
      } catch (error: any) {
        lastError = error;
        if (error?.status === 404 || error?.message?.includes("404")) {
          continue;
        }
        throw error;
      }
    }

    throw lastError;
  },
};