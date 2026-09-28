import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { screeningSchema } from "../validations/screening.schema";
import { findOrCreateSession } from "../services/session.service";
import { resolveKelurahan } from "../services/kelurahan.service";
import { calculateZScores } from "../domain/zscore/zscoreEngine";
import { calculateRisk } from "../domain/risk/weightedRiskEngine";
import { prisma } from "../utils/prisma";
import { redis } from "../config/redis";
import { logger } from "../utils/logger";

const SHARE_CACHE_PREFIX = "screening:share:";

/**
 * Merakit bentuk datar (flat) yang dikonsumsi frontend dari hasil transaksi
 * 4-insert (ScreeningRecord + GrowthAssessment + ScreeningDeterminants +
 * RiskAssessment). Bentuk field & nama HARUS identik dengan view
 * `screening_record_flat` / `frontend/src/types/screening.ts` — lihat FDD §3.
 */
function assembleFlatScreening(parts: {
  record: any;
  kelurahanName: string | null;
  growth: any;
  determinants: any;
  risk: any;
}) {
  const { record, kelurahanName, growth, determinants, risk } = parts;
  return {
    id: record.id,
    shareHash: record.shareHash,
    sessionId: record.sessionId,
    sourceType: record.sourceType,
    sourceBatchId: record.sourceBatchId,
    persona: record.persona,
    kelurahan: kelurahanName ?? record.externalLocationLabel,
    isOutsideBontang: record.isOutsideBontang,
    ageMonths: record.ageMonths,
    gender: record.gender,
    weightKg: record.weightKg,
    heightCm: record.heightCm,
    zScore: growth.zScore,
    zScoreWAZ: growth.zScoreWAZ,
    zScoreWHZ: growth.zScoreWHZ,
    statusGiziTBU: growth.statusGiziTBU,
    statusGiziBBU: growth.statusGiziBBU,
    statusGiziBBTB: growth.statusGiziBBTB,
    bblrOption: determinants.bblrOption,
    exclusiveAsi: determinants.exclusiveAsi,
    mpasiAge: determinants.mpasiAge,
    animalProtein: determinants.animalProtein,
    cleanWaterAccess: determinants.cleanWaterAccess,
    sanitationAccess: determinants.sanitationAccess,
    smokeExposure: determinants.smokeExposure,
    motherEducation: determinants.motherEducation,
    economicQuintile: determinants.economicQuintile,
    diarrheaHistory: determinants.diarrheaHistory,
    posyanduKia: determinants.posyanduKia,
    riskTier: risk.riskTier,
    riskScore: risk.riskScore,
    dominantFactors: risk.dominantFactors,
    rawMetadata: risk.rawMetadata,
    createdAt: record.createdAt,
  };
}

