import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { sessionMessages } from "../constants/messages";
import { normalizePersona } from "../utils/normalizePersona";

export const sessionController = {
  async createOrGet(req: Request, res: Response) {
    const { clientToken, persona } = req.body;

    if (!clientToken) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: sessionMessages.clientTokenRequired },
      });
    }

    let session = await prisma.anonymousSession.findUnique({
      where: { clientToken },
    });

    if (!session) {
      session = await prisma.anonymousSession.create({
        data: { clientToken, persona: normalizePersona(persona) },
      });
    }

    res.json({ success: true, sessionId: session.id, clientToken: session.clientToken, persona: session.persona });
  },
};
