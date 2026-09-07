export interface FormScreeningInput {
  ageMonths: number;
  gender: string;
  heightCm: number;
  weightKg: number;
  bblrOption?: number;
  exclusiveAsi?: number;
  mpasiAge?: number;
  animalProtein?: number[];
  cleanWaterAccess?: number;
  sanitationAccess?: number;
  smokeExposure?: number;
  motherEducation?: number;
  economicQuintile?: number;
  diarrheaHistory?: number;
  posyanduKia?: number;
  [key: string]: any;
}

export type RiskTier = 'LOW' | 'MODERATE' | 'HIGH';

export interface StuntingEvaluationResult {
  zScore: number;
  zScoreWAZ: number;
  zScoreWHZ: number;
  statusGiziTBU: string;
  statusGiziBBU: string;
  statusGiziBBTB: string;
  riskTier: RiskTier;
  riskScore: number;
  dominantFactors: string[];
}