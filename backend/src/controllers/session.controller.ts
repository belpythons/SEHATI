import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { sessionMessages } from "../constants/messages";
import { normalizePersona } from "../utils/normalizePersona";
import { logger } from "../utils/logger";

export const sessionController = {
  async createOrGet(req: Request, res: Response) {
    const { clientToken, persona } = req.body;

    if (!clientToken) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: sessionMessages.clientTokenRequired },
      });
    }

    const canonicalPersona = normalizePersona(persona);

    try {
      let session = await prisma.anonymousSession.findUnique({
        where: { clientToken },
      });

      if (!session) {
        session = await prisma.anonymousSession.create({
          data: { clientToken, persona: canonicalPersona },
        });
      }

      return res.json({ success: true, sessionId: session.id, clientToken: session.clientToken, persona: session.persona });
    } catch (err: any) {
      logger.warn(`Database session query unavailable (${err.message}) - returning resilient session info.`);
      return res.json({
        success: true,
        sessionId: `sess-${clientToken.slice(0, 12)}`,
        clientToken,
        persona: canonicalPersona,
      });
    }
  },
};
