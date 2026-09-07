import { Router } from "express";
import multer from "multer";
import { uploadBatch } from "../controllers/ingest.controller";
import { apiKeyAuth } from "../middlewares/apiKeyAuth";
import { ingestRateLimiter } from "../middlewares/rateLimiter";
import { ingestMessages } from "../constants/messages";

const ALLOWED_EXTENSIONS = [".json", ".csv"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, 
  },
  fileFilter: (_req, file, cb) => {
    const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf("."));
    if (ALLOWED_EXTENSIONS.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(ingestMessages.fileInvalidExtension));
    }
  },
});

const router = Router();

router.post(
  "/upload/:sourceType",
  ingestRateLimiter,
  apiKeyAuth,
  (req, res, next) => {
    upload.single("file")(req, res, (err: any) => {
      if (!err) return next();
      if (err?.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ error: ingestMessages.fileTooLarge });
      }
      return res.status(400).json({ error: err?.message || ingestMessages.fileRequired });
    });
  },
  uploadBatch
);

export default router;