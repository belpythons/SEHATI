import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "../config/redis";
import { commonMessages } from "../constants/messages";

// Store terpusat di Redis — supaya rate limit konsisten walau backend
// dijalankan lebih dari satu instance (lihat FDD §7-8).
const makeRedisStore = (prefix: string) =>
  new RedisStore({
    prefix,
    sendCommand: (...args: string[]) =>
      redis.call(args[0], ...args.slice(1)) as Promise<any>,
  });

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: { code: "RATE_LIMITED", message: commonMessages.rateLimitExceeded } },
  standardHeaders: true,
  legacyHeaders: false,
  store: makeRedisStore("rl:default:"),
});

export const ingestRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: { code: "RATE_LIMITED", message: commonMessages.rateLimitExceeded } },
  standardHeaders: true,
  legacyHeaders: false,
  store: makeRedisStore("rl:ingest:"),
});

export const submitRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { success: false, error: { code: "RATE_LIMITED", message: commonMessages.rateLimitExceeded } },
  standardHeaders: true,
  legacyHeaders: false,
  store: makeRedisStore("rl:submit:"),
});

export const chatRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { success: false, error: { code: "RATE_LIMITED", message: commonMessages.rateLimitExceeded } },
  standardHeaders: true,
  legacyHeaders: false,
  store: makeRedisStore("rl:chat:"),
});