export const submitScreening = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validateData = screeningSchema.parse(req.body);

    const session = await findOrCreateSession(
      validateData.clientToken,
      validateData.persona
    );

    const zscore = calculateZScores({
      ageMonths: validateData.ageMonths,
      gender: validateData.gender,
      weightKg: validateData.weightKg,
      heightCm: validateData.heightCm,
    });

    const risk = calculateRisk({
      zScoreTBU: zscore.zScoreTBU,
      bblrOption: validateData.bblrOption,
      exclusiveAsi: validateData.exclusiveAsi,
      mpasiAge: validateData.mpasiAge,
      animalProtein: validateData.animalProtein,
      cleanWaterAccess: validateData.cleanWaterAccess,
      sanitationAccess: validateData.sanitationAccess,
      smokeExposure: validateData.smokeExposure,
      motherEducation: validateData.motherEducation,
      economicQuintile: validateData.economicQuintile,
      diarrheaHistory: validateData.diarrheaHistory,
      posyanduKia: validateData.posyanduKia,
    });

    const { kelurahanId, externalLocationLabel } = await resolveKelurahan(
      validateData.kelurahan,
      validateData.isOutsideBontang
    );

    const { record, growth, determinants, riskRow } = await prisma.$transaction(
      async (tx) => {
        const record = await tx.screeningRecord.create({
          data: {
            sessionId: session.id,
            sourceType: "PWA_DIRECT_USER",
            persona: validateData.persona,
            kelurahanId,
            externalLocationLabel,
            isOutsideBontang: validateData.isOutsideBontang,
            ageMonths: validateData.ageMonths,
            gender: validateData.gender,
            weightKg: validateData.weightKg,
            heightCm: validateData.heightCm,
          },
        });

        const growth = await tx.growthAssessment.create({
          data: {
            screeningRecordId: record.id,
            zScore: zscore.zScoreTBU,
            zScoreWAZ: zscore.zScoreWAZ,
            zScoreWHZ: zscore.zScoreWHZ,
            statusGiziTBU: zscore.statusGiziTBU,
            statusGiziBBU: zscore.statusGiziBBU,
            statusGiziBBTB: zscore.statusGiziBBTB,
          },
        });

        const determinants = await tx.screeningDeterminants.create({
          data: {
            screeningRecordId: record.id,
            bblrOption: validateData.bblrOption,
            exclusiveAsi: validateData.exclusiveAsi,
            mpasiAge: validateData.mpasiAge,
            animalProtein: validateData.animalProtein,
            cleanWaterAccess: validateData.cleanWaterAccess,
            sanitationAccess: validateData.sanitationAccess,
            smokeExposure: validateData.smokeExposure,
            motherEducation: validateData.motherEducation,
            economicQuintile: validateData.economicQuintile,
            diarrheaHistory: validateData.diarrheaHistory,
            posyanduKia: validateData.posyanduKia,
          },
        });

        // rawMetadata bukan bagian dari screeningSchema (Zod men-strip field
        // tak dikenal) — hanya diisi oleh jalur ingest/seed batch, bukan
        // submit langsung dari PWA.
        const riskRow = await tx.riskAssessment.create({
          data: {
            screeningRecordId: record.id,
            riskTier: risk.riskTier,
            riskScore: risk.riskScore,
            dominantFactors: risk.dominantFactors,
          },
        });

        return { record, growth, determinants, riskRow };
      }
    );

    const flat = assembleFlatScreening({
      record,
      kelurahanName: kelurahanId ? validateData.kelurahan : null,
      growth,
      determinants,
      risk: riskRow,
    });

    // Write-through cache: record immutable, aman disimpan tanpa TTL (lihat FDD §7)
    redis
      .set(`${SHARE_CACHE_PREFIX}${flat.shareHash}`, JSON.stringify(flat))
      .catch((err) => logger.warn("Gagal menulis cache share-hash:", err.message));

    res.status(201).json({
      success: true,
      data: flat,
      shareHash: flat.shareHash,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Data skrining tidak valid.",
          details: error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
      });
      return;
    }
    next(error);
  }
};

export const getByShareHash = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const shareHash = String(req.params.shareHash);
    const cacheKey = `${SHARE_CACHE_PREFIX}${shareHash}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        res.status(200).json({ success: true, data: JSON.parse(cached), shareHash });
        return;
      }
    } catch (err) {
      logger.warn("Redis tidak terjangkau saat baca cache share-hash, lanjut ke DB:", (err as Error).message);
    }

    const rows: any[] = await prisma.$queryRaw`
      SELECT * FROM "screening_record_flat" WHERE "shareHash" = ${shareHash}
    `;
    const record = rows[0];

    if (!record) {
      res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Data skrining tidak ditemukan." },
      });
      return;
    }

    redis
      .set(cacheKey, JSON.stringify(record))
      .catch((err) => logger.warn("Gagal menulis cache share-hash:", err.message));

    res.status(200).json({ success: true, data: record, shareHash: record.shareHash });
  } catch (error) {
    next(error);
  }
};
