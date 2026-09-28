/**
 * Pemetaan 1 baris mentah Riskesdas 2018 (sheet "Baduta real") ke skema
 * kanonik SEHATI (field ScreeningRecord). Dipakai oleh seeder Stage 5 —
 * satu sumber kebenaran untuk mapping kolom, lihat tabel lengkap di
 * `backend/Backend API Gateway FDD.md` §10.1.
 *
 * Catatan: rencana awal juga memakai file ini untuk melatih Naive Bayes,
 * tapi dataset sumber ternyata hanya berisi ~20 baris riil (lihat FDD §6
 * revisi) — jauh di bawah volume minimum untuk pelatihan statistik yang
 * valid. Modul ini sekarang murni dipakai untuk seeding data uji riil.
 */
import { animalProteinBucket } from "../src/domain/risk/determinantCodes";

export type RawRow = Record<string, unknown>;

export interface MappedRow {
  ageMonths: number;
  gender: "L" | "P";
  weightKg: number;
  heightCm: number;
  zScoreTBU: number;
  statusGiziTBU: string;
  determinants: {
    bblrOption: number;
    exclusiveAsi: number;
    mpasiAge: number;
    animalProtein: number[];
    cleanWaterAccess: number;
    sanitationAccess: number;
    motherEducation: number;
    economicQuintile: number;
    posyanduKia: number;
  };
  dataQualityNotes: string[];
}

function num(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "string" && (v.trim() === "" || v.trim().toUpperCase() === "#NULL!")) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function str(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  if (s === "" || s.toUpperCase() === "#NULL!") return null;
  return s;
}

function mapBblrOption(row: RawRow, notes: string[]): number {
  const ditimbang = num(row["P1404"]); // 1=ya,2=tidak,8=tidak tahu
  const beratLahir = num(row["P1405"]); // gram
  if (ditimbang === 1 && beratLahir !== null) {
    return beratLahir < 2500 ? 2 : 1;
  }
  notes.push("bblrOption:fallback_tidak_tahu");
  return 3;
}

function mapExclusiveAsi(row: RawRow, notes: string[]): number {
  const pernahDisusui = num(row["P1303"]); // 1=pernah,2=belum,3=tidak pernah
  const diberiMakananLain24Jam = num(row["P1307"]); // 1=ya,2=tidak
  if (pernahDisusui === 2) return 3; // belum disusui -> asumsikan masih <6 bulan
  if (pernahDisusui === 1 && diberiMakananLain24Jam === 2) return 1; // eksklusif
  if (pernahDisusui === 1 && diberiMakananLain24Jam === 1) return 2; // tidak eksklusif
  notes.push("exclusiveAsi:fallback_tidak_eksklusif");
  return 2;
}

function mapMpasiAge(row: RawRow, notes: string[]): number {
  const kategori = num(row["P1311"]);
  if (kategori === null) {
    notes.push("mpasiAge:fallback_tepat");
    return 2;
  }
  if (kategori === 77) return 4; // tidak berlaku -> belum MPASI
  if (kategori <= 6) return 1; // <=4 bulan -> dini
  if (kategori === 7) return 2; // 5-6 bulan -> tepat
  return 3; // >6 bulan -> terlambat
}

function mapAnimalProtein(row: RawRow): number[] {
  const freqDagingMerah = num(row["P705A1"]) || 0;
  const freqDagingPutih = num(row["P705B1"]) || 0;
  const freqIkan = num(row["P705C1"]) || 0;
  const freqTelur = num(row["P705D1"]) || 0;
  const freqSusu = Math.max(num(row["P706A1"]) || 0, num(row["P706B1"]) || 0);

  const sources: number[] = [];
  if (freqIkan >= 1) sources.push(1);
  if (freqTelur >= 1) sources.push(2);
  if (freqDagingMerah >= 1 || freqDagingPutih >= 1) sources.push(3);
  if (freqSusu >= 1) sources.push(4);
  if (sources.length === 0) return [5];
  return sources;
}

