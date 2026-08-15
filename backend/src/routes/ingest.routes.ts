import { Router } from "express";
import { ingestController } from "../controllers/ingest.controller";
import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

const router = Router();

router.post(
  "/upload/:sourceType",
  upload.single("file"),
  ingestController.upload
);

export default router;