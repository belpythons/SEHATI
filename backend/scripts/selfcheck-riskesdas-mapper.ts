import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as XLSX from "xlsx";
import { mapRiskesdasRow, RawRow } from "./riskesdasMapper";

const SOURCE_PATH = resolve(__dirname, "../data/sources/riskesdas-2018-baduta.xlsx");

const buf = readFileSync(SOURCE_PATH);
const wb = XLSX.read(buf, { type: "buffer" });
const sheet = wb.Sheets["Baduta real"];
const rows = XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: null });

let usable = 0;
let dropped = 0;
for (const raw of rows) {
  const mapped = mapRiskesdasRow(raw);
  if (!mapped) dropped++;
  else usable++;
}

console.log(`Total baris mentah (termasuk sel kosong sampai dimensi sheet): ${rows.length}`);
console.log(`Usable: ${usable}, Dropped (tidak punya data antropometri/label lengkap): ${dropped}`);

// Baseline yang sudah diverifikasi manual (lihat FDD §6 revisi): hanya 20
// baris dari file sumber ini yang benar-benar berisi data riil.
if (usable !== 20) {
  console.error(`FAIL  Diharapkan 20 baris usable, dapat ${usable}. Cek ulang file sumber/mapper.`);
  process.exitCode = 1;
} else {
  console.log("OK    Jumlah baris usable sesuai baseline (20).");
}
