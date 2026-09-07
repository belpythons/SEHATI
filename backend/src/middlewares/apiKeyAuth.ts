import { Request, Response, NextFunction } from "express";
import { ingestMessages } from "../constants/messages";

export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers["x-api-key"];
  const expectedKey = process.env.GATEWAY_API_KEY;

  if (!apiKey) {
    return res.status(401).json({ error: ingestMessages.apiKeyMissing });
  }

  if (!expectedKey || apiKey !== expectedKey) {
    return res.status(401).json({ error: ingestMessages.apiKeyInvalid });
  }

  next();
};