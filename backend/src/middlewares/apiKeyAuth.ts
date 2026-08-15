import { Request, Response, NextFunction } from "express";

export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers["x-api-key"];

  const expectedKey = process.env.GATEWAY_API_KEY;

  if (!expectedKey) {
    return next();
  }

  if (!apiKey || apiKey !== expectedKey) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  next();
};