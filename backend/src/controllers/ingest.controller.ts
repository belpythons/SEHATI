import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { BatchOrchestrator } from "../services/ingestion/BatchOrchestrator";
import { ingestMessages } from "../constants/messages";

export const uploadBatch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sourceType } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: ingestMessages.fileRequired });
    }

    // validasi sourceType
    if (typeof sourceType !== "string" || !["riskesdas", "csv-survey"].includes(sourceType)) {
      return res.status(400).json({ error: ingestMessages.sourceTypeInvalid });
    }

    // Memproses batch
    const result = await BatchOrchestrator.processBatch(
      sourceType,
      file.buffer.toString("utf-8"),
      file.originalname
    );

    const message =
      result.errors && result.errors.length > 0
        ? ingestMessages.partiallyCompleted
        : ingestMessages.batchCompleted;

    return res.status(200).json({
      success: true,
      message,
      data: result,
    });
  } catch (error) {
    logger.error("Ingest error:", error);
    next(error);
  }
};