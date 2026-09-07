import rateLimit from "express-rate-limit";
import { commonMessages } from "../constants/messages";

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: commonMessages.rateLimitExceeded },
  standardHeaders: true,
  legacyHeaders: false,
});

export const ingestRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: commonMessages.rateLimitExceeded },
  standardHeaders: true,
  legacyHeaders: false,
});