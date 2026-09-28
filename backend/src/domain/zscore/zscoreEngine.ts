/**
 * Mesin Z-Score WHO 2006 — menggantikan ml-service (FastAPI) sepenuhnya.
 * Murni fungsi (tanpa I/O), memakai tabel LMS resmi WHO (lihat whoLmsTables.ts).
 *
 * Formula LMS standar WHO:
 *   Z = ((X/M)^L - 1) / (L*S)   bila L != 0
 *   Z = ln(X/M) / S             bila L == 0
 */
import { getLhfaParams, getWfaParams, getWfhwflParams, Gender, LMSParams } from "./whoLmsTables";

export interface ZscoreInput {
  ageMonths: number;
  gender: "L" | "P" | "Laki-Laki" | "Perempuan";
  weightKg: number;
  heightCm: number;
}

export interface ZscoreResult {
  zScoreTBU: number;
  zScoreWAZ: number;
  zScoreWHZ: number;
  statusGiziTBU: "Sangat Pendek" | "Pendek" | "Normal" | "Tinggi";
  statusGiziBBU: "Severely Underweight" | "Underweight" | "Normal" | "Risiko BB Lebih";
  statusGiziBBTB: "Severely Wasted" | "Wasted" | "Normal" | "Overweight/Obesitas";
}

function toGenderCode(gender: ZscoreInput["gender"]): Gender {
  return gender === "L" || gender === "Laki-Laki" ? "male" : "female";
}

function lmsZScore(x: number, { L, M, S }: LMSParams): number {
  const raw = L !== 0 ? (Math.pow(x / M, L) - 1) / (L * S) : Math.log(x / M) / S;
  return Math.round(raw * 100) / 100;
}

function classifyTBU(z: number): ZscoreResult["statusGiziTBU"] {
  if (z < -3.0) return "Sangat Pendek";
  if (z < -2.0) return "Pendek";
  if (z <= 3.0) return "Normal";
  return "Tinggi";
}

function classifyBBU(z: number): ZscoreResult["statusGiziBBU"] {
  if (z < -3.0) return "Severely Underweight";
  if (z < -2.0) return "Underweight";
  if (z <= 1.0) return "Normal";
  return "Risiko BB Lebih";
}

function classifyBBTB(z: number): ZscoreResult["statusGiziBBTB"] {
  if (z < -3.0) return "Severely Wasted";
  if (z < -2.0) return "Wasted";
  if (z <= 1.0) return "Normal";
  return "Overweight/Obesitas";
}

export function calculateZScores(input: ZscoreInput): ZscoreResult {
  const gender = toGenderCode(input.gender);
  const { ageMonths, weightKg, heightCm } = input;

  const zScoreTBU = lmsZScore(heightCm, getLhfaParams(gender, ageMonths));
  const zScoreWAZ = lmsZScore(weightKg, getWfaParams(gender, ageMonths));
  const zScoreWHZ = lmsZScore(weightKg, getWfhwflParams(gender, ageMonths, heightCm));

  return {
    zScoreTBU,
    zScoreWAZ,
    zScoreWHZ,
    statusGiziTBU: classifyTBU(zScoreTBU),
    statusGiziBBU: classifyBBU(zScoreWAZ),
    statusGiziBBTB: classifyBBTB(zScoreWHZ),
  };
}
