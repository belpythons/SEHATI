import { calculateRisk } from "../src/domain/risk/weightedRiskEngine";

function check(label: string, cond: boolean) {
  console.log(`${cond ? "OK  " : "FAIL"} ${label}`);
  if (!cond) process.exitCode = 1;
}

// Kasus 1: profil sehat semua determinan baik -> harus LOW
const healthy = calculateRisk({
  zScoreTBU: 0.1,
  bblrOption: 1,
  exclusiveAsi: 1,
  mpasiAge: 2,
  animalProtein: [1, 2, 3],
  cleanWaterAccess: 1,
  sanitationAccess: 1,
  smokeExposure: 1,
  motherEducation: 4,
  economicQuintile: 5,
  diarrheaHistory: 1,
  posyanduKia: 1,
});
console.log("Healthy profile:", healthy);
check("profil sehat -> LOW", healthy.riskTier === "LOW");
check("profil sehat -> dominantFactors kosong", healthy.dominantFactors.length === 0);

// Kasus 2: profil berisiko tinggi semua determinan buruk + stunted -> harus HIGH
const atRisk = calculateRisk({
  zScoreTBU: -3.2,
  bblrOption: 2,
  exclusiveAsi: 2,
  mpasiAge: 1,
  animalProtein: [5],
  cleanWaterAccess: 4,
  sanitationAccess: 4,
  smokeExposure: 2,
  motherEducation: 1,
  economicQuintile: 1,
  diarrheaHistory: 2,
  posyanduKia: 3,
});
console.log("At-risk profile:", atRisk);
check("profil berisiko -> HIGH", atRisk.riskTier === "HIGH");
check("profil berisiko -> riskScore capped 0.98", atRisk.riskScore <= 0.98);
check("profil berisiko -> ada dominantFactors (maks 5)", atRisk.dominantFactors.length > 0 && atRisk.dominantFactors.length <= 5);
check("INDIKASI_PERAWAKAN_PENDEK_TBU jadi faktor teratas (z paling parah)", atRisk.dominantFactors[0] === "INDIKASI_PERAWAKAN_PENDEK_TBU");

// Kasus 3: zScore sangat rendah harus floor ke HIGH walau determinan lain oke
const stuntedButGoodEnv = calculateRisk({
  zScoreTBU: -2.5,
  bblrOption: 1,
  exclusiveAsi: 1,
  mpasiAge: 2,
  animalProtein: [1, 2, 3],
  cleanWaterAccess: 1,
  sanitationAccess: 1,
  smokeExposure: 1,
  motherEducation: 4,
  economicQuintile: 5,
  diarrheaHistory: 1,
  posyanduKia: 1,
});
console.log("Stunted tapi lingkungan baik:", stuntedButGoodEnv);
check("z<-2 floor ke HIGH walau lingkungan baik", stuntedButGoodEnv.riskTier === "HIGH");

if (process.exitCode === 1) {
  console.error("\nSelf-check GAGAL.");
} else {
  console.log("\nSelf-check weightedRiskEngine: SEMUA LULUS.");
}