function mapCleanWaterAccess(row: RawRow, notes: string[]): number {
  const p501 = num(row["P501"]);
  if (p501 === null) {
    notes.push("cleanWaterAccess:fallback_pdam");
    return 2;
  }
  if (p501 === 1 || p501 === 2) return 1; // kemasan / isi ulang
  if (p501 === 3) return 2; // PDAM/ledeng
  if (p501 === 11) return 3; // sumur bor/pompa
  return 4; // sisanya: tidak terlindungi
}

function mapSanitationAccess(row: RawRow, notes: string[]): number {
  const p504 = num(row["P504"]); // 1=milik sendiri,2=milik sendiri+ruta lain,3=milik tapi tak dipakai,4=tidak punya
  const p506 = num(row["P506"]); // 1=IPAL,2=septic tank,...
  if (p504 === 4) return 4; // tidak punya jamban
  if (p504 === 1 && (p506 === 1 || p506 === 2)) return 1; // milik sendiri + septic tank/IPAL
  if (p504 === 2) return 3; // dipakai bersama -> MCK-like
  if (p504 === null) {
    notes.push("sanitationAccess:fallback_cemplung");
    return 2;
  }
  return 2; // milik sendiri tapi tanpa septic tank memadai -> cemplung
}

function mapMotherEducation(row: RawRow, notes: string[]): number {
  const didikIbu = num(row["DIDIK_IBU"]);
  if (didikIbu === null) {
    notes.push("motherEducation:fallback_smp");
    return 2;
  }
  if (didikIbu <= 2) return 1; // tidak tamat/tamat SD
  if (didikIbu === 3) return 2; // SMP
  if (didikIbu === 4) return 3; // SMA
  return 4; // Diploma/PT
}

function mapEconomicQuintile(row: RawRow, notes: string[]): number {
  const kuintil = num(row["kuintil"]);
  if (kuintil === null || kuintil < 1 || kuintil > 5) {
    notes.push("economicQuintile:fallback_q3");
    return 3;
  }
  return Math.round(kuintil);
}

function mapPosyanduKia(row: RawRow, notes: string[]): number {
  const p1004 = num(row["P1004"]); // 1=bisa tunjukkan,2=ada tp disimpan kader,3=hilang,4=tidak pernah
  if (p1004 === 1) return 1;
  if (p1004 === 2) return 2;
  if (p1004 === 3 || p1004 === 4) return 3;
  notes.push("posyanduKia:fallback_kadang");
  return 2;
}

export function mapRiskesdasRow(row: RawRow): MappedRow | null {
  const ageMonths = num(row["UMUR_BL_B"]);
  const genderRaw = num(row["P404"]);
  const weightKg = num(row["WEIGHT3_02012023_VALIDASI"]);
  const heightCm = num(row["HEIGHT3_02012023_VALIDASI"]);
  const zScoreTBU = num(row["Z-Score (PB/U)"]);
  const statusGizi = str(row["Status Gizi"]);

  // Baris tanpa data antropometri tervalidasi/label riil tidak bisa dipakai —
  // dibuang, bukan ditebak (lihat FDD §6).
  if (
    ageMonths === null || ageMonths < 0 || ageMonths > 59 ||
    genderRaw === null ||
    weightKg === null || weightKg <= 0 || weightKg > 30 ||
    heightCm === null || heightCm <= 0 || heightCm > 130 ||
    zScoreTBU === null ||
    !statusGizi
  ) {
    return null;
  }

  const notes: string[] = [];
  const animalProtein = mapAnimalProtein(row);
  void animalProteinBucket; // dipakai di weightedRiskEngine, bukan di sini

  return {
    ageMonths: Math.round(ageMonths),
    gender: genderRaw === 1 ? "L" : "P",
    weightKg,
    heightCm,
    zScoreTBU,
    statusGiziTBU: statusGizi,
    determinants: {
      bblrOption: mapBblrOption(row, notes),
      exclusiveAsi: mapExclusiveAsi(row, notes),
      mpasiAge: mapMpasiAge(row, notes),
      animalProtein,
      cleanWaterAccess: mapCleanWaterAccess(row, notes),
      sanitationAccess: mapSanitationAccess(row, notes),
      motherEducation: mapMotherEducation(row, notes),
      economicQuintile: mapEconomicQuintile(row, notes),
      posyanduKia: mapPosyanduKia(row, notes),
    },
    dataQualityNotes: notes,
  };
}
