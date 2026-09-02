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
  gender: string,
  weightKg: number,
  heightCm: number
) {
  // Normalize gender to L/P for calculation (backend sends 'Laki-Laki'/'Perempuan')
  const genderCode = gender === 'Laki-Laki' || gender === 'L' ? 'L' : 'P'

  // Approximate median & standard deviations based on WHO child growth standards
  const medianHeight = genderCode === 'L' ? 50.0 + ageMonths * 0.72 : 49.0 + ageMonths * 0.70
  const sdHeight = 3.2 + ageMonths * 0.05
  const zScoreTBU = parseFloat(((heightCm - medianHeight) / sdHeight).toFixed(2))

  const medianWeight = genderCode === 'L' ? 3.3 + ageMonths * 0.35 : 3.2 + ageMonths * 0.33
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
 * Simulates Naïve Bayes Risk Assessment based on integer-enum multi-determinant parameters.
 * All determinant checks now use the approved mapping table's integer values and risk contributions.
 */
export function calculateRiskAssessment(payload: Partial<ScreeningSubmitPayload>, zScoreTBU: number) {
  let riskScore = 0.15
  const dominantFactors: string[] = []

  // Z-Score TB/U assessment
  if (zScoreTBU < -2.0) {
    riskScore += 0.35
    dominantFactors.push('INDIKASI_PERAWAKAN_PENDEK_TBU')
  }

  // bblrOption: 1=Normal, 2=BBLR, 3=Tidak Tahu
  if (payload.bblrOption === 2) {
    riskScore += 0.15
    dominantFactors.push('RIWAYAT_BBLR')
  } else if (payload.bblrOption === 3) {
    riskScore += 0.05  // Neutral — unknown ≠ confirmed BBLR
  }

  // exclusiveAsi: 1=Eksklusif, 2=Tidak/Formula, 3=Belum 6 Bulan
  if (payload.exclusiveAsi === 2) {
    riskScore += 0.12
    dominantFactors.push('TIDAK_ASI_EKSKLUSIF')
  }
  // exclusiveAsi === 3 (belum 6 bulan): +0.00, netral

  // mpasiAge: 1=<6bln Dini, 2=Tepat 6bln, 3=>6bln Terlambat, 4=Belum MPASI
  if (payload.mpasiAge === 1) {
    riskScore += 0.10
    dominantFactors.push('MPASI_TERLALU_DINI')
  } else if (payload.mpasiAge === 3) {
    riskScore += 0.08
    dominantFactors.push('MPASI_TERLAMBAT')
  }
  // mpasiAge === 2 (ideal) or 4 (belum): +0.00

  // animalProtein: array of [1-5], option 5 = Sangat Jarang
  if (payload.animalProtein) {
    if (payload.animalProtein.includes(5)) {
      riskScore += 0.15
      dominantFactors.push('PROTEIN_HEWANI_SANGAT_KURANG')
    } else if (payload.animalProtein.length === 1) {
      riskScore += 0.05
      dominantFactors.push('PROTEIN_HEWANI_TERBATAS')
    }
    // 2+ sources: +0.00
  }

  // sanitationAccess: 1=Milik Sendiri, 2=Cemplung, 3=MCK, 4=Tidak Memiliki
  if (payload.sanitationAccess === 4) {
    riskScore += 0.20
    dominantFactors.push('AKSES_SANITASI_BURUK')
  } else if (payload.sanitationAccess === 3) {
    riskScore += 0.12
    dominantFactors.push('AKSES_SANITASI_BURUK')
  } else if (payload.sanitationAccess === 2) {
    riskScore += 0.10
    dominantFactors.push('AKSES_SANITASI_TERBATAS')
  }

  // smokeExposure: 1=Bebas, 2=Terpapar
  if (payload.smokeExposure === 2) {
    riskScore += 0.18
    dominantFactors.push('PAPARAN_ASAP_ROKOK')
  }

  // cleanWaterAccess: 1=Kemasan, 2=PDAM, 3=Sumur Bor, 4=Sumur Gali
  if (payload.cleanWaterAccess === 4) {
    riskScore += 0.15
    dominantFactors.push('AKSES_AIR_MINUM_TERBATAS')
  } else if (payload.cleanWaterAccess === 3) {
    riskScore += 0.05
  }

  // diarrheaHistory: 1=Tidak/1x Ringan, 2=Sering >=2x
  if (payload.diarrheaHistory === 2) {
    riskScore += 0.15
    dominantFactors.push('RIWAYAT_INFEKSI_DIARE')
  }

  // economicQuintile: 1-5
  if (payload.economicQuintile && payload.economicQuintile <= 2) {
    riskScore += payload.economicQuintile === 1 ? 0.10 : 0.05
    dominantFactors.push('KUINTIL_EKONOMI_RENDAH')
  }

  // motherEducation: 1=SD, 2=SMP, 3=SMA, 4=Diploma/Sarjana
  if (payload.motherEducation === 1) {
    riskScore += 0.08
    dominantFactors.push('PENDIDIKAN_IBU_RENDAH')
  } else if (payload.motherEducation === 2) {
    riskScore += 0.04
  }

  // posyanduKia: 1=Rutin+KIA, 2=Kadang, 3=Tidak Pernah
  if (payload.posyanduKia === 3) {
    riskScore += 0.12
    dominantFactors.push('POSYANDU_TIDAK_AKTIF')
  } else if (payload.posyanduKia === 2) {
    riskScore += 0.05
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
    dominantFactors: dominantFactors.slice(0, 5),
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
      isOutsideBontang: payload.isOutsideBontang,
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
      bblrOption: payload.bblrOption,
      exclusiveAsi: payload.exclusiveAsi,
      mpasiAge: payload.mpasiAge,
      animalProtein: payload.animalProtein,
      cleanWaterAccess: payload.cleanWaterAccess,
      sanitationAccess: payload.sanitationAccess,
      smokeExposure: payload.smokeExposure,
      motherEducation: payload.motherEducation,
      economicQuintile: payload.economicQuintile,
      diarrheaHistory: payload.diarrheaHistory,
      posyanduKia: payload.posyanduKia,
      riskTier: riskResults.riskTier,
      riskScore: riskResults.riskScore,
      dominantFactors: riskResults.dominantFactors,
      rawMetadata: {
        engine: 'SEHATI-Mock-Inference-Engine-v2.0',
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
      const det: any = foundSample.determinants || {}
      const adaptedRecord: ScreeningRecord = {
        id: foundSample.id,
        shareHash: foundSample.shareHash,
        sessionId: foundSample.sessionId,
        sourceType: foundSample.sourceType || 'PWA_DIRECT_USER',
        sourceBatchId: null,
        persona: foundSample.persona || 'Orang Tua / Anggota Keluarga Balita',
        kelurahan: foundSample.kelurahan || 'Loktuan',
        isOutsideBontang: false,
        ageMonths: foundSample.child?.ageMonths || 18,
        gender: foundSample.child?.gender === 'L' ? 'Laki-Laki' : foundSample.child?.gender === 'P' ? 'Perempuan' : (foundSample.child?.gender || 'Laki-Laki'),
        weightKg: foundSample.child?.weightKg || 8.5,
        heightCm: foundSample.child?.heightCm || 74.5,
        zScore: foundSample.zScores?.zScoreTBU || -2.03,
        zScoreWAZ: foundSample.zScores?.zScoreBBU || -1.85,
        zScoreWHZ: foundSample.zScores?.zScoreBBTB || -1.12,
        statusGiziTBU: foundSample.zScores?.statusGiziTBU || 'Pendek',
        statusGiziBBU: foundSample.zScores?.statusGiziBBU || 'Normal',
        statusGiziBBTB: foundSample.zScores?.statusGiziBBTB || 'Normal',
        // Map old boolean determinants to new integer format for compatibility
        bblrOption: det.bblrOption ?? (det.bblrHistory === true ? 2 : 1),
        exclusiveAsi: det.exclusiveAsi != null
          ? (typeof det.exclusiveAsi === 'boolean'
            ? (det.exclusiveAsi ? 1 : 2)
            : Number(det.exclusiveAsi))
          : 1,
        mpasiAge: det.mpasiAge ? Number(det.mpasiAge) : 2,
        animalProtein: Array.isArray(det.animalProtein) ? det.animalProtein : [1, 2],
        cleanWaterAccess: det.cleanWaterAccess != null
          ? (typeof det.cleanWaterAccess === 'boolean'
            ? (det.cleanWaterAccess ? 1 : 4)
            : Number(det.cleanWaterAccess))
          : 1,
        sanitationAccess: det.sanitationAccess != null
          ? (typeof det.sanitationAccess === 'boolean'
            ? (det.sanitationAccess ? 1 : 4)
            : Number(det.sanitationAccess))
          : 1,
        smokeExposure: det.smokeExposure != null
          ? (typeof det.smokeExposure === 'boolean'
            ? (det.smokeExposure ? 2 : 1)
            : Number(det.smokeExposure))
          : 1,
        motherEducation: det.motherEducation != null
          ? (typeof det.motherEducation === 'boolean'
            ? (det.motherEducation ? 3 : 1)
            : Number(det.motherEducation))
          : 3,
        economicQuintile: det.economicQuintile ? Number(det.economicQuintile) : 3,
        diarrheaHistory: det.diarrheaHistory != null
          ? (typeof det.diarrheaHistory === 'boolean'
            ? (det.diarrheaHistory ? 2 : 1)
            : Number(det.diarrheaHistory))
          : 1,
        posyanduKia: det.posyanduKia ? Number(det.posyanduKia) : 1,
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
      persona: 'Orang Tua / Anggota Keluarga Balita',
      isOutsideBontang: false,
      kelurahan: 'Loktuan',
      gender: 'Laki-Laki',
      ageMonths: 18,
      weightKg: 8.5,
      heightCm: 74.5,
      bblrOption: 1,
      exclusiveAsi: 1,
      mpasiAge: 2,
      animalProtein: [1, 2],
      cleanWaterAccess: 1,
      sanitationAccess: 1,
      smokeExposure: 1,
      motherEducation: 3,
      economicQuintile: 3,
      diarrheaHistory: 1,
      posyanduKia: 1,
    })

    return fallbackResponse
  },
}
