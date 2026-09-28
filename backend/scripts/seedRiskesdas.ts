/**
 * Seed 20 baris data riil Riskesdas 2018 ke tabel ScreeningRecord (lihat FDD §10).
 * Volume hanya 20 baris (bukan 130.620) — lihat §6 revisi kenapa.
 *
 * Jalankan: npx tsx scripts/seedRiskesdas.ts
 */
import "dotenv/config";

// Script one-off ini butuh transaksi interaktif (prisma.$transaction) yang
// tidak didukung baik oleh Supabase pooler mode transaction (port 6543).
// Pakai DIRECT_URL (session mode) khusus untuk proses seeding ini saja —
// app runtime tetap pakai DATABASE_URL (pooler) seperti biasa.
if (process.env.DIRECT_URL) {
  process.env.DATABASE_URL = process.env.DIRECT_URL;
}

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as XLSX from "xlsx";
import { mapRiskesdasRow, RawRow } from "./riskesdasMapper";
import { calculateZScores } from "../src/domain/zscore/zscoreEngine";
import { calculateRisk } from "../src/domain/risk/weightedRiskEngine";
import { BatchPersistenceService } from "../src/services/ingestion/BatchPersistenceService";

const SOURCE_PATH = resolve(__dirname, "../data/sources/riskesdas-2018-baduta.xlsx");
const SOURCE_NAME = "riskesdas-2018-baduta.xlsx";

// Nilai default untuk 2 fitur yang tidak punya kolom identik di dataset ini
// (lihat FDD §6/§10.1) — dicatat transparan per baris di rawMetadata.
const DEFAULT_SMOKE_EXPOSURE = 2; // "Terpapar" — prevalensi rumah tangga dengan perokok tinggi secara nasional
const DEFAULT_DIARRHEA_HISTORY = 1; // "Tidak Pernah / 1x Ringan" — mayoritas kasus

async function main() {
  console.log(`Membaca ${SOURCE_PATH} ...`);
  const buf = readFileSync(SOURCE_PATH);
  const wb = XLSX.read(buf, { type: "buffer" });
  const sheet = wb.Sheets["Baduta real"];
  const rawRows = XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: null });

  const records: any[] = [];

  for (const raw of rawRows) {
    const mapped = mapRiskesdasRow(raw);
    if (!mapped) continue;

    // TB/U: pakai nilai RESMI dari Kemenkes (bukan dihitung ulang, lihat FDD §10.1).
    // BB/U & BB/TB: dataset tidak menyertakan nilai resmi -> hitung sendiri pakai
    // zscoreEngine (tabel WHO asli) dari berat/tinggi/umur yang sama.
    const computed = calculateZScores({
      ageMonths: mapped.ageMonths,
      gender: mapped.gender,
      weightKg: mapped.weightKg,
      heightCm: mapped.heightCm,
    });

    const determinants = {
      ...mapped.determinants,
      smokeExposure: DEFAULT_SMOKE_EXPOSURE,
      diarrheaHistory: DEFAULT_DIARRHEA_HISTORY,
    };

    const risk = calculateRisk({
      zScoreTBU: mapped.zScoreTBU,
      ...determinants,
    });

    const dataQualityNotes = [
      ...mapped.dataQualityNotes,
      "smokeExposure:default_nasional_tidak_ada_kolom",
      "diarrheaHistory:default_mayoritas_tidak_ada_kolom",
    ];

    records.push({
      persona: "Surveyor / Peneliti Lapangan",
      kelurahan: "Data Riskesdas Nasional",
      isOutsideBontang: true,
      ageMonths: mapped.ageMonths,
      gender: mapped.gender === "L" ? "Laki-Laki" : "Perempuan",
      weightKg: mapped.weightKg,
      heightCm: mapped.heightCm,
      zScore: mapped.zScoreTBU, // resmi Kemenkes
      zScoreWAZ: computed.zScoreWAZ,
      zScoreWHZ: computed.zScoreWHZ,
      statusGiziTBU: mapped.statusGiziTBU, // resmi Kemenkes
      statusGiziBBU: computed.statusGiziBBU,
      statusGiziBBTB: computed.statusGiziBBTB,
      ...determinants,
      riskTier: risk.riskTier,
      riskScore: risk.riskScore,
      dominantFactors: risk.dominantFactors,
      rawMetadata: { dataQualityNotes, source: SOURCE_NAME },
    });
  }

  console.log(`Baris siap diseed: ${records.length}`);

  const result = await BatchPersistenceService.saveBatch(
    records,
    "riskesdas",
    SOURCE_NAME,
    `RISKESDAS-2018-${Date.now()}`,
    records.length
  );

  console.log("Hasil seeding:", result);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seeding gagal:", err);
    process.exit(1);
  });
