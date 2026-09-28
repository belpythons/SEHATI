import { calculateZScores } from "../src/domain/zscore/zscoreEngine";

function assertClose(actual: number, expected: number, tol: number, label: string) {
  const diff = Math.abs(actual - expected);
  const ok = diff <= tol;
  console.log(`${ok ? "OK  " : "FAIL"} ${label}: actual=${actual} expected~${expected} (tol ${tol})`);
  if (!ok) process.exitCode = 1;
}

// Kasus 1: tepat di median WHO (boy, 18 bulan) -> Z harus ~0 untuk TB/U & BB/U
const medianCase = calculateZScores({
  ageMonths: 18,
  gender: "L",
  heightCm: 82.2628, // M value dari tabel LHFA boys, day untuk bulan 18
  weightKg: 10.9393, // M value dari tabel WFA boys
});
assertClose(medianCase.zScoreTBU, 0, 0.02, "TB/U boy 18bln di median WHO");
assertClose(medianCase.zScoreWAZ, 0, 0.02, "BB/U boy 18bln di median WHO");
console.log("  ->", medianCase);

// Kasus 2: profil demo lama frontend (balita 18bln, 74.5cm, 8.5kg) -> harus stunted (Z < -2)
const demoCase = calculateZScores({
  ageMonths: 18,
  gender: "L",
  heightCm: 74.5,
  weightKg: 8.5,
});
console.log("Demo case (18bln, 74.5cm, 8.5kg):", demoCase);
if (demoCase.zScoreTBU >= -2.0 || demoCase.statusGiziTBU === "Normal") {
  console.log("FAIL  demo case seharusnya stunted (Z < -2), dapat:", demoCase.zScoreTBU);
  process.exitCode = 1;
} else {
  console.log("OK    demo case terklasifikasi", demoCase.statusGiziTBU);
}

// Kasus 3: girl, 2-5 tahun (pakai tabel WFH bukan WFL), 36 bulan, 96.1cm (~median), 14.3kg (~median)
const olderGirl = calculateZScores({
  ageMonths: 36,
  gender: "P",
  heightCm: 92.5, // M value LHFA girls bulan 36 (perkiraan dari tabel)
  weightKg: 13.9,
});
console.log("Girl 36bln case:", olderGirl);

if (process.exitCode === 1) {
  console.error("\nSelf-check GAGAL.");
} else {
  console.log("\nSelf-check zscoreEngine: SEMUA LULUS.");
}
