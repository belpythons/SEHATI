import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export const sessionController = {
  async createOrGet(req: Request, res: Response) {
    const { clientToken } = req.body;

    if (!clientToken) {
      return res.status(400).json({ error: "clientToken is required" });
    }

    let session = await prisma.anonymousSession.findUnique({
      where: { clientToken },
    });

    if (!session) {
      session = await prisma.anonymousSession.create({
        data: { clientToken, persona: "ORANG_TUA" },
      });
    }

    res.json({ sessionId: session.id, clientToken: session.clientToken });
  },
};