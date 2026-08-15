import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import fetch from "node-fetch";
import { logger } from "../utils/logger";

export const screeningController = {
  async submit(req: Request, res: Response) {
    const payload = req.body;

    try {
      const { clientToken, ...screeningData } = payload;

      let session = await prisma.anonymousSession.findUnique({
        where: { clientToken },
      });

      if (!session) {
        session = await prisma.anonymousSession.create({
          data: { clientToken, persona: "ORANG_TUA" },
        });
      }

      // Call ML microservice for Z-Score calculation
      const mlResponse = await fetch("http://ml-service:8000/api/v1/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(screeningData),
      });

      const mlResult: any = await mlResponse.json();

      const screeningRecord = await prisma.screeningRecord.create({
        data: {
          sessionId: session.id,
          sourceType: screeningData.sourceType || "PWA_DIRECT_USER",
          persona: screeningData.persona || "ORANG_TUA",
          kelurahan: screeningData.kelurahan,
          ageMonths: screeningData.ageMonths,
          gender: screeningData.gender,
          weightKg: screeningData.weightKg,
          heightCm: screeningData.heightCm,
          zScore: mlResult.zScore,
          zScoreWAZ: mlResult.zScoreWAZ,
          zScoreWHZ: mlResult.zScoreWHZ,
          statusGiziTBU: mlResult.statusGiziTBU,
          statusGiziBBU: mlResult.statusGiziBBU,
          statusGiziBBTB: mlResult.statusGiziBBTB,
          exclusiveAsi: screeningData.exclusiveAsi,
          sanitationAccess: screeningData.sanitationAccess,
          cleanWaterAccess: screeningData.cleanWaterAccess,
          smokeExposure: screeningData.smokeExposure,
          economicQuintile: screeningData.economicQuintile,
          diarrheaHistory: screeningData.diarrheaHistory,
          riskTier: mlResult.riskTier,
          riskScore: mlResult.riskScore,
          dominantFactors: mlResult.dominantFactors,
          rawMetadata: mlResult.rawMetadata,
        },
      });

      res.status(201).json({
        data: screeningRecord,
        shareHash: screeningRecord.shareHash,
      });
    } catch (error) {
      logger.error("Screening error:", error);
      res.status(500).json({ error: "Failed to process screening" });
    }
  },
};