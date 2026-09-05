import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { toScreeningRecordInput } from "./BatchPersistenceService";
import { DataSourceType } from "../../generated/prisma/client";

const ENRICHED_ROW = {
  clientToken: "BATCH_001",
  persona: "SURVEYOR",
  kelurahan: "Api-Api",
  ageMonths: 24,
  gender: "Laki-Laki",
  weightKg: 12.5,
  heightCm: 85,
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
  zScore: -2.1,
  zScoreWAZ: -1.8,
  zScoreWHZ: -1.0,
  statusGiziTBU: "Stunted",
  statusGiziBBU: "Normal",
  statusGiziBBTB: "Normal",
  riskTier: "HIGH",
  riskScore: 0.85,
  dominantFactors: ["BBLR"],
};

const META = {
  shareHash: "abc123",
  sessionId: "sess-1",
  sourceType: DataSourceType.SURVEY_CSV_UPLOAD,
  sourceBatchId: "BATCH_1",
};

describe("toScreeningRecordInput", () => {
  test("memetakan hanya kolom whitelist ScreeningRecord dan menghapus clientToken", () => {
    const out = toScreeningRecordInput(ENRICHED_ROW, META);

    assert.ok(!("clientToken" in out));
    assert.equal(out.persona, "SURVEYOR");
    assert.equal(out.kelurahan, "Api-Api");
    assert.equal(out.ageMonths, 24);
    assert.equal(out.gender, "Laki-Laki");
    assert.equal(out.weightKg, 12.5);
    assert.equal(out.heightCm, 85);
    assert.equal(out.isOutsideBontang, false);
    assert.deepEqual(out.animalProtein, [1, 2]);
    assert.equal(out.zScore, -2.1);
    assert.equal(out.statusGiziTBU, "Stunted");
    assert.equal(out.riskTier, "HIGH");
    assert.deepEqual(out.dominantFactors, ["BBLR"]);
    assert.equal(out.shareHash, "abc123");
    assert.equal(out.sessionId, "sess-1");
    assert.equal(out.sourceType, DataSourceType.SURVEY_CSV_UPLOAD);
    assert.equal(out.sourceBatchId, "BATCH_1");
  });

  test("kolom asing dari sumber tidak ikut terpilih", () => {
    const row = { ...ENRICHED_ROW, kode_region: "75", extras: true } as any;

    const out = toScreeningRecordInput(row, META);

    assert.ok(!("kode_region" in out));
    assert.ok(!("extras" in out));
  });

  test("meta override nilai row untuk kolom milik meta", () => {
    const row = { ...ENRICHED_ROW, sourceType: "PWA_DIRECT_USER", shareHash: "from-row" } as any;

    const out = toScreeningRecordInput(row, META);

    assert.equal(out.sourceType, DataSourceType.SURVEY_CSV_UPLOAD);
    assert.equal(out.shareHash, "abc123");
  });

  test("sourceBatchId nullable tetap dipertahankan", () => {
    const out = toScreeningRecordInput(ENRICHED_ROW, { ...META, sourceBatchId: null });

    assert.equal(out.sourceBatchId, null);
  });
});