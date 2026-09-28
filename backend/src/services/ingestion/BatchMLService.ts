import { ingestMessages } from "../../constants/messages";
import { calculateZScores } from "../../domain/zscore/zscoreEngine";
import { calculateRisk } from "../../domain/risk/weightedRiskEngine";

/**
 * Menghitung Z-Score & skor risiko in-process (zscoreEngine + weightedRiskEngine)
 * — menggantikan pemanggilan ml-service (FastAPI) sepenuhnya, lihat FDD §5-6.
 */
export class BatchMlService {
  static async enrichWithML(row: any): Promise<any> {
    // Jika baris sudah membawa hasil komputasi resmi (mis. dari sumber Riskesdas
    // yang sudah punya Z-Score/status gizi Kemenkes), tidak perlu dihitung ulang.
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

    if (isNaN(ageMonths) || isNaN(weightKg) || isNaN(heightCm)) {
      throw new Error(`${ingestMessages.invalidNumericValues} (data: ${JSON.stringify(row)})`);
    }

    const zscore = calculateZScores({ ageMonths, gender: row.gender, weightKg, heightCm });
    const risk = calculateRisk({
      zScoreTBU: zscore.zScoreTBU,
      bblrOption: Number(row.bblrOption),
      exclusiveAsi: Number(row.exclusiveAsi),
      mpasiAge: Number(row.mpasiAge),
      animalProtein: Array.isArray(row.animalProtein) ? row.animalProtein : [],
      cleanWaterAccess: Number(row.cleanWaterAccess),
      sanitationAccess: Number(row.sanitationAccess),
      smokeExposure: Number(row.smokeExposure),
      motherEducation: Number(row.motherEducation),
      economicQuintile: Number(row.economicQuintile),
      diarrheaHistory: Number(row.diarrheaHistory),
      posyanduKia: Number(row.posyanduKia),
    });

    return {
      ...row,
      zScore: zscore.zScoreTBU,
      zScoreWAZ: zscore.zScoreWAZ,
      zScoreWHZ: zscore.zScoreWHZ,
      statusGiziTBU: zscore.statusGiziTBU,
      statusGiziBBU: zscore.statusGiziBBU,
      statusGiziBBTB: zscore.statusGiziBBTB,
      riskTier: risk.riskTier,
      riskScore: risk.riskScore,
      dominantFactors: risk.dominantFactors,
    };
  }
}

export const batchMlService = new BatchMlService();
