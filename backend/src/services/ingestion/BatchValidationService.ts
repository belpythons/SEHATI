import { screeningSchema } from "../../validations/screening.schema";

// komputasi ML untuk data yang sudah memiliki hasil
const ML_PRECOMPUTED_FIELDS: ReadonlyArray<string> = [
  "zScore",
  "zScoreWAZ",
  "zScoreWHZ",
  "statusGiziTBU",
  "statusGiziBBU",
  "statusGiziBBTB",
  "riskTier",
  "riskScore",
  "dominantFactors",
];

// pintu pemeriksaan kualitas data
export class BatchValidationService {
  static validateRow(row: any): { valid: boolean; data?: any; errors?: string[] } {
    const result = screeningSchema.safeParse(row);
    // jika gagal validasi
    if (!result.success) {
      return {
        valid: false,
        errors: result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`),
      };
    }

    const data: Record<string, any> = { ...result.data };
    for (const field of ML_PRECOMPUTED_FIELDS) {
      if (row[field] !== undefined && row[field] !== null) {
        data[field] = row[field];
      }
    }
    return { valid: true, data };
  }
}