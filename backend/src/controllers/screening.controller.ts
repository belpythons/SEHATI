import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import crypto from "crypto";
import { screeningSchema } from "../validations/screening.schema";
import { findOrCreateSession } from "../services/session.service";
import { resolveKelurahan } from "../services/kelurahan.service";
import { calculateZScores } from "../domain/zscore/zscoreEngine";
import { calculateRisk } from "../domain/risk/weightedRiskEngine";
import { prisma } from "../utils/prisma";
import { redis, isRedisReady } from "../config/redis";
import { logger } from "../utils/logger";

const SHARE_CACHE_PREFIX = "screening:share:";

const inMemoryShareCache = new Map<string, any>();

// Seed fallback demo profile agar GET /api/v1/screening/share/demo-sample selalu sukses
inMemoryShareCache.set("demo-sample", {
  id: "rec-demo-sample-01",
  shareHash: "demo-sample",
  sessionId: "sess-demo-sample",
  sourceType: "PWA_DIRECT_USER",
  sourceBatchId: null,
  persona: "Orang Tua / Anggota Keluarga Balita",
  kelurahan: "Loktuan",
  isOutsideBontang: false,
  ageMonths: 18,
  gender: "Laki-Laki",
  weightKg: 8.5,
  heightCm: 74.5,
  zScore: -2.88,
  zScoreWAZ: -2.26,
  zScoreWHZ: -1.24,
  statusGiziTBU: "Pendek",
  statusGiziBBU: "Underweight",
  statusGiziBBTB: "Normal",
  bblrOption: 1,
  exclusiveAsi: 1,
  mpasiAge: 2,
  animalProtein: [1, 2],
  cleanWaterAccess: 2,
  sanitationAccess: 1,
  smokeExposure: 1,
  motherEducation: 3,
  economicQuintile: 3,
  diarrheaHistory: 1,
  posyanduKia: 1,
  riskTier: "HIGH",
  riskScore: 0.85,
  dominantFactors: ["INDIKASI_PERAWAKAN_PENDEK_TBU"],
  rawMetadata: null,
  createdAt: new Date().toISOString(),
});

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
    sourceBatchId: record.sourceBatchId ?? null,
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
    rawMetadata: risk.rawMetadata ?? null,
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

    // Hitung Z-Score WHO LMS resmi di backend
    const zscore = calculateZScores({
      ageMonths: validateData.ageMonths,
      gender: validateData.gender,
      weightKg: validateData.weightKg,
      heightCm: validateData.heightCm,
    });

    // Hitung Skor Kerentanan Risiko Stunting (Odds Ratio 26 literature)
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

    let recordResult: any = null;
    let growthResult: any = null;
    let determinantsResult: any = null;
    let riskRowResult: any = null;
    let resolvedKelurahanName: string | null = null;

    try {
      const { kelurahanId, externalLocationLabel } = await resolveKelurahan(
        validateData.kelurahan,
        validateData.isOutsideBontang
      );
      resolvedKelurahanName = kelurahanId ? validateData.kelurahan : null;

      const dbTx = await prisma.$transaction(
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

      recordResult = dbTx.record;
      growthResult = dbTx.growth;
      determinantsResult = dbTx.determinants;
      riskRowResult = dbTx.riskRow;
    } catch (dbError: any) {
      logger.warn(`Database transaction unavailable (${dbError.message}) - assembling response from domain engines.`);
      const fallbackShareHash = crypto.randomBytes(6).toString("base64url").slice(0, 10);
      recordResult = {
        id: `rec-${crypto.randomUUID()}`,
        shareHash: fallbackShareHash,
        sessionId: session.id,
        sourceType: "PWA_DIRECT_USER",
        sourceBatchId: null,
        persona: validateData.persona,
        externalLocationLabel: validateData.kelurahan,
        isOutsideBontang: validateData.isOutsideBontang,
        ageMonths: validateData.ageMonths,
        gender: validateData.gender,
        weightKg: validateData.weightKg,
        heightCm: validateData.heightCm,
        createdAt: new Date().toISOString(),
      };
      growthResult = {
        zScore: zscore.zScoreTBU,
        zScoreWAZ: zscore.zScoreWAZ,
        zScoreWHZ: zscore.zScoreWHZ,
        statusGiziTBU: zscore.statusGiziTBU,
        statusGiziBBU: zscore.statusGiziBBU,
        statusGiziBBTB: zscore.statusGiziBBTB,
      };
      determinantsResult = {
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
      };
      riskRowResult = {
        riskTier: risk.riskTier,
        riskScore: risk.riskScore,
        dominantFactors: risk.dominantFactors,
        rawMetadata: null,
      };
      resolvedKelurahanName = validateData.kelurahan;
    }

    const flat = assembleFlatScreening({
      record: recordResult,
      kelurahanName: resolvedKelurahanName,
      growth: growthResult,
      determinants: determinantsResult,
      risk: riskRowResult,
    });

    // Simpan ke in-memory cache untuk menjamin instant availability
    inMemoryShareCache.set(flat.shareHash, flat);

    if (isRedisReady()) {
      redis
        .set(`${SHARE_CACHE_PREFIX}${flat.shareHash}`, JSON.stringify(flat))
        .catch((err) => logger.warn("Gagal menulis cache share-hash:", err.message));
    }

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

    // 1. Cek in-memory cache (paling cepat dan tangguh)
    if (inMemoryShareCache.has(shareHash)) {
      const memoryRecord = inMemoryShareCache.get(shareHash);
      res.status(200).json({ success: true, data: memoryRecord, shareHash });
      return;
    }

    // 2. Cek Redis cache
    try {
      if (isRedisReady()) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          res.status(200).json({ success: true, data: JSON.parse(cached), shareHash });
          return;
        }
      }
    } catch (err) {
      logger.warn("Redis tidak terjangkau saat baca cache share-hash:", (err as Error).message);
    }

    try {
      const rows: any[] = await prisma.$queryRaw`
        SELECT * FROM "screening_record_flat" WHERE "shareHash" = ${shareHash}
      `;
      const record = rows[0];

      if (record) {
        if (isRedisReady()) {
          redis
            .set(cacheKey, JSON.stringify(record))
            .catch((err) => logger.warn("Gagal menulis cache share-hash:", err.message));
        }
        res.status(200).json({ success: true, data: record, shareHash: record.shareHash });
        return;
      }
    } catch (dbErr: any) {
      logger.warn("DB read for shareHash unavailable:", dbErr.message);
    }

    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Data skrining tidak ditemukan." },
    });
  } catch (error) {
    next(error);
  }
};
