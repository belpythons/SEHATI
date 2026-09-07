import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { BatchParserService } from "./BatchParserService";
import { ingestMessages } from "../../constants/messages";

const VALID_ROW = {
  clientToken: "BATCH_001",
  persona: "SURVEYOR",
  kelurahan: "API-API",
  ageMonths: 24,
  gender: "L",
  weightKg: 12.5,
  heightCm: 85.0,
  isOutsideBontang: false,
};

describe("BatchParserService", () => {
  test("memparse JSON array dan mentransformasi via adapter", async () => {
    const content = JSON.stringify([VALID_ROW, { ...VALID_ROW, clientToken: "BATCH_002" }]);

    const rows = await BatchParserService.parse("csv-survey", content);

    assert.equal(rows.length, 2);
    assert.equal(rows[0].kelurahan, "Api-Api");
    assert.equal(rows[0].gender, "Laki-Laki");
    assert.equal(rows[0].persona, "SURVEYOR");
  });

  test("memparse objek JSON tunggal menjadi array 1 elemen", async () => {
    const content = JSON.stringify(VALID_ROW);

    const rows = await BatchParserService.parse("csv-survey", content);

    assert.equal(rows.length, 1);
  });

  test("memparse konten CSV dengan header alias", async () => {
    const content = [
      "kelurahan,umur,jk,berat,tinggi",
      "API-API,24,L,12.5,85.0",
    ].join("\n");

    const rows = await BatchParserService.parse("csv-survey", content);

    assert.equal(rows.length, 1);
    assert.equal(rows[0].ageMonths, 24);
    assert.equal(rows[0].gender, "Laki-Laki");
  });

  test("konten kosong melempar emptyRecords", async () => {
    await assert.rejects(() => BatchParserService.parse("csv-survey", "   "), {
      message: ingestMessages.emptyRecords,
    });
  });

  test("JSON tidak valid melempar invalidJsonContent", async () => {
    await assert.rejects(() => BatchParserService.parse("csv-survey", "{invalid"), {
      message: ingestMessages.invalidJsonContent,
    });
  });

  test("source type tidak didukung melempar error", async () => {
    const content = JSON.stringify([VALID_ROW]);
    await assert.rejects(() => BatchParserService.parse("unknown-source", content), {
      message: "Unsupported source type: unknown-source",
    });
  });
});