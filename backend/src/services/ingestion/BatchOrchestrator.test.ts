import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { BatchOrchestrator } from "./BatchOrchestrator";

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

function makeSaveBatchMock() {
  const calls: Array<{
    data: any[];
    sourceType: string;
    sourceName: string;
    batchId: string;
    totalRecords: number;
  }> = [];

  const saveBatch = (async (
    data: any[],
    sourceType: string,
    sourceName: string,
    batchId: string,
    totalRecords: number
  ) => {
    calls.push({ data, sourceType, sourceName, batchId, totalRecords });
    return {
      totalRecords,
      successCount: data.length,
      failedCount: totalRecords - data.length,
    };
  }) as any;

  return { saveBatch, calls };
}

async function enrichStub(row: any) {
  return {
    ...row,
    zScore: -2.1,
    zScoreWAZ: null,
    zScoreWHZ: null,
    statusGiziTBU: "Stunted",
    statusGiziBBU: null,
    statusGiziBBTB: null,
    riskTier: "HIGH",
    riskScore: 0.85,
    dominantFactors: [],
  };
}

describe("BatchOrchestrator", () => {
  test("proses batch sukses penuh", async () => {
    const { saveBatch, calls } = makeSaveBatchMock();
    const content = JSON.stringify([VALID_ROW, { ...VALID_ROW, clientToken: "BATCH_002" }]);

    const result = await BatchOrchestrator.processBatch(
      "csv-survey",
      content,
      "survey.csv",
      { saveBatch, enrichWithML: enrichStub }
    );

    assert.equal(result.errors.length, 0);
    assert.equal(result.totalRecords, 2);
    assert.equal(result.successCount, 2);
    assert.equal(result.failedCount, 0);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].data.length, 2);
    assert.equal(calls[0].totalRecords, 2);
    assert.equal(calls[0].sourceType, "csv-survey");
    assert.ok(calls[0].batchId.startsWith("BATCH_"));
  });

  test("sebagian baris gagal validasi menghasilkan error per baris", async () => {
    const { saveBatch, calls } = makeSaveBatchMock();
    const invalidRow = { ...VALID_ROW, clientToken: "BATCH_INVALID", weightKg: -5 };
    const content = JSON.stringify([VALID_ROW, invalidRow]);

    const result = await BatchOrchestrator.processBatch(
      "csv-survey",
      content,
      "survey.csv",
      { saveBatch, enrichWithML: enrichStub }
    );

    assert.equal(result.errors.length, 1);
    assert.equal(result.errors[0].row, 2);
    assert.ok(result.errors[0].message.includes("baris 2"));
    assert.ok(Array.isArray(result.errors[0].details));
    assert.equal(result.successCount, 1);
    assert.equal(result.failedCount, 1);
    assert.equal(calls[0].data.length, 1);
    assert.equal(calls[0].totalRecords, 2);
  });

  test("semua baris gagal validasi hanya membuat log (tanpa insert)", async () => {
    const { saveBatch, calls } = makeSaveBatchMock();
    const content = JSON.stringify([
      { ...VALID_ROW, weightKg: -5 },
      { ...VALID_ROW, clientToken: "BATCH_002", heightCm: 999 },
    ]);

    const result = await BatchOrchestrator.processBatch(
      "csv-survey",
      content,
      "survey.csv",
      { saveBatch, enrichWithML: enrichStub }
    );

    assert.equal(result.errors.length, 2);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].data.length, 0);
    assert.equal(calls[0].totalRecords, 2);
  });

  test("kegagalan enrichment ML dicatat sebagai error", async () => {
    const { saveBatch, calls } = makeSaveBatchMock();
    const content = JSON.stringify([VALID_ROW]);

    const failingEnrich = async () => {
      throw new Error("ML service down");
    };

    const result = await BatchOrchestrator.processBatch(
      "csv-survey",
      content,
      "survey.csv",
      { saveBatch, enrichWithML: failingEnrich as any }
    );

    assert.equal(result.errors.length, 1);
    assert.equal(result.errors[0], "ML service down");
    assert.equal(calls[0].data.length, 0);
    assert.equal(result.successCount, 0);
  });
});