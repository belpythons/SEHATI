/**
 * Bucket/kode kanonik untuk fitur determinan yang dipakai mesin skor risiko.
 * Nilai-nilai ini harus sama persis dengan yang dipakai frontend
 * (`frontend/src/types/screening.ts`, `QuestionnairePage.tsx`).
 *
 * `smokeExposure` dan `diarrheaHistory` tetap dipakai di sini (beda dengan
 * rencana Naive Bayes yang dibatalkan — lihat FDD §6 revisi) karena weighted
 * engine tidak butuh data pelatihan per fitur, hanya bobot literatur.
 */

export type RiskTier = "LOW" | "MODERATE" | "HIGH";

/** Bucket kepadatan protein hewani, diturunkan dari array `animalProtein`. */
export function animalProteinBucket(animalProtein: number[]): number {
  if (!Array.isArray(animalProtein) || animalProtein.length === 0) return 4; // sangat jarang
  if (animalProtein.includes(5)) return 4; // sangat jarang
  if (animalProtein.length >= 3) return 1; // beragam (>=3 sumber)
  if (animalProtein.length === 2) return 2;
  return 3; // 1 sumber
}
