import { IDataTransformer } from "./interfaces/IDataTransformer";
import { ingestMessages } from "../constants/messages";
import {
  normalizeBoolean,
  normalizeGender,
  normalizeKelurahan,
  toNumberOrElse,
} from "../utils/normalization";

// Kolom wajib yang harus ada pada setiap baris data survei CSV/JSON
const REQUIRED_HEADERS = ["kelurahan", "ageMonths", "gender", "weightKg", "heightCm"];

export class CsvSurveyAdapter implements IDataTransformer {
  transform(raw: any[]): any[] {
    if (raw.length === 0) return [];

    const missing = REQUIRED_HEADERS.filter(
      (key) => raw[0][key] === undefined || raw[0][key] === null || raw[0][key] === ""
    );
    if (missing.length > 0) {
      throw new Error(ingestMessages.csvHeaderInvalid);
    }

    return raw.map((record) => {
      // Handling khusus untuk animalProtein 
      const animalProteinRaw = record.animalProtein ?? record.animal_protein ?? [];
      const animalProteinValues = Array.isArray(animalProteinRaw) ? animalProteinRaw : [animalProteinRaw];
      const animalProtein = animalProteinValues
        .map((n: unknown) => toNumberOrElse(n, 5))
        .filter((n: number) => n >= 1 && n <= 5);

      // Fallback default jika array kosong atau isinya tidak valid
      const finalAnimalProtein = animalProtein.length > 0 ? animalProtein : [5]; // 5 = Sangat Jarang

      return {
        // Pertahankan kolom ekstra 
        ...record,

        // clientToken: Opsional, dibuatkan default unik jika tidak ada
        clientToken: record.clientToken || `CSV_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        persona: record.persona || "ORANG_TUA",
        kelurahan: normalizeKelurahan(record.kelurahan),
        ageMonths: toNumberOrElse(record.ageMonths, 0),
        gender: normalizeGender(record.gender),
        weightKg: toNumberOrElse(record.weightKg, 1.0),
        heightCm: toNumberOrElse(record.heightCm, 30.0),
        isOutsideBontang: normalizeBoolean(record.isOutsideBontang),

        // Field Determinan kesehatan
        bblrOption: toNumberOrElse(record.bblrOption, 1),
        exclusiveAsi: toNumberOrElse(record.exclusiveAsi, 1),
        mpasiAge: toNumberOrElse(record.mpasiAge, 2),
        animalProtein: finalAnimalProtein,
        cleanWaterAccess: toNumberOrElse(record.cleanWaterAccess, 1),
        sanitationAccess: toNumberOrElse(record.sanitationAccess, 1),
        smokeExposure: toNumberOrElse(record.smokeExposure, 1),
        motherEducation: toNumberOrElse(record.motherEducation, 1),
        economicQuintile: toNumberOrElse(record.economicQuintile, 1),
        diarrheaHistory: toNumberOrElse(record.diarrheaHistory, 1),
        posyanduKia: toNumberOrElse(record.posyanduKia, 2),

        sourceType: "SURVEY_CSV_UPLOAD",
        sourceBatchId: record.sourceBatchId ?? null,
      };
    });
  }
}