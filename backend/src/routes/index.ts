import { Router } from "express";
import sessionRoutes from "./session.routes";
import screeningRoutes from "./screening.routes";
import chatRoutes from "./chat.routes";
import ingestRoutes from "./ingest.routes";
import healthRoutes from "./health.routes";

const router = Router();

router.use("/api/v1/session", sessionRoutes);
router.use("/api/v1/screening", screeningRoutes);
router.use("/api/v1/chat", chatRoutes);
router.use("/api/v1/ingest", ingestRoutes);
router.use("/api/v1/health", healthRoutes);

export default router;