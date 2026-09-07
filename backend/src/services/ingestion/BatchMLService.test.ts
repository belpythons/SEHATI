import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { BatchMlService } from "./BatchMLService";
import { ingestMessages, mlServiceMessages } from "../../constants/messages";

const ML_STUB_RESULT = {
  zScore: -2.1,
  zScoreWAZ: -1.9,
  zScoreWHZ: -1.2,
  statusGiziTBU: "Stunted",
  statusGiziBBU: "Normal",
  statusGiziBBTB: "Normal",
  riskTier: "HIGH",
  riskScore: 0.85,
  dominantFactors: ["BBLR", "Pendidikan ibu rendah"],
};

const ROW = {
  clientToken: "BATCH_001",
  kelurahan: "Api-Api",
  ageMonths: 24,
  gender: "Laki-Laki",
  weightKg: 12.5,
  heightCm: 85.0,
  isOutsideBontang: false,
};

describe("BatchMlService", () => {
  test("baris dengan hasil prekomputasi tidak memanggil ML", async () => {
    const precomputed = {
      ...ROW,
      zScore: -3.0,
      riskTier: "HIGH",
      riskScore: 0.9,
    };
    let called = false;
    const predict = async () => {
      called = true;
      return ML_STUB_RESULT;
    };

    const result = await BatchMlService.enrichWithML(precomputed, predict as any);

    assert.equal(result, precomputed);
    assert.equal(called, false);
  });

  test("baris tanpa skor dienrich dari hasil prediksi ML", async () => {
    let received: any = null;
    const predict = (async (input: any) => {
      received = input;
      return ML_STUB_RESULT;
    }) as any;

    const result = await BatchMlService.enrichWithML({ ...ROW }, predict);

    assert.deepEqual(received, { ageMonths: 24, gender: "Laki-Laki", weightKg: 12.5, heightCm: 85 });
    assert.equal(result.zScore, -2.1);
    assert.equal(result.zScoreWAZ, -1.9);
    assert.equal(result.statusGiziTBU, "Stunted");
    assert.equal(result.riskTier, "HIGH");
    assert.equal(result.riskScore, 0.85);
    assert.deepEqual(result.dominantFactors, ["BBLR", "Pendidikan ibu rendah"]);
  });

  test("kolom opsional ML yang tidak ada diisi null", async () => {
    const predict = (async () => ({
      zScore: -2.1,
      riskTier: "HIGH",
      riskScore: 0.85,
    })) as any;

    const result = await BatchMlService.enrichWithML({ ...ROW }, predict);

    assert.equal(result.zScoreWAZ, null);
    assert.equal(result.zScoreWHZ, null);
    assert.equal(result.statusGiziTBU, null);
    assert.equal(result.statusGiziBBU, null);
    assert.equal(result.statusGiziBBTB, null);
    assert.deepEqual(result.dominantFactors, []);
  });

  test("nilai angka tidak valid melempar invalidNumericValues", async () => {
    const predict = (async () => ML_STUB_RESULT) as any;

    await assert.rejects(
      () => BatchMlService.enrichWithML({ ...ROW, ageMonths: "abc" }, predict),
      (err: any) =>
        err instanceof Error && err.message.startsWith(ingestMessages.invalidNumericValues)
    );
  });

  test("respons ML tidak lengkap melempar missingRequiredFields", async () => {
    const predict = (async () => ({ riskTier: "HIGH", riskScore: 0.5 })) as any;

    await assert.rejects(() => BatchMlService.enrichWithML({ ...ROW }, predict), {
      message: mlServiceMessages.missingRequiredFields,
    });
  });

  test("error dari layanan ML diteruskan apa adanya", async () => {
    const predict = (async () => {
      throw new Error("ML service down");
    }) as any;

    await assert.rejects(() => BatchMlService.enrichWithML({ ...ROW }, predict), {
      message: "ML service down",
    });
  });
});