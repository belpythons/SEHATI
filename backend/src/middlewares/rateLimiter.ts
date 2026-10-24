import rateLimit, { MemoryStore } from "express-rate-limit";
import { commonMessages } from "../constants/messages";

// Store in-memory rate-limiter
const makeStore = (_prefix: string) => {
  return new MemoryStore();
};

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: { code: "RATE_LIMITED", message: commonMessages.rateLimitExceeded } },
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore("rl:default:"),
});

export const ingestRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: { code: "RATE_LIMITED", message: commonMessages.rateLimitExceeded } },
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore("rl:ingest:"),
});

export const submitRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { success: false, error: { code: "RATE_LIMITED", message: commonMessages.rateLimitExceeded } },
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore("rl:submit:"),
});

export const chatRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { success: false, error: { code: "RATE_LIMITED", message: commonMessages.rateLimitExceeded } },
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore("rl:chat:"),
});
