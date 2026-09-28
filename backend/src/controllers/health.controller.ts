import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { healthMessages } from "../constants/messages";

export const healthCheck = async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      db: "connected",
      message: healthMessages.ok,
    });
  } catch (error) {
    res.status(503).json({
      status: "degraded",
      timestamp: new Date().toISOString(),
      db: "disconnected",
      message: healthMessages.dbDisconnected,
    });
  }
};
