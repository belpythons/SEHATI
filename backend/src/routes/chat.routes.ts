import { Router } from "express";
import { chatController } from "../controllers/chat.controller";

const router = Router();

router.get("/stream", chatController.stream);
router.post("/stream", chatController.stream);

export default router;