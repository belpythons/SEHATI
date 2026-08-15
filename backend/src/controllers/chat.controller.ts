import { Request, Response, NextFunction } from "express";
import { prisma } from "../utils/prisma";
import { logger } from "../utils/logger";

export const chatController = {
  async stream(req: Request, res: Response) {
    const { sessionId, query } = req.query;

    if (!sessionId || !query) {
      return res.status(400).json({ error: "sessionId and query are required" });
    }

    try {
      // Read screening records for this session
      const screenings = await prisma.screeningRecord.findMany({
        where: { sessionId: String(sessionId) },
        orderBy: { createdAt: "desc" },
      });

      // Read health knowledge base entries relevant to riskTier and age
      const riskTier = screenings[0]?.riskTier;
      const ageMonths = screenings[0]?.ageMonths;

      const guidelines = await prisma.healthKnowledgeBase.findMany({
        where: {
          targetAgeGroupMinMonths: { lte: ageMonths },
          targetAgeGroupMaxMonths: { gte: ageMonths },
          OR: [
            { targetRiskTier: riskTier },
            { targetRiskTier: "ALL" },
          ],
        },
      });

      // Build context for Gemini
      const context = {
        screenings,
        guidelines,
        query: String(query),
      };

      // In a full implementation, this would stream via SSE to Gemini
      // For now, return the context as a mock SSE stream
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      res.write(`data: ${JSON.stringify({ type: "init", context })}\n\n`);

      // Mock streaming response
      setTimeout(() => {
        res.write(`data: ${JSON.stringify({ type: "response", text: "Mock response from Gemini" })}\n\n`);
        res.end();
      }, 1000);
    } catch (error) {
      logger.error("Chat stream error:", error);
      res.status(500).json({ error: "Failed to process chat request" });
    }
  },
};