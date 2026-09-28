import { createHash, randomUUID } from "node:crypto";
import { prisma } from "../../utils/prisma";
import { PrismaClient, DataSourceType } from "../../generated/prisma/client";
import { normalizePersona } from "../../utils/normalizePersona";
import { loadKelurahanMap } from "../kelurahan.service";

// Pemetaan dari URL parameter ke Prisma Enum
const SOURCE_TYPE_MAP: Record<string, DataSourceType> = {
  "csv-survey": DataSourceType.SURVEY_CSV_UPLOAD,
  "survey-csv": DataSourceType.SURVEY_CSV_UPLOAD,
  "riskesdas": DataSourceType.RISKESDAS_KEMENKES,
};

export function parseSourceType(input: string): DataSourceType {
  const mapped = SOURCE_TYPE_MAP[input.toLowerCase()];
  if (!mapped) {
    throw new Error(`Invalid DataSourceType: ${input}`);
  }
  return mapped;
}

// shareHash deterministik agar upload ulang batch yang sama dapat dideduplikasi
// oleh skipDuplicates (kolom shareHash bersifat UNIQUE).
function buildShareHash(row: any): string {
  const stable = {
    kelurahan: row.kelurahan,
    ageMonths: row.ageMonths,
    gender: row.gender,
    weightKg: row.weightKg,
    heightCm: row.heightCm,
    isOutsideBontang: row.isOutsideBontang,
    bblrOption: row.bblrOption,
    exclusiveAsi: row.exclusiveAsi,
    mpasiAge: row.mpasiAge,
    animalProtein: row.animalProtein,
    cleanWaterAccess: row.cleanWaterAccess,
    sanitationAccess: row.sanitationAccess,
    smokeExposure: row.smokeExposure,
    motherEducation: row.motherEducation,
    economicQuintile: row.economicQuintile,
    diarrheaHistory: row.diarrheaHistory,
    posyanduKia: row.posyanduKia,
  };
  return createHash("sha1").update(JSON.stringify(stable)).digest("base64url").slice(0, 10);
}

// Field yang dipetakan ke masing-masing tabel anak sejak normalisasi skema
// (lihat FDD §3 & migration `normalize_screening_schema`) — dulunya satu
// whitelist Set untuk satu tabel flat, sekarang 4 kelompok untuk 4 tabel.
const CORE_FIELDS = ["persona", "ageMonths", "gender", "weightKg", "heightCm"] as const;
const GROWTH_FIELDS = ["zScore", "zScoreWAZ", "zScoreWHZ", "statusGiziTBU", "statusGiziBBU", "statusGiziBBTB"] as const;
const DETERMINANT_FIELDS = [
  "bblrOption", "exclusiveAsi", "mpasiAge", "animalProtein", "cleanWaterAccess",
  "sanitationAccess", "smokeExposure", "motherEducation", "economicQuintile",
  "diarrheaHistory", "posyanduKia",
] as const;
const RISK_FIELDS = ["riskTier", "riskScore", "dominantFactors", "rawMetadata"] as const;

function pick(row: Record<string, unknown>, fields: readonly string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) if (row[f] !== undefined) out[f] = row[f];
  return out;
}

export class BatchPersistenceService {
  static async saveBatch(
    data: any[],
    sourceType: string,
    sourceName: string,
    batchId: string,
    totalRecords = data.length
  ) {
    let successCount = 0;
    const validSourceType = parseSourceType(sourceType);
    const kelurahanMap = await loadKelurahanMap();

    // maxWait/timeout dinaikkan dari default (2s/5s) karena koneksi ke Supabase
    // pooler (region jauh) kadang butuh lebih lama utk akuisisi koneksi transaksi.
    return await prisma.$transaction(
      async (txRaw) => {
        const tx = txRaw as PrismaClient;

        const batchSession = await tx.anonymousSession.create({
          data: {
            clientToken: `BATCH_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            persona: normalizePersona("SURVEYOR_BATCH"),
          },
        });

        // IngestionBatchLog dibuat LEBIH DULU (id = batchId) karena
        // ScreeningRecord.sourceBatchId sekarang FK sungguhan ke tabel ini
        // (relasi yang dulu hilang — lihat FDD §3). Counts diisi placeholder,
        // di-UPDATE setelah insert selesai.
        await tx.ingestionBatchLog.create({
          data: {
            id: batchId,
            sourceName,
            sourceType: validSourceType,
            totalRecords,
            successCount: 0,
            failedCount: totalRecords,
          },
        });

        if (data.length > 0) {
          const coreRows: any[] = [];
          const growthRows: any[] = [];
          const determinantRows: any[] = [];
          const riskRows: any[] = [];

          for (const row of data) {
            const id = randomUUID();
            const isOutsideBontang = Boolean(row.isOutsideBontang);
            const kelurahanName: string | undefined = row.kelurahan;
            const kelurahanId = !isOutsideBontang && kelurahanName ? kelurahanMap.get(kelurahanName) ?? null : null;
            const externalLocationLabel = kelurahanId ? null : kelurahanName ?? null;

            coreRows.push({
              id,
              shareHash: buildShareHash(row),
              sessionId: batchSession.id,
              sourceType: validSourceType,
              sourceBatchId: batchId,
              kelurahanId,
              externalLocationLabel,
              isOutsideBontang,
              ...pick(row, CORE_FIELDS),
            });
            growthRows.push({ screeningRecordId: id, ...pick(row, GROWTH_FIELDS) });
            determinantRows.push({ screeningRecordId: id, ...pick(row, DETERMINANT_FIELDS) });
            riskRows.push({ screeningRecordId: id, ...pick(row, RISK_FIELDS) });
          }

          const result = await tx.screeningRecord.createMany({
            data: coreRows,
            skipDuplicates: true,
          });
          successCount = result.count;

          // skipDuplicates tidak memberi tahu baris MANA yang di-skip (shareHash
          // bentrok dengan data lama) — insert child hanya untuk id yang benar-
          // benar tersimpan, supaya tidak melanggar FK CASCADE ke ScreeningRecord.
          const saved = await tx.screeningRecord.findMany({
            where: { sourceBatchId: batchId },
            select: { id: true },
          });
          const savedIds = new Set(saved.map((r) => r.id));

          const filteredGrowth = growthRows.filter((r) => savedIds.has(r.screeningRecordId));
          const filteredDeterminants = determinantRows.filter((r) => savedIds.has(r.screeningRecordId));
          const filteredRisk = riskRows.filter((r) => savedIds.has(r.screeningRecordId));

          if (filteredGrowth.length > 0) await tx.growthAssessment.createMany({ data: filteredGrowth });
          if (filteredDeterminants.length > 0) await tx.screeningDeterminants.createMany({ data: filteredDeterminants });
          if (filteredRisk.length > 0) await tx.riskAssessment.createMany({ data: filteredRisk });
        }

        await tx.ingestionBatchLog.update({
          where: { id: batchId },
          data: { successCount, failedCount: totalRecords - successCount },
        });

        return {
          totalRecords,
          successCount,
          failedCount: totalRecords - successCount,
        };
      },
      { maxWait: 10_000, timeout: 30_000 }
    );
  }
}
