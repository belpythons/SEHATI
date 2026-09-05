import { mlServiceMessages } from "../constants/messages";

// ML Prediction Input
export interface MLPredictionResponse {
  zScore: number;
  zScoreWAZ?: number;
  zScoreWHZ?: number;
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
}

const ML_SERVICE_URL =
  process.env.ML_SERVICE_URL || "http://ml-service:8000/api/v1/predict";

const ML_TIMEOUT_MS = Number(process.env.ML_TIMEOUT_MS) || 10000;

// Private helper function
const mapToMLPayload = (data: MLPredictionInput) => {
  const gender = data.gender === "Laki-Laki" ? "L" : "P";
  return {
    ageMonths: data.ageMonths,
    gender,
    weightKg: data.weightKg,
    heightCm: data.heightCm,
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
        throw new Error(`ML service error: ${response.status} - ${errorBody}`);
      }
      const result = await response.json();
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
};