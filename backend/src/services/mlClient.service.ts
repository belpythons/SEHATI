import { mlServiceMessages, screeningMessages } from "../constants/messages";

// ML Prediction Input
export interface MLPredictionResponse {
  zScoreTBU: number;
  zScoreBBU?: number;
  zScoreBBTB?: number;
  statusGiziTBU?: string;
  statusGiziBBU?: string;
  statusGiziBBTB?: string;
  riskTier: string;
  riskScore: number;
  dominantFactors: string[];
  rawMetadata?: any;
}

// ML Prediction Response
export interface MLPredictionInput {
  ageMonths: number;
  gender: string;
  weightKg: number;
  heightCm: number;
  bblrOption?: number;
  exclusiveAsi?: number;
  mpasiAge?: number;
  animalProtein?: number[];
  cleanWaterAccess?: number;
  sanitationAccess?: number;
  smokeExposure?: number;
  motherEducation?: number;
  economicQuintile?: number;
  diarrheaHistory?: number;
  posyanduKia?: number;
  [key: string]: any;
}

const ML_SERVICE_URL =
  process.env.ML_SERVICE_URL || "http://ml-service:8000/api/v1/predict";

const ML_TIMEOUT_MS = Number(process.env.ML_TIMEOUT_MS) || 10000;

// Private helper function
const mapToMLPayload = (data: MLPredictionInput) => {
  // const gender = data.gender === "Laki-Laki" ? "L" : "P";
  const genderUpper = String(data.gender).toUpperCase();
  if (!data || !data.gender){
    throw new Error(screeningMessages.genderInvalid);
  }

  const requiredFields: (keyof MLPredictionInput)[] = [
    "ageMonths",
    "weightKg",
    "heightCm",
    "bblrOption",
    "exclusiveAsi",
    "mpasiAge",
    "cleanWaterAccess",
    "sanitationAccess",
    "smokeExposure",
    "motherEducation",
    "economicQuintile",
    "diarrheaHistory",
    "posyanduKia",
  ]

  // pengecekan
  for (const field of requiredFields){
    if (data[field] === undefined || data[field] === null){
      throw new Error (screeningMessages.attributeRequired(String(field)));
    }
  }

  const gender = genderUpper.startsWith("L") ? "L" : "P";
  return {
    ageMonths: data.ageMonths,
    gender,
    weightKg: data.weightKg,
    heightCm: data.heightCm,

    bblrHistory: Number(data.bblrOption),
    exclusiveAsi: Number(data.exclusiveAsi),
    mpasiAge: Number(data.mpasiAge),
    cleanWaterAccess: Number(data.cleanWaterAccess),
    sanitationAccess: Number(data.sanitationAccess),
    smokeExposure: Number(data.smokeExposure),
    motherEducation: Number(data.motherEducation),
    economicQuintile: Number(data.economicQuintile),
    diarrheaHistory: Number(data.diarrheaHistory),
    posyanduKia: Number(data.posyanduKia),
  };
};

export const mlClient = {
  async predict(screeningData: MLPredictionInput): Promise<MLPredictionResponse> {
    const mlPayload = mapToMLPayload(screeningData);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ML_TIMEOUT_MS);

    try {
      const response = await fetch(ML_SERVICE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mlPayload),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(mlServiceMessages.connectionRefused);
      }
      const result = await response.json();
      console.log(JSON.stringify(result, null, 2));

      return result;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(mlServiceMessages.timeout);
      }
      if (error instanceof TypeError) {
        throw new Error(mlServiceMessages.mlUnreachable);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  },

  //penambahan predictBatch agar bisa menampung request berkali kali secara sekuensial
  async predictBatch(records: MLPredictionInput[]): Promise<MLPredictionResponse[]> {
    const mlPayload = records.map(mapToMLPayload);
    //Pencegahan request gantung
    const  controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ML_TIMEOUT_MS);

    try {
      const response = await fetch(`${ML_SERVICE_URL}/batch`, {
        method: "POST",
        headers: { "content-Type" : "application/json"},
        body: JSON.stringify({ items: mlPayload }),
        signal: controller.signal,
      });

      if(!response.ok){
        const errorBody = await response.text();
        throw new Error (mlServiceMessages.connectionRefused)
      }
      const result = await response.json();
      if(!result){
        throw new Error(mlServiceMessages.predictFailed)
      }
      return result.predict || result;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError"){
        throw new Error (mlServiceMessages.timeout);
      }
      if (error instanceof TypeError){
        throw new Error(mlServiceMessages.mlUnreachable);
      }
      throw error;
    }
  }

};