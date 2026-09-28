/**
 * Bobot kalibrasi tiap faktor determinan, diturunkan dari proporsi kemunculan
 * faktor tersebut di 26 studi tinjauan literatur faktor risiko stunting
 * (`Resume artikel faktor risiko stunting.xlsx`, sheet "Analisis faktor
 * stunting"). Proporsi = (jumlah studi yang menyebut faktor ini) / 26.
 *
 * Dipakai untuk menskalakan kontribusi maksimum tiap faktor di
 * `weightedRiskEngine.ts` — faktor yang lebih sering disebut literatur
 * (mis. sosial-ekonomi 50%, pendidikan ibu 46%) diberi bobot lebih besar
 * daripada yang jarang disebut (mis. asap rokok 3,8%, diare 3,8%).
 *
 * Catatan jujur: proporsi ini mengukur seberapa sering faktor DITELITI,
 * bukan seberapa besar efeknya secara statistik (studi tidak semuanya
 * melaporkan effect size yang bisa dibandingkan langsung) — dipakai sebagai
 * sinyal kalibrasi relatif, bukan odds ratio yang presisi.
 */
export const LITERATURE_FACTOR_PROPORTION = {
  exclusiveAsi: 0.23, // "Pemberian ASI"
  sanitationAccess: 0.23, // "Akses sanitasi"
  cleanWaterAccess: 0.192, // "Akses air bersih"
  smokeExposure: 0.038, // "Terpapar asap rokok"
  diarrheaHistory: 0.038, // "Diare"
  economicQuintile: 0.5, // "Sosial ekonomi"
  motherEducation: 0.46, // "Pendidikan ibu"
  bblrOption: 0.077, // "Berat badan lahir"
  mpasiAge: 0.115, // "Praktek pemberian makan"
  animalProtein: 0.076, // "Asupan Makanan" (0.038) + "Pola Makan" (0.038)
  posyanduKia: 0.15, // "Akses layanan kesehatan"
} as const;

/** Total kontribusi maksimum (di luar baseline & boost Z-score) yang disasar. */
export const MAX_FACTOR_CONTRIBUTION_BUDGET = 0.85;

const PROPORTION_SUM = Object.values(LITERATURE_FACTOR_PROPORTION).reduce((a, b) => a + b, 0);

/** Faktor skala tunggal: proporsi_literatur * SCALE = kontribusi maksimum faktor tsb. */
export const LITERATURE_SCALE = MAX_FACTOR_CONTRIBUTION_BUDGET / PROPORTION_SUM;
