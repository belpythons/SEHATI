// Parser CSV ringan: mendukung quoted field, escaping quotes, dan header
// yang dinormalisasi dari snake_case/kebab/pascal menjadi camelCase.

export interface CsvParseResult {
  headers: string[];
  rows: Record<string, any>[];
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields.map((f) => f.trim());
}

function snakeToCamel(header: string): string {
  const cleaned = header.trim().toLowerCase();
  return cleaned.replace(/[\s-]+(.)/g, (_, c: string) => c.toUpperCase()).replace(/[\s-]/g, "");
}

// Alias nama kolom umum -> nama kanonik schema/prisma
const HEADER_ALIASES: Record<string, string> = {
  client_token: "clientToken",
  age_months: "ageMonths",
  umur: "ageMonths",
  umur_bulan: "ageMonths",
  jenis_kelamin: "gender",
  jk: "gender",
  weight_kg: "weightKg",
  berat: "weightKg",
  berat_kg: "weightKg",
  berat_badan: "weightKg",
  bb: "weightKg",
  height_cm: "heightCm",
  tinggi: "heightCm",
  tinggi_cm: "heightCm",
  tinggi_badan: "heightCm",
  tb: "heightCm",
  is_outside_bontang: "isOutsideBontang",
  outside_bontang: "isOutsideBontang",
  bblr: "bblrOption",
  bblr_option: "bblrOption",
  asi: "exclusiveAsi",
  asi_eksklusif: "exclusiveAsi",
  exclusive_asi: "exclusiveAsi",
  mpasi: "mpasiAge",
  mpasi_age: "mpasiAge",
  protein: "animalProtein",
  protein_hewani: "animalProtein",
  animal_protein: "animalProtein",
  air_bersih: "cleanWaterAccess",
  clean_water_access: "cleanWaterAccess",
  sanitasi: "sanitationAccess",
  wc: "sanitationAccess",
  sanitation_access: "sanitationAccess",
  asap_rokok: "smokeExposure",
  rokok: "smokeExposure",
  smoke_exposure: "smokeExposure",
  pendidikan_ibu: "motherEducation",
  mother_education: "motherEducation",
  kuintil: "economicQuintile",
  kuintil_ekonomi: "economicQuintile",
  economic_quintile: "economicQuintile",
  diare: "diarrheaHistory",
  riwayat_diare: "diarrheaHistory",
  diarrhea_history: "diarrheaHistory",
  posyandu: "posyanduKia",
  kia: "posyanduKia",
  posyandu_kia: "posyanduKia",
  source_batch_id: "sourceBatchId",
};

function normalizeHeader(header: string): string {
  const raw = header.trim().toLowerCase();
  return HEADER_ALIASES[raw] ?? snakeToCamel(header);
}

export function parseCsv(content: string): CsvParseResult {
  const lines = content
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((l) => l.trim() !== "");

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const rows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const record: Record<string, any> = {};
    headers.forEach((header, index) => {
      const value = values[index];
      if (value !== undefined && value !== "") {
        record[header] = value;
      }
    });
    return record;
  });

  return { headers, rows };
}