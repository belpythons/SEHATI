export type PersonaType = 'ORANG_TUA' | 'KADER_POSYANDU' | 'TENAGA_KESEHATAN' | 'SURVEYOR'
export type GenderType = 'L' | 'P'
export type MeasurementPositionType = 'Terlentang' | 'Berdiri'
export type RiskTierType = 'LOW' | 'MODERATE' | 'HIGH'

/**
 * Mapping FE short persona codes → Backend Zod enum strings (exact match required)
 */
export const PERSONA_SUBMIT_MAP: Record<PersonaType, string> = {
  ORANG_TUA: 'Orang Tua / Anggota Keluarga Balita',
  KADER_POSYANDU: 'Kader Posyandu',
  TENAGA_KESEHATAN: 'Tenaga Kesehatan / Bidan',
  SURVEYOR: 'Surveyor / Peneliti Lapangan',
}

/**
 * Mapping FE short gender codes → Backend Zod enum strings
 */
export const GENDER_SUBMIT_MAP: Record<GenderType, string> = {
  L: 'Laki-Laki',
  P: 'Perempuan',
}

export interface ScreeningFormData {
  // Step 1: Persona & Domisili
  persona: PersonaType | ''
  isOutsideBontang: boolean
  kelurahan: string
  // Step 2: Antropometri
  gender: GenderType | ''
  ageMonths: number | ''
  measurementPosition: MeasurementPositionType
  weightKg: number | ''
  heightCm: number | ''
  // Step 3: Riwayat Kelahiran & Pola Makan
  bblrOption: number | null           // 1=Normal (>=2500g), 2=BBLR (<2500g), 3=Tidak Tahu
  exclusiveAsi: number | null         // 1=ASI Eksklusif, 2=Tidak Eksklusif/Formula, 3=Belum 6 Bulan
  mpasiAge: number | null             // 1=<6Bln (Dini), 2=Tepat 6Bln, 3=>6Bln (Terlambat), 4=Belum MPASI
  animalProtein: number[]             // [1=Ikan, 2=Telur, 3=Daging, 4=Susu, 5=Sangat Jarang]
  // Step 4: Lingkungan & Sosial-Ekonomi
  cleanWaterAccess: number | null     // 1=Kemasan, 2=PDAM, 3=Sumur Bor, 4=Sumur Gali/Mata Air/Hujan
  sanitationAccess: number | null     // 1=Milik Sendiri, 2=Cemplung, 3=MCK, 4=Tidak Memiliki
  smokeExposure: number | null        // 1=Bebas, 2=Terpapar
  motherEducation: number | null      // 1=SD, 2=SMP, 3=SMA/SMK, 4=Diploma/Sarjana
  economicQuintile: number | null     // 1-5
  diarrheaHistory: number | null      // 1=Tidak Pernah/1x Ringan, 2=Sering >=2x
  posyanduKia: number | null          // 1=Rutin+KIA, 2=Kadang-kadang, 3=Tidak Pernah/Jarang
}

export interface ScreeningSubmitPayload {
  clientToken: string
  persona: string                     // Full backend string via PERSONA_SUBMIT_MAP
  isOutsideBontang: boolean
  kelurahan: string
  gender: string                      // Full backend string via GENDER_SUBMIT_MAP
  ageMonths: number
  weightKg: number
  heightCm: number
  bblrOption: number
  exclusiveAsi: number
  mpasiAge: number
  animalProtein: number[]
  cleanWaterAccess: number
  sanitationAccess: number
  smokeExposure: number
  motherEducation: number
  economicQuintile: number
  diarrheaHistory: number
  posyanduKia: number
  rawMetadata?: Record<string, any>
  sourceType?: 'PWA_DIRECT_USER' | 'RISKESDAS_KEMENKES' | 'SURVEY_CSV_UPLOAD' | 'EXTERNAL_HEALTH_API'
}

export interface ScreeningRecord {
  id: string
  shareHash: string
  sessionId: string
  sourceType: string
  sourceBatchId?: string | null
  persona: string
  kelurahan: string
  isOutsideBontang: boolean
  ageMonths: number
  gender: string
  weightKg: number
  heightCm: number
  zScore: number                      // TB/U
  zScoreWAZ?: number | null           // BB/U
  zScoreWHZ?: number | null           // BB/TB
  statusGiziTBU?: string | null
  statusGiziBBU?: string | null
  statusGiziBBTB?: string | null
  bblrOption: number
  exclusiveAsi: number
  mpasiAge: number
  animalProtein: number[]
  cleanWaterAccess: number
  sanitationAccess: number
  smokeExposure: number
  motherEducation: number
  economicQuintile: number
  diarrheaHistory: number
  posyanduKia: number
  riskTier: RiskTierType
  riskScore: number
  dominantFactors: string[]
  rawMetadata?: any
  createdAt: string
}

export interface ScreeningSubmitResponse {
  data: ScreeningRecord
  shareHash: string
  isMockData?: boolean
  dataSource?: 'live' | 'mock'
}
