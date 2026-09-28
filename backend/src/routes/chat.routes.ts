import { Router } from "express";
import { chatController } from "../controllers/chat.controller";
import { chatRateLimiter } from "../middlewares/rateLimiter";

const router = Router();

router.get("/stream", chatRateLimiter, chatController.stream);
router.post("/stream", chatRateLimiter, chatController.stream);

export default router;
