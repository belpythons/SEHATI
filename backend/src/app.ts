import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { prisma } from "./utils/prisma";
import path from "path";
import fs from "fs";
import { logger } from "./utils/logger";
import sessionRoutes from "./routes/session.routes";
import screeningRoutes from "./routes/screening.routes";
import chatRoutes from "./routes/chat.routes";
import ingestRoutes from "./routes/ingest.routes";
import healthRoutes from "./routes/health.routes";

const app = express();

app.use(helmet());
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
  : ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "10kb" }));
app.use(morgan("combined"));

app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/screening", screeningRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/ingest", ingestRoutes);
app.use("/api/v1/session", sessionRoutes);

// Sajikan build frontend (SPA) jika tersedia (Production / Unified Hosting)
const frontendDist = path.resolve(__dirname, "../../frontend/dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get("*", (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

app.use(
  (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error(err.message, err.stack);
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan pada server." },
    });
  }
);

export { app };