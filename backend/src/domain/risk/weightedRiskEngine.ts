/**
 * Mesin skor risiko stunting — weighted multi-determinant scoring.
 *
 * PIVOT DARI RENCANA AWAL (lihat FDD §6 revisi): rencana semula melatih
 * Naive Bayes dari 130.620 baris Riskesdas riil. Setelah file sumber
 * diperiksa, ternyata hanya ~20 baris yang benar-benar berisi data (sisanya
 * baris kosong sampai dimensi sheet yang dideklarasikan) — jauh di bawah
 * volume minimum untuk melatih model statistik yang valid. Atas keputusan
 * pemilik proyek, skema risiko diganti ke weighted-rule engine yang
 * dikalibrasi dari proporsi kemunculan tiap faktor di 26 studi literatur
 * (`literatureWeights.ts`), BUKAN Naive Bayes yang benar-benar dilatih.
 * Didokumentasikan apa adanya di sini dan di FDD — bukan diklaim sebagai ML.
 *
 * Struktur kondisi per-faktor mengikuti pola yang sudah divalidasi produk di
 * `frontend/src/lib/mockApi.ts` (`calculateRiskAssessment`), hanya amplitudo
 * tiap faktor dihitung ulang dari `LITERATURE_FACTOR_PROPORTION` alih-alih
 * angka yang ditebak manual.
 */
import { RiskTier } from "./determinantCodes";
import { LITERATURE_FACTOR_PROPORTION, LITERATURE_SCALE } from "./literatureWeights";

export interface RiskEngineInput {
  zScoreTBU: number;
  bblrOption: number;
  exclusiveAsi: number;
  mpasiAge: number;
  animalProtein: number[];
  cleanWaterAccess: number;
  sanitationAccess: number;
  smokeExposure: number;
  motherEducation: number;
  economicQuintile: number;
  diarrheaHistory: number;
  posyanduKia: number;
}

export interface RiskEngineResult {
  riskScore: number;
  riskTier: RiskTier;
  dominantFactors: string[];
}

function weight(factor: keyof typeof LITERATURE_FACTOR_PROPORTION): number {
  return LITERATURE_FACTOR_PROPORTION[factor] * LITERATURE_SCALE;
}

interface Contribution {
  points: number;
  label?: string;
}

function scoreBblrOption(v: number): Contribution {
  const w = weight("bblrOption");
  if (v === 2) return { points: w, label: "RIWAYAT_BBLR" };
  if (v === 3) return { points: w * 0.333 };
  return { points: 0 };
}

function scoreExclusiveAsi(v: number): Contribution {
  const w = weight("exclusiveAsi");
  if (v === 2) return { points: w, label: "TIDAK_ASI_EKSKLUSIF" };
  return { points: 0 };
}

function scoreMpasiAge(v: number): Contribution {
  const w = weight("mpasiAge");
  if (v === 1) return { points: w, label: "MPASI_TERLALU_DINI" };
  if (v === 3) return { points: w * 0.8, label: "MPASI_TERLAMBAT" };
  return { points: 0 };
}

function scoreAnimalProtein(arr: number[]): Contribution {
  const w = weight("animalProtein");
  const list = Array.isArray(arr) ? arr : [];
  if (list.includes(5) || list.length === 0) {
    return { points: w, label: "PROTEIN_HEWANI_SANGAT_KURANG" };
  }
  if (list.length === 1) {
    return { points: w * 0.333, label: "PROTEIN_HEWANI_TERBATAS" };
  }
  return { points: 0 };
}

function scoreSanitationAccess(v: number): Contribution {
  const w = weight("sanitationAccess");
  if (v === 4) return { points: w, label: "AKSES_SANITASI_BURUK" };
  if (v === 3) return { points: w * 0.6, label: "AKSES_SANITASI_BURUK" };
  if (v === 2) return { points: w * 0.5, label: "AKSES_SANITASI_TERBATAS" };
  return { points: 0 };
}

function scoreSmokeExposure(v: number): Contribution {
  const w = weight("smokeExposure");
  if (v === 2) return { points: w, label: "PAPARAN_ASAP_ROKOK" };
  return { points: 0 };
}

function scoreCleanWaterAccess(v: number): Contribution {
  const w = weight("cleanWaterAccess");
  if (v === 4) return { points: w, label: "AKSES_AIR_MINUM_TERBATAS" };
  if (v === 3) return { points: w * 0.333 };
  return { points: 0 };
}

function scoreDiarrheaHistory(v: number): Contribution {
  const w = weight("diarrheaHistory");
  if (v === 2) return { points: w, label: "RIWAYAT_INFEKSI_DIARE" };
  return { points: 0 };
}

function scoreEconomicQuintile(v: number): Contribution {
  const w = weight("economicQuintile");
  if (v === 1) return { points: w, label: "KUINTIL_EKONOMI_RENDAH" };
  if (v === 2) return { points: w * 0.5, label: "KUINTIL_EKONOMI_RENDAH" };
  return { points: 0 };
}

function scoreMotherEducation(v: number): Contribution {
  const w = weight("motherEducation");
  if (v === 1) return { points: w, label: "PENDIDIKAN_IBU_RENDAH" };
  if (v === 2) return { points: w * 0.5 };
  return { points: 0 };
}

function scorePosyanduKia(v: number): Contribution {
  const w = weight("posyanduKia");
  if (v === 3) return { points: w, label: "POSYANDU_TIDAK_AKTIF" };
  if (v === 2) return { points: w * 0.417 };
  return { points: 0 };
}

const BASELINE_SCORE = 0.15;
const ZSCORE_HIGH_SEVERITY_BOOST = 0.35;

export function calculateRisk(input: RiskEngineInput): RiskEngineResult {
  const contributions: Contribution[] = [
    scoreBblrOption(input.bblrOption),
    scoreExclusiveAsi(input.exclusiveAsi),
    scoreMpasiAge(input.mpasiAge),
    scoreAnimalProtein(input.animalProtein),
    scoreSanitationAccess(input.sanitationAccess),
    scoreSmokeExposure(input.smokeExposure),
    scoreCleanWaterAccess(input.cleanWaterAccess),
    scoreDiarrheaHistory(input.diarrheaHistory),
    scoreEconomicQuintile(input.economicQuintile),
    scoreMotherEducation(input.motherEducation),
    scorePosyanduKia(input.posyanduKia),
  ];

  let score = BASELINE_SCORE;
  if (input.zScoreTBU < -2.0) {
    score += ZSCORE_HIGH_SEVERITY_BOOST;
    contributions.unshift({ points: ZSCORE_HIGH_SEVERITY_BOOST, label: "INDIKASI_PERAWAKAN_PENDEK_TBU" });
  }
  for (const c of contributions) score += c.points;

  const riskScore = Math.round(Math.min(0.98, Math.max(0.05, score)) * 100) / 100;

  let riskTier: RiskTier = "LOW";
  if (riskScore >= 0.7 || input.zScoreTBU < -2.0) riskTier = "HIGH";
  else if (riskScore >= 0.4) riskTier = "MODERATE";

  const dominantFactors = contributions
    .filter((c) => c.label && c.points > 0)
    .sort((a, b) => b.points - a.points)
    .map((c) => c.label as string)
    .filter((label, idx, arr) => arr.indexOf(label) === idx) // unik
    .slice(0, 5);

  return { riskScore, riskTier, dominantFactors };
}
