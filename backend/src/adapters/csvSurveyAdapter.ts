import { IDataTransformer } from "./interfaces/IDataTransformer";

export class CsvSurveyAdapter implements IDataTransformer {
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