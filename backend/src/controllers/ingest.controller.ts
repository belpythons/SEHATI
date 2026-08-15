import { Request, Response, NextFunction } from "express";
import { prisma } from "../utils/prisma";
import fs from "fs";
import path from "path";
import { logger } from "../utils/logger";

interface IDataTransformer {
  transform(raw: any): any[];
}

class RiskesdasAdapter implements IDataTransformer {
  transform(raw: any[]): any[] {
    return raw.map((record) => ({
      clientToken: record.clientToken,
      persona: record.persona || "ORANG_TUA",
      kelurahan: record.kelurahan,
      ageMonths: record.ageMonths,
      gender: record.gender,
      weightKg: record.weightKg,
      heightCm: record.heightCm,
      exclusiveAsi: record.exclusiveAsi,
      sanitationAccess: record.sanitationAccess,
      cleanWaterAccess: record.cleanWaterAccess,
      smokeExposure: record.smokeExposure,
      economicQuintile: record.economicQuintile,
      diarrheaHistory: record.diarrheaHistory,
      sourceType: "RISKESDAS_KEMENKES",
      sourceBatchId: record.sourceBatchId,
    }));
  }
}

class CsvSurveyAdapter implements IDataTransformer {
  transform(raw: any[]): any[] {
    return raw.map((record) => ({
      clientToken: record.clientToken,
      persona: record.persona || "ORANG_TUA",
      kelurahan: record.kelurahan,
      ageMonths: record.ageMonths,
      gender: record.gender,
      weightKg: record.weightKg,
      heightCm: record.heightCm,
      exclusiveAsi: record.exclusiveAsi,
      sanitationAccess: record.sanitationAccess,
      cleanWaterAccess: record.cleanWaterAccess,
      smokeExposure: record.smokeExposure,
      economicQuintile: record.economicQuintile,
      diarrheaHistory: record.diarrheaHistory,
      sourceType: "SURVEY_CSV_UPLOAD",
      sourceBatchId: record.sourceBatchId,
    }));
  }
}

export const ingestController = {
  async upload(req: Request, res: Response) {
    const { sourceType } = req.params;
    const apiKey = req.headers["x-api-key"];

    const expectedKey = process.env.GATEWAY_API_KEY;
    if (!expectedKey || apiKey !== expectedKey) {
      return res.status(401).json({ error: "Invalid or missing API key" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let transformer: IDataTransformer;

    if (sourceType === "riskesdas") {
      transformer = new RiskesdasAdapter();
    } else if (sourceType === "csv-survey") {
      transformer = new CsvSurveyAdapter();
    } else {
      return res.status(400).json({ error: "Invalid sourceType" });
    }

    try {
      const filePath = req.file.path;
      const rawData = fs.readFileSync(filePath, "utf-8");
      const records = JSON.parse(rawData); // simplified - would use csv-parser in production
      const transformedRecords = transformer.transform(records);

      const session = await prisma.anonymousSession.findFirst();

      const createdRecords = await prisma.screeningRecord.createManyAndReturn({
        data: transformedRecords.map((r) => ({
          ...r,
          sessionId: session?.id,
          persona: r.persona || "ORANG_TUA",
        })),
      });

      await prisma.ingestionBatchLog.create({
        data: {
          sourceName: req.file.originalname,
          sourceType: sourceType as any,
          totalRecords: transformedRecords.length,
          successCount: createdRecords.length,
          failedCount: transformedRecords.length - createdRecords.length,
        },
      });

      res.json({
        message: "Batch upload completed",
        successCount: createdRecords.length,
        failedCount: transformedRecords.length - createdRecords.length,
      });
    } catch (error) {
      logger.error("Ingest error:", error);
      res.status(500).json({ error: "Failed to process ingestion" });
    }
  },
};