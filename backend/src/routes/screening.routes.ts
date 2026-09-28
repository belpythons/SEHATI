import { Router } from "express";
import { submitScreening, getByShareHash } from "../controllers/screening.controller";
import { submitRateLimiter } from "../middlewares/rateLimiter";

const router = Router();

// POST /api/v1/screening/submit
router.post("/submit", submitRateLimiter, submitScreening);

// GET /api/v1/screening/share/:shareHash
router.get("/share/:shareHash", getByShareHash);

export default router;
