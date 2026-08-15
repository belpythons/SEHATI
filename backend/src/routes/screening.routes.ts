import { Router } from "express";
import { screeningController } from "../controllers/screening.controller";

const router = Router();

router.post("/submit", screeningController.submit);

export default router;