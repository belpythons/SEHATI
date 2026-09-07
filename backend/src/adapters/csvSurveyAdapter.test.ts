import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { CsvSurveyAdapter } from "./csvSurveyAdapter";
import { ingestMessages } from "../constants/messages";

const CANONICAL_ROW = {
  kelurahan: "API-API",
  ageMonths: 24,
  gender: "L",
  weightKg: 12.5,
  heightCm: 85.0,
  isOutsideBontang: false,
  animalProtein: [1, 2],
};

describe("CsvSurveyAdapter", () => {
  test("baris kosong menghasilkan array kosong", () => {
    const result = new CsvSurveyAdapter().transform([]);
    assert.deepEqual(result, []);
  });

  test("melempar csvHeaderInvalid saat kolom wajib hilang", () => {
    const row = { ...CANONICAL_ROW } as any;
    delete row.kelurahan;

    assert.throws(() => new CsvSurveyAdapter().transform([row]), {
      message: ingestMessages.csvHeaderInvalid,
    });
  });

  test("normalisasi nilai kanonik dan isi default determinan", () => {
    const [result] = new CsvSurveyAdapter().transform([{ ...CANONICAL_ROW }]);

    assert.equal(result.kelurahan, "Api-Api");
    assert.equal(result.ageMonths, 24);
    assert.equal(result.gender, "Laki-Laki");
    assert.equal(result.weightKg, 12.5);
    assert.equal(result.heightCm, 85);
    assert.equal(result.isOutsideBontang, false);
    assert.ok(typeof result.clientToken === "string");
    assert.equal(result.persona, "ORANG_TUA");
    assert.deepEqual(result.animalProtein, [1, 2]);

    assert.equal(result.bblrOption, 1);
    assert.equal(result.exclusiveAsi, 1);
    assert.equal(result.mpasiAge, 2);
    assert.equal(result.cleanWaterAccess, 1);
    assert.equal(result.sanitationAccess, 1);
    assert.equal(result.smokeExposure, 1);
    assert.equal(result.motherEducation, 1);
    assert.equal(result.economicQuintile, 1);
    assert.equal(result.diarrheaHistory, 1);
    assert.equal(result.posyanduKia, 2);

    assert.equal(result.sourceType, "SURVEY_CSV_UPLOAD");
    assert.equal(result.sourceBatchId, null);
  });

  test("normalisasi gender dari berbagai alias", () => {
    const adapter = new CsvSurveyAdapter();
    for (const gender of ["P", "F", "PEREMPUAN", "Perempuan"]) {
      const [r] = adapter.transform([{ ...CANONICAL_ROW, gender } as any]);
      assert.equal(r.gender, "Perempuan");
    }
  });

  test("animalProtein: nilai tunggal dibungkus array", () => {
    const [result] = new CsvSurveyAdapter().transform([
      { ...CANONICAL_ROW, animalProtein: 3 },
    ] as any);
    assert.deepEqual(result.animalProtein, [3]);
  });

  test("animalProtein: nilai di luar rentang 1-5 difilter", () => {
    const [result] = new CsvSurveyAdapter().transform([
      { ...CANONICAL_ROW, animalProtein: [9, 2, 0] },
    ] as any);
    assert.deepEqual(result.animalProtein, [2]);
  });

  test("animalProtein: array kosong atau tidak valid fallback [5]", () => {
    const adapter = new CsvSurveyAdapter();
    const invalid = adapter.transform([{ ...CANONICAL_ROW, animalProtein: [0] }] as any)[0];
    const empty = adapter.transform([{ ...CANONICAL_ROW, animalProtein: [9] }] as any)[0];
    assert.deepEqual(invalid.animalProtein, [5]);
    assert.deepEqual(empty.animalProtein, [5]);
  });
});