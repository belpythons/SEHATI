import { FormScreeningInput } from "../types/stunting.types";

// Responsibility 3: Mengevaluasi Faktor Determinan Lingkungan & Pola Asuh

export function evaluateRiskDeterminants(input: FormScreeningInput, zScore: number) {
  let additionalScore = 0;
  const factors: string[] = [];

  // Evaluasi Z-Score Severity
  switch (true) {
    case zScore < -3.0:
      additionalScore += 0.5;
      factors.push('Sangat Pendek (Z-Score TB/U < -3 SD)');
      break;
    case zScore < -2.0:
      additionalScore += 0.35;
      factors.push('Pendek (Z-Score TB/U < -2 SD)');
      break;
  }

  // Evaluasi BBLR
  switch (input.bblrOption) {
    case 2:
      additionalScore += 0.1;
      factors.push('Riwayat Berat Badan Lahir Rendah (BBLR)');
      break;
  }

  // 3. Evaluasi ASI Eksklusif
  switch (input.exclusiveAsi) {
    case 2:
      additionalScore += 0.05;
      factors.push('Tidak Mendapatkan ASI Eksklusif');
      break;
  }

  // 4. Evaluasi Asupan Protein Hewani
  switch (true) {
    case Boolean(input.animalProtein?.includes(5)):
      additionalScore += 0.1;
      factors.push('Asupan Protein Hewani Sangat Kurang');
      break;
  }

  // 5. Evaluasi Akses Sanitasi
  switch (true) {
    case Boolean(input.sanitationAccess && input.sanitationAccess >= 2):
      additionalScore += 0.1;
      factors.push('Fasilitas Sanitasi / Jamban Kurang Layak');
      break;
  }

  // 6. Evaluasi Paparan Asap Rokok
  switch (input.smokeExposure) {
    case 2:
      additionalScore += 0.1;
      factors.push('Terpapar Asap Rokok Lingkungan Rumah');
      break;
  }

  // 7. Evaluasi Riwayat Diare
  switch (input.diarrheaHistory) {
    case 2:
      additionalScore += 0.1;
      factors.push('Riwayat Diare Berulang dalam 3 Bulan Terakhir');
      break;
  }

  return { additionalScore, factors };
}