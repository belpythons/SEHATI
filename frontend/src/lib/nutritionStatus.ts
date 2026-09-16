/**
 * Helper utility untuk konsistensi warna status gizi WHO 2006 & Kemenkes RI (Permenkes No. 2 Tahun 2020)
 * Memisahkan logika klasifikasi TB/U (Tinggi Badan menurut Umur) dan BB/U (Berat Badan menurut Umur).
 */

export interface NutritionColorConfig {
  badge: string
  text: string
}

/**
 * TB/U (Tinggi Badan menurut Umur / Panjang Badan menurut Umur)
 * Kategori WHO / Kemenkes:
 * - 'Sangat Pendek' (Severe Stunting, Z < -3 SD) -> bg-red-50 text-red-700 border-red-200
 * - 'Pendek' (Stunted, -3 <= Z < -2 SD)          -> bg-amber-50 text-amber-800 border-amber-200
 * - 'Normal' (-2 <= Z <= +3 SD)                  -> bg-emerald-50 text-emerald-700 border-emerald-200
 * - 'Tinggi' (Z > +3 SD)                         -> bg-blue-50 text-blue-700 border-blue-200
 * - Fallback                                     -> bg-emerald-50 text-emerald-700 border-emerald-200
 */
export function getStatusGiziTBUStyle(status?: string | null, zScore?: number | null): string {
  const normStatus = status?.trim().toLowerCase() || ''

  if (normStatus.includes('sangat pendek') || (zScore !== undefined && zScore !== null && zScore < -3.0)) {
    return 'bg-red-50 text-red-700 border-red-200'
  }

  if (normStatus.includes('pendek') || (zScore !== undefined && zScore !== null && zScore < -2.0)) {
    return 'bg-amber-50 text-amber-800 border-amber-200'
  }

  if (normStatus.includes('tinggi') || (zScore !== undefined && zScore !== null && zScore > 3.0)) {
    return 'bg-blue-50 text-blue-700 border-blue-200'
  }

  return 'bg-emerald-50 text-emerald-700 border-emerald-200'
}

/**
 * Text color TB/U untuk elemen tanpa badge (seperti text metric grid di AnalyticsPage)
 */
export function getStatusGiziTBUTextColor(status?: string | null, zScore?: number | null): string {
  const normStatus = status?.trim().toLowerCase() || ''

  if (normStatus.includes('sangat pendek') || (zScore !== undefined && zScore !== null && zScore < -3.0)) {
    return 'text-red-700'
  }

  if (normStatus.includes('pendek') || (zScore !== undefined && zScore !== null && zScore < -2.0)) {
    return 'text-amber-800'
  }

  if (normStatus.includes('tinggi') || (zScore !== undefined && zScore !== null && zScore > 3.0)) {
    return 'text-blue-700'
  }

  return 'text-emerald-700'
}

/**
 * BB/U (Berat Badan menurut Umur)
 * Kategori WHO / Kemenkes:
 * - 'Severely Underweight' (BB Sangat Kurang, Z < -3 SD) -> bg-red-50 text-red-700 border-red-200
 * - 'Underweight' (BB Kurang, -3 <= Z < -2 SD)           -> bg-amber-50 text-amber-800 border-amber-200
 * - 'Normal' (-2 <= Z <= +1 SD)                          -> bg-emerald-50 text-emerald-700 border-emerald-200
 * - 'Risiko BB Lebih' (Risk of Overweight, Z > +1 SD)    -> bg-amber-50 text-amber-800 border-amber-200
 * - Fallback                                             -> bg-emerald-50 text-emerald-700 border-emerald-200
 */
export function getStatusGiziBBUStyle(status?: string | null, zScore?: number | null): string {
  const normStatus = status?.trim().toLowerCase() || ''

  if (
    normStatus.includes('severely') ||
    normStatus.includes('sangat kurang') ||
    (zScore !== undefined && zScore !== null && zScore < -3.0)
  ) {
    return 'bg-red-50 text-red-700 border-red-200'
  }

  if (
    normStatus.includes('underweight') ||
    normStatus.includes('kurang') ||
    (zScore !== undefined && zScore !== null && zScore < -2.0)
  ) {
    return 'bg-amber-50 text-amber-800 border-amber-200'
  }

  if (
    normStatus.includes('lebih') ||
    normStatus.includes('overweight') ||
    normStatus.includes('obesitas') ||
    (zScore !== undefined && zScore !== null && zScore > 1.0)
  ) {
    return 'bg-amber-50 text-amber-800 border-amber-200'
  }

  return 'bg-emerald-50 text-emerald-700 border-emerald-200'
}

/**
 * Text color BB/U untuk elemen tanpa badge
 */
export function getStatusGiziBBUTextColor(status?: string | null, zScore?: number | null): string {
  const normStatus = status?.trim().toLowerCase() || ''

  if (
    normStatus.includes('severely') ||
    normStatus.includes('sangat kurang') ||
    (zScore !== undefined && zScore !== null && zScore < -3.0)
  ) {
    return 'text-red-700'
  }

  if (
    normStatus.includes('underweight') ||
    normStatus.includes('kurang') ||
    (zScore !== undefined && zScore !== null && zScore < -2.0)
  ) {
    return 'text-amber-800'
  }

  if (
    normStatus.includes('lebih') ||
    normStatus.includes('overweight') ||
    normStatus.includes('obesitas') ||
    (zScore !== undefined && zScore !== null && zScore > 1.0)
  ) {
    return 'text-amber-800'
  }

  return 'text-emerald-700'
}

/**
 * Backward compatibility wrappers
 */
export function getTBUColor(zScore: number, status?: string | null): NutritionColorConfig {
  return {
    badge: getStatusGiziTBUStyle(status, zScore),
    text: getStatusGiziTBUTextColor(status, zScore),
  }
}

export function getBBUColor(zScore: number, status?: string | null): NutritionColorConfig {
  return {
    badge: getStatusGiziBBUStyle(status, zScore),
    text: getStatusGiziBBUTextColor(status, zScore),
  }
}
