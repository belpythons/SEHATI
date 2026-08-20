import { Router } from "express";
import { submitScreening } from "../controllers/screening.controller";

const router = Router();

// Post /api/v1/ning/submit
router.post("/submit", submitScreening );

export default router;
