import { ingestMessages, mlServiceMessages } from "../../constants/messages";
import { mlClient } from "../mlClient.service";

export class BatchMlService {
  static async enrichWithML(
    row: any,
    predict: typeof mlClient.predict = mlClient.predict
  ): Promise<any> {
    // Jika baris sudah membawa hasil komputasi ML (mis. dari sumber Riskesdas),
    // tidak perlu menghitung ulang.
    if (
      row.zScore !== undefined &&
      row.zScore !== null &&
      row.riskTier !== undefined &&
      row.riskScore !== undefined &&
      row.riskScore !== null
    ) {
      return row;
    }

    const ageMonths = Number(row.ageMonths);
    const weightKg = Number(row.weightKg);
    const heightCm = Number(row.heightCm);

    // jika salah satu dari nilai ini bukan angka akan error
    if (isNaN(ageMonths) || isNaN(weightKg) || isNaN(heightCm)) {
      throw new Error(`${ingestMessages.invalidNumericValues} (data: ${JSON.stringify(row)})`);
    }

    try {
      const mlResult = await predict({
        ageMonths,
        gender: row.gender,
        weightKg,
        heightCm,
      });

      // validasi ML
      if (mlResult.zScoreTBU === undefined || mlResult.riskTier === undefined) {
        throw new Error(mlServiceMessages.missingRequiredFields);
      }

      return {
        ...row,
        zScore: mlResult.zScoreTBU,
        zScoreWAZ: mlResult.zScoreBBU ?? null,
        zScoreWHZ: mlResult.zScoreBBTB ?? null,
        statusGiziTBU: mlResult.statusGiziTBU ?? null,
        statusGiziBBU: mlResult.statusGiziBBU ?? null,
        statusGiziBBTB: mlResult.statusGiziBBTB ?? null,
        riskTier: mlResult.riskTier,
        riskScore: mlResult.riskScore,
        dominantFactors: mlResult.dominantFactors ?? [],
      };
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : String(error);
      throw new Error(message);
    }
  }
}

export const batchMlService = new BatchMlService();