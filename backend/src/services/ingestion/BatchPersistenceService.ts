import { createHash } from "node:crypto";
import { prisma } from "../../utils/prisma";
import { PrismaClient, DataSourceType } from "../../generated/prisma/client";
import type { ScreeningRecordCreateManyInput } from "../../generated/prisma/models/ScreeningRecord";

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

// Kolom yang boleh ditulis ke ScreeningRecord (schema.prisma), selain id/createdAt/session.
// clientToken dan kolom asing lainnya sengaja TIDAK dimasukkan.
const SCREENING_RECORD_FIELDS: ReadonlySet<string> = new Set([
  "shareHash",
  "sessionId",
  "sourceType",
  "sourceBatchId",
  "persona",
  "kelurahan",
  "ageMonths",
  "gender",
  "weightKg",
  "heightCm",
  "isOutsideBontang",
  "zScore",
  "zScoreWAZ",
  "zScoreWHZ",
  "statusGiziTBU",
  "statusGiziBBU",
  "statusGiziBBTB",
  "bblrOption",
  "exclusiveAsi",
  "mpasiAge",
  "animalProtein",
  "cleanWaterAccess",
  "sanitationAccess",
  "smokeExposure",
  "motherEducation",
  "economicQuintile",
  "diarrheaHistory",
  "posyanduKia",
  "riskTier",
  "riskScore",
  "dominantFactors",
  "rawMetadata",
]);

export type ScreeningRecordMeta = {
  shareHash: string;
  sessionId: string;
  sourceType: DataSourceType;
  sourceBatchId: string | null;
};

// Memetakan baris hasil pipeline (validasi + enrichment) ke input createMany
// agar selalu selaras dengan kolom ScreeningRecord di schema.prisma.
export function toScreeningRecordInput(
  row: Record<string, unknown>,
  meta: ScreeningRecordMeta
): Record<string, unknown> {
  const input: Record<string, unknown> = { ...meta };
  for (const key of Object.keys(row)) {
    if (SCREENING_RECORD_FIELDS.has(key) && input[key] === undefined) {
      input[key] = row[key];
    }
  }
  return input;
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

    // Convert string input
    const validSourceType = parseSourceType(sourceType);

    // Cast tx sebagai PrismaClient agar VS Code memaksa membaca semua model
    return await prisma.$transaction(async (txRaw) => {
      const tx = txRaw as PrismaClient;

      // Buat session untuk batch
      const batchSession = await tx.anonymousSession.create({
        data: {
          clientToken: `BATCH_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          persona: 'SURVEYOR_BATCH',
        },
      });

      if (data.length > 0) {
        // Penyiapan data (hanya kolom whitelist ScreeningRecord; clientToken di-drop)
        const insertData = data.map(row =>
          toScreeningRecordInput(row, {
            shareHash: buildShareHash(row),
            sessionId: batchSession.id,
            sourceType: validSourceType,
            sourceBatchId: batchId,
          })
        ) as ScreeningRecordCreateManyInput[];

        // Bulk insert
        const result = await tx.screeningRecord.createMany({
          data: insertData,
          skipDuplicates: true,
        });
        successCount = result.count;
      }

      // Log transaksi
      await tx.ingestionBatchLog.create({
        data: {
          sourceName,
          sourceType: validSourceType,
          totalRecords,
          successCount,
          failedCount: totalRecords - successCount,
        },
      });

      return {
        totalRecords,
        successCount,
        failedCount: totalRecords - successCount,
      };
    });
  }
}