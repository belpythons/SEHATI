import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { BatchValidationService } from "./BatchValidationService";

const VALID_ROW = {
  clientToken: "BATCH_001",
  persona: "SURVEYOR",
  kelurahan: "Api-Api",
  ageMonths: 24,
  gender: "Laki-Laki",
  weightKg: 12.5,
  heightCm: 85.0,
  isOutsideBontang: false,
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
};

describe("BatchValidationService", () => {
  test("baris valid lolos validasi dan persona dinormalisasi", () => {
    const result = BatchValidationService.validateRow(VALID_ROW);

    assert.equal(result.valid, true);
    assert.equal(result.data.persona, "Surveyor / Peneliti Lapangan");
    assert.equal(result.data.kelurahan, "Api-Api");
    assert.equal(result.data.isOutsideBontang, false);
  });

  test("field ML prekomputasi dari sumber dipertahankan", () => {
    const row = {
      ...VALID_ROW,
      zScore: -3.1,
      zScoreWAZ: -2.9,
      statusGiziTBU: "Severely Stunted",
      riskTier: "HIGH",
      riskScore: 0.95,
      dominantFactors: ["Berat lahir rendah"],
    };

    const result = BatchValidationService.validateRow(row);

    assert.equal(result.valid, true);
    assert.equal(result.data.zScore, -3.1);
    assert.equal(result.data.zScoreWAZ, -2.9);
    assert.equal(result.data.statusGiziTBU, "Severely Stunted");
    assert.equal(result.data.riskTier, "HIGH");
    assert.equal(result.data.riskScore, 0.95);
    assert.deepEqual(result.data.dominantFactors, ["Berat lahir rendah"]);
  });

  test("baris dengan usia di luar rentang gagal validasi", () => {
    const result = BatchValidationService.validateRow({ ...VALID_ROW, ageMonths: 100 });

    assert.equal(result.valid, false);
    assert.ok(Array.isArray(result.errors));
    assert.ok((result.errors ?? []).length > 0);
    assert.ok((result.errors ?? []).some((e) => e.includes("ageMonths")));
  });

  test("baris tanpa clientToken gagal validasi", () => {
    const row = { ...VALID_ROW } as any;
    delete row.clientToken;

    const result = BatchValidationService.validateRow(row);

    assert.equal(result.valid, false);
    assert.ok((result.errors ?? []).some((e) => e.includes("clientToken")));
  });

  test("baris tanpa isOutsideBontang gagal validasi", () => {
    const row = { ...VALID_ROW } as any;
    delete row.isOutsideBontang;

    const result = BatchValidationService.validateRow(row);

    assert.equal(result.valid, false);
  });

  test("baris tanpa persona diisi default valid", () => {
    const row = { ...VALID_ROW } as any;
    delete row.persona;

    const result = BatchValidationService.validateRow(row);

    assert.equal(result.valid, true);
    assert.equal(result.data.persona, "Orang Tua / Anggota Keluarga Balita");
  });
});