import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { RiskesdasAdapter } from "./riskesdasAdapter";
import { ingestMessages } from "../constants/messages";

const CANONICAL_ROW = {
  kelurahan: "LOKTUAN",
  ageMonths: 18,
  gender: "P",
  weightKg: 8.2,
  heightCm: 74.5,
  isOutsideBontang: false,
};

describe("RiskesdasAdapter", () => {
  test("baris kosong menghasilkan array kosong", () => {
    assert.deepEqual(new RiskesdasAdapter().transform([]), []);
  });

  test("melempar csvHeaderInvalid saat kolom wajib hilang", () => {
    const row = { ...CANONICAL_ROW } as any;
    delete row.heightCm;

    assert.throws(() => new RiskesdasAdapter().transform([row]), {
      message: ingestMessages.csvHeaderInvalid,
    });
  });

  test("normalisasi nilai kanonik dan set sourceType", () => {
    const [result] = new RiskesdasAdapter().transform([{ ...CANONICAL_ROW }]);

    assert.equal(result.kelurahan, "Loktuan");
    assert.equal(result.ageMonths, 18);
    assert.equal(result.gender, "Perempuan");
    assert.equal(result.weightKg, 8.2);
    assert.equal(result.heightCm, 74.5);
    assert.equal(result.isOutsideBontang, false);
    assert.equal(result.persona, "ORANG_TUA");
    assert.equal(result.sourceType, "RISKESDAS_KEMENKES");
    assert.equal(result.sourceBatchId, null);
    assert.deepEqual(result.animalProtein, [5]);
  });

  test("hasil komputasi ML dari sumber (zScore/riskTier) dipertahankan", () => {
    const [result] = new RiskesdasAdapter().transform([
      {
        ...CANONICAL_ROW,
        zScore: -3.1,
        riskTier: "HIGH",
        riskScore: 0.95,
        dominantFactors: ["Berat lahir rendah"],
      },
    ]);

    assert.equal(result.zScore, -3.1);
    assert.equal(result.riskTier, "HIGH");
    assert.equal(result.riskScore, 0.95);
    assert.deepEqual(result.dominantFactors, ["Berat lahir rendah"]);
  });
});