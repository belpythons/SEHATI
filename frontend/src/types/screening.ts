export type PersonaType = 'ORANG_TUA' | 'KADER_POSYANDU' | 'SURVEYOR'
export type GenderType = 'L' | 'P'
export type MeasurementPositionType = 'Terlentang' | 'Berdiri'
export type RiskTierType = 'LOW' | 'MODERATE' | 'HIGH'

export interface ScreeningFormData {
  persona: PersonaType | ''
  kelurahan: string
  gender: GenderType | ''
  ageMonths: number | ''
  measurementPosition: MeasurementPositionType
  weightKg: number | ''
  heightCm: number | ''
  bblrHistory: boolean | null
  exclusiveAsi: boolean | null
  mpasiHistory: boolean | null
  cleanWaterAccess: boolean | null
  sanitationAccess: boolean | null
  smokeExposure: boolean | null
  economicQuintile: number | null // 1 - 5
  motherEducation: boolean | null
  diarrheaHistory: boolean | null
}

export interface ScreeningSubmitPayload {
  clientToken: string
  persona: PersonaType
  kelurahan: string
  gender: GenderType
  ageMonths: number
  weightKg: number
  heightCm: number
  exclusiveAsi: boolean
  sanitationAccess: boolean
  cleanWaterAccess: boolean
  smokeExposure: boolean
  economicQuintile: number
  diarrheaHistory: boolean
  bblrHistory?: boolean
  motherEducation?: boolean
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
  ageMonths: number
  gender: string
  weightKg: number
  heightCm: number
  zScore: number // TB/U
  zScoreWAZ?: number | null // BB/U
  zScoreWHZ?: number | null // BB/TB
  statusGiziTBU?: string | null
  statusGiziBBU?: string | null
  statusGiziBBTB?: string | null
  exclusiveAsi: boolean
  sanitationAccess: boolean
  cleanWaterAccess: boolean
  smokeExposure: boolean
  economicQuintile: number
  diarrheaHistory: boolean
  bblrHistory?: boolean
  motherEducation?: boolean
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

