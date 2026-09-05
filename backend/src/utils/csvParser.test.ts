import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { parseCsv } from "./csvParser";

describe("parseCsv", () => {
  test("normalisasi header snake_case / bahasa Indonesia ke camelCase", () => {
    const content = [
      "kelurahan,umur,jk,berat,tinggi",
      "Api-Api,24,L,12.5,85.0",
    ].join("\n");

    const { headers, rows } = parseCsv(content);

    assert.deepEqual(headers, ["kelurahan", "ageMonths", "gender", "weightKg", "heightCm"]);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].kelurahan, "Api-Api");
    assert.equal(rows[0].ageMonths, "24");
    assert.equal(rows[0].gender, "L");
    assert.equal(rows[0].weightKg, "12.5");
    assert.equal(rows[0].heightCm, "85.0");
  });

  test("field dengan kutip dan koma di dalamnya", () => {
    const content = [
      "kelurahan,umur,catatan",
      '"Bontang, Kuala",18,"anak, aktif"',
    ].join("\n");

    const { rows } = parseCsv(content);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].kelurahan, "Bontang, Kuala");
    assert.equal(rows[0].ageMonths, "18");
    assert.equal(rows[0].catatan, "anak, aktif");
  });

  test("escape double quote (\"\") di dalam kutip", () => {
    const content = [
      'kelurahan,umur,nama',
      '"Gunung ""Kutai""",24,Ani',
    ].join("\n");

    const { rows } = parseCsv(content);
    assert.equal(rows[0].kelurahan, 'Gunung "Kutai"');
  });

  test("alias header: kolom tambahan diterjemahkan", () => {
    const content = [
      "kelurahan,umur_bulan,weight_kg,height_cm,posyandu",
      "Loktuan,18,8.2,74.5,1",
    ].join("\n");

    const { headers } = parseCsv(content);
    assert.ok(headers.includes("ageMonths"));
    assert.ok(headers.includes("weightKg"));
    assert.ok(headers.includes("heightCm"));
    assert.ok(headers.includes("posyanduKia"));
  });

  test("baris kosong diabaikan", () => {
    const content = ["kelurahan,umur", "", "Loktuan,18", "", "Api-Api,24", ""].join("\n");

    const { rows } = parseCsv(content);
    assert.equal(rows.length, 2);
  });

  test("konten kosong menghasilkan array kosong", () => {
    const { headers, rows } = parseCsv("");
    assert.deepEqual(headers, []);
    assert.deepEqual(rows, []);
  });

  test("CRLF dinormalisasi menjadi LF", () => {
    const content = "kelurahan,umur\r\nLoktuan,18\r\nApi-Api,24\r\n";

    const { rows } = parseCsv(content);
    assert.equal(rows.length, 2);
  });
});