import {
  ScreeningSubmitPayload,
  ScreeningSubmitResponse,
  ScreeningRecord,
  RiskTierType,
} from '../types/screening'
import mockDataJson from '../../mock_data.json'

/**
 * [MOCK / UI APPROXIMATION ONLY]
 * Calculates simplified WHO Z-Score approximations (TB/U, BB/U, BB/TB) for UI mock/fallback.
 * NOTE: This is a client-side linear approximation for offline development & UI demo only.
 * The authoritative, medically accurate WHO 2006 LMS calculation and Naïve Bayes
 * multi-factorial prediction are executed by the FastAPI `ml-service` microservice
 * when connected to the live backend.
 */
export function calculateZScores(
  ageMonths: number,
  gender: 'L' | 'P',
  weightKg: number,
  heightCm: number
) {
  // Approximate median & standard deviations based on WHO child growth standards
  const medianHeight = gender === 'L' ? 50.0 + ageMonths * 0.72 : 49.0 + ageMonths * 0.70
  const sdHeight = 3.2 + ageMonths * 0.05
  const zScoreTBU = parseFloat(((heightCm - medianHeight) / sdHeight).toFixed(2))

  const medianWeight = gender === 'L' ? 3.3 + ageMonths * 0.35 : 3.2 + ageMonths * 0.33
  const sdWeight = 0.8 + ageMonths * 0.06
  const zScoreWAZ = parseFloat(((weightKg - medianWeight) / sdWeight).toFixed(2))

  const expectedWeightForHeight = (heightCm - 45) * 0.25 + 3.0
  const sdWHZ = 1.1
  const zScoreWHZ = parseFloat(((weightKg - expectedWeightForHeight) / sdWHZ).toFixed(2))

  // Determine nutritional classifications
  let statusGiziTBU: 'Sangat Pendek' | 'Pendek' | 'Normal' | 'Tinggi'
  if (zScoreTBU < -3.0) statusGiziTBU = 'Sangat Pendek'
  else if (zScoreTBU < -2.0) statusGiziTBU = 'Pendek'
  else if (zScoreTBU <= 3.0) statusGiziTBU = 'Normal'
  else statusGiziTBU = 'Tinggi'

  let statusGiziBBU: 'Severely Underweight' | 'Underweight' | 'Normal' | 'Risiko BB Lebih'
  if (zScoreWAZ < -3.0) statusGiziBBU = 'Severely Underweight'
  else if (zScoreWAZ < -2.0) statusGiziBBU = 'Underweight'
  else if (zScoreWAZ <= 1.0) statusGiziBBU = 'Normal'
  else statusGiziBBU = 'Risiko BB Lebih'

  let statusGiziBBTB: 'Severely Wasted' | 'Wasted' | 'Normal' | 'Overweight/Obesitas'
  if (zScoreWHZ < -3.0) statusGiziBBTB = 'Severely Wasted'
  else if (zScoreWHZ < -2.0) statusGiziBBTB = 'Wasted'
  else if (zScoreWHZ <= 1.0) statusGiziBBTB = 'Normal'
  else statusGiziBBTB = 'Overweight/Obesitas'

  return {
    zScore: zScoreTBU,
    zScoreWAZ,
    zScoreWHZ,
    statusGiziTBU,
    statusGiziBBU,
    statusGiziBBTB,
  }
}

/**
 * [MOCK / UI APPROXIMATION ONLY]
 * Simulates Naïve Bayes Risk Assessment based on multi-determinant parameters
 */
export function calculateRiskAssessment(payload: Partial<ScreeningSubmitPayload>, zScoreTBU: number) {
  let riskScore = 0.15
  const dominantFactors: string[] = []

  if (zScoreTBU < -2.0) {
    riskScore += 0.35
    dominantFactors.push('INDIKASI_PERAWAKAN_PENDEK_TBU')
  }

  if (payload.sanitationAccess === false) {
    riskScore += 0.20
    dominantFactors.push('AKSES_SANITASI_BURUK')
  }

  if (payload.smokeExposure === true) {
    riskScore += 0.18
    dominantFactors.push('PAPARAN_ASAP_ROKOK')
  }

  if (payload.cleanWaterAccess === false) {
    riskScore += 0.15
    dominantFactors.push('AKSES_AIR_MINUM_TERBATAS')
  }

  if (payload.exclusiveAsi === false && (payload.ageMonths ?? 0) >= 6) {
    riskScore += 0.12
    dominantFactors.push('TIDAK_ASI_EKSKLUSIF')
  }

  if (payload.diarrheaHistory === true) {
    riskScore += 0.15
    dominantFactors.push('RIWAYAT_INFEKSI_DIARE')
  }

  if (payload.economicQuintile && payload.economicQuintile <= 2) {
    riskScore += 0.10
    dominantFactors.push('KUINTIL_EKONOMI_RENDAH')
  }

  if (payload.bblrHistory === true) {
    riskScore += 0.15
    dominantFactors.push('RIWAYAT_BBLR')
  }

  // Cap risk score between 0.05 and 0.98
  const clampedScore = parseFloat(Math.min(0.98, Math.max(0.05, riskScore)).toFixed(2))

  let riskTier: RiskTierType = 'LOW'
  if (clampedScore >= 0.70 || zScoreTBU < -2.0) {
    riskTier = 'HIGH'
  } else if (clampedScore >= 0.40) {
    riskTier = 'MODERATE'
  }

  return {
    riskScore: clampedScore,
    riskTier,
    dominantFactors: dominantFactors.slice(0, 4),
  }
}

/**
 * In-memory / localStorage cache storage key for mock persistence
 */
const MOCK_STORAGE_KEY = 'sehati_mock_screenings_db'

function getMockStorage(): Record<string, ScreeningRecord> {
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveToMockStorage(record: ScreeningRecord) {
  try {
    const db = getMockStorage()
    db[record.id] = record
    db[record.shareHash] = record
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(db))
  } catch (err) {
    console.warn('Failed to save to mock storage:', err)
  }
}

/**
 * Generates a pure 10-character URL-safe nanoid matching Prisma `@default(nanoid(10))`
 */
function generateShareHash(): string {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'
  let result = ''
  for (let i = 0; i < 10; i++) {
    result += alphabet.charAt(Math.floor(Math.random() * alphabet.length))
  }
  return result
}

/**
 * Mock API Service that perfectly mimics POST /api/v1/screening/submit
 * and persists data for instant frontend dashboard development.
 */
export const mockScreeningApi = {
  /**
   * Submit mock screening and return identical Prisma ScreeningRecord shape
   */
  async submit(payload: ScreeningSubmitPayload): Promise<ScreeningSubmitResponse> {
    // Artificial delay (300ms) to simulate realistic network latency
    await new Promise((resolve) => setTimeout(resolve, 300))

    const zScoreResults = calculateZScores(
      payload.ageMonths,
      payload.gender,
      payload.weightKg,
      payload.heightCm
    )

    const riskResults = calculateRiskAssessment(payload, zScoreResults.zScore)

    const sessionId = `sess-${crypto.randomUUID()}`
    const recordId = `rec-${crypto.randomUUID()}`
    const shareHash = generateShareHash()

    const mockRecord: ScreeningRecord = {
      id: recordId,
      shareHash,
      sessionId,
      sourceType: payload.sourceType || 'PWA_DIRECT_USER',
      sourceBatchId: null,
      persona: payload.persona,
      kelurahan: payload.kelurahan,
      ageMonths: payload.ageMonths,
      gender: payload.gender,
      weightKg: payload.weightKg,
      heightCm: payload.heightCm,
      zScore: zScoreResults.zScore,
      zScoreWAZ: zScoreResults.zScoreWAZ,
      zScoreWHZ: zScoreResults.zScoreWHZ,
      statusGiziTBU: zScoreResults.statusGiziTBU,
      statusGiziBBU: zScoreResults.statusGiziBBU,
      statusGiziBBTB: zScoreResults.statusGiziBBTB,
      exclusiveAsi: payload.exclusiveAsi,
      sanitationAccess: payload.sanitationAccess,
      cleanWaterAccess: payload.cleanWaterAccess,
      smokeExposure: payload.smokeExposure,
      economicQuintile: payload.economicQuintile,
      diarrheaHistory: payload.diarrheaHistory,
      bblrHistory: payload.bblrHistory ?? false,
      motherEducation: payload.motherEducation ?? true,
      riskTier: riskResults.riskTier,
      riskScore: riskResults.riskScore,
      dominantFactors: riskResults.dominantFactors,
      rawMetadata: {
        engine: 'SEHATI-Mock-Inference-Engine-v1.0',
        measurementPosition: payload.heightCm > 85 ? 'Berdiri' : 'Terlentang',
        calculatedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
    }

    saveToMockStorage(mockRecord)

    return {
      data: mockRecord,
      shareHash: mockRecord.shareHash,
      isMockData: true,
      dataSource: 'mock',
    }
  },

  /**
   * Get mock record by shareHash or record ID
   */
  async getByShareHash(shareHash: string): Promise<ScreeningSubmitResponse> {
    await new Promise((resolve) => setTimeout(resolve, 200))

    const db = getMockStorage()
    if (db[shareHash]) {
      return {
        data: db[shareHash],
        shareHash,
      }
    }

    // Check pre-seeded profile from mock_data.json
    const sampleProfiles = mockDataJson?.analyticsDashboard?.sampleScreeningProfiles || []
    const foundSample = sampleProfiles.find(
      (p: any) => p.shareHash === shareHash || p.id === shareHash
    )

    if (foundSample) {
      const adaptedRecord: ScreeningRecord = {
        id: foundSample.id,
        shareHash: foundSample.shareHash,
        sessionId: foundSample.sessionId,
        sourceType: foundSample.sourceType || 'PWA_DIRECT_USER',
        sourceBatchId: null,
        persona: foundSample.persona || 'ORANG_TUA',
        kelurahan: foundSample.kelurahan || 'Loktuan',
        ageMonths: foundSample.child?.ageMonths || 18,
        gender: foundSample.child?.gender || 'L',
        weightKg: foundSample.child?.weightKg || 8.5,
        heightCm: foundSample.child?.heightCm || 74.5,
        zScore: foundSample.zScores?.zScoreTBU || -2.03,
        zScoreWAZ: foundSample.zScores?.zScoreBBU || -1.85,
        zScoreWHZ: foundSample.zScores?.zScoreBBTB || -1.12,
        statusGiziTBU: foundSample.zScores?.statusGiziTBU || 'Stunted',
        statusGiziBBU: foundSample.zScores?.statusGiziBBU || 'Normal',
        statusGiziBBTB: foundSample.zScores?.statusGiziBBTB || 'Normal',
        exclusiveAsi: foundSample.determinants?.exclusiveAsi ?? true,
        sanitationAccess: foundSample.determinants?.sanitationAccess ?? false,
        cleanWaterAccess: foundSample.determinants?.cleanWaterAccess ?? true,
        smokeExposure: foundSample.determinants?.smokeExposure ?? true,
        economicQuintile: foundSample.determinants?.economicQuintile ?? 2,
        diarrheaHistory: foundSample.determinants?.diarrheaHistory ?? false,
        riskTier: (foundSample.riskAssessment?.riskTier as RiskTierType) || 'MODERATE',
        riskScore: foundSample.riskAssessment?.riskScore || 0.68,
        dominantFactors: (foundSample.riskAssessment?.dominantFactors || []).map(
          (f: any) => (typeof f === 'string' ? f : f.key)
        ),
        rawMetadata: foundSample,
        createdAt: foundSample.createdAt || new Date().toISOString(),
      }
      return {
        data: adaptedRecord,
        shareHash: adaptedRecord.shareHash,
      }
    }

    // Default fallback demo record if not found
    const fallbackResponse = await mockScreeningApi.submit({
      clientToken: 'demo-client-token',
      persona: 'ORANG_TUA',
      kelurahan: 'Loktuan',
      gender: 'L',
      ageMonths: 18,
      weightKg: 8.5,
      heightCm: 74.5,
      exclusiveAsi: true,
      sanitationAccess: false,
      cleanWaterAccess: true,
      smokeExposure: true,
      economicQuintile: 2,
      diarrheaHistory: false,
      bblrHistory: false,
      motherEducation: true,
    })

    return fallbackResponse
  },
}
