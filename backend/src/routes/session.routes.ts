import { Router } from "express";
import { sessionController } from "../controllers/session.controller";

const router = Router();

router.post("/", sessionController.createOrGet);

export default router;