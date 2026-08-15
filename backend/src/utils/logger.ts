export const logger = {
  info: (message: string, context?: unknown) => {
    console.info(`[INFO] ${message}`, context ?? "");
  },
  error: (message: string, context?: unknown) => {
    console.error(`[ERROR] ${message}`, context ?? "");
  },
  warn: (message: string, context?: unknown) => {
    console.warn(`[WARN] ${message}`, context ?? "");
  },
};