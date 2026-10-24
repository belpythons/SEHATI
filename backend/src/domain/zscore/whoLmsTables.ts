/**
 * Tabel LMS resmi WHO Child Growth Standards 2006 (0-59 bulan).
 *
 * Sumber (diunduh langsung dari who.int, bukan reproduksi dari ingatan):
 * - Length/Height-for-Age: https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/indicators/length-height-for-age/expandable-tables/lhfa-{boys,girls}-zscore-expanded-tables.xlsx
 * - Weight-for-Age: https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/indicators/weight-for-age/expanded-tables/wfa-{boys,girls}-zscore-expanded-tables.xlsx
 * - Weight-for-Length (0-2 tahun): https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/indicators/weight-for-length-height/expanded-tables/wfl-{boys,girls}-zscore-expanded-table.xlsx
 * - Weight-for-Height (2-5 tahun): https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/indicators/weight-for-length-height/expanded-tables/wfh-{boys,girls}-zscore-expanded-tables.xlsx
 *
 * Tabel asli WHO berresolusi harian (Day 0-1856) untuk indeks umur, dan per
 * 0.1 cm untuk indeks panjang/tinggi. Karena input aplikasi berupa umur bulat
 * (0-59 bulan), tabel umur di-sample satu titik per bulan (day = round(month * 30.4375),
 * konvensi standar WHO Anthro). Tabel panjang/tinggi tetap resolusi penuh (0.1 cm)
 * karena pengukuran berat/tinggi memang kontinu.
 */
import raw from "./who-lms-data.json";

export interface LMSParams {
  L: number;
  M: number;
  S: number;
}

export type Gender = "male" | "female";

interface MeasureLMSPoint extends LMSParams {
  x: number;
}

interface WhoLmsData {
  lhfaMonthly: Record<Gender, Record<number, LMSParams>>;
  wfaMonthly: Record<Gender, Record<number, LMSParams>>;
  wflByLength: Record<Gender, MeasureLMSPoint[]>;
  wfhByHeight: Record<Gender, MeasureLMSPoint[]>;
}

const data = raw as unknown as WhoLmsData;

export function getLhfaParams(gender: Gender, ageMonths: number): LMSParams {
  const clamped = Math.min(59, Math.max(0, Math.round(ageMonths)));
  return data.lhfaMonthly[gender][clamped];
}

export function getWfaParams(gender: Gender, ageMonths: number): LMSParams {
  const clamped = Math.min(59, Math.max(0, Math.round(ageMonths)));
  return data.wfaMonthly[gender][clamped];
}

/**
 * Interpolasi linear LMS berdasar panjang/tinggi badan (bukan umur) dari tabel
 * WFL (0-2 tahun, panjang terlentang) atau WFH (2-5 tahun, tinggi berdiri).
 */
function interpolateByMeasure(table: MeasureLMSPoint[], measureCm: number): LMSParams {
  const clamped = Math.min(table[table.length - 1].x, Math.max(table[0].x, measureCm));

  let lo = table[0];
  let hi = table[table.length - 1];
  for (let i = 0; i < table.length - 1; i++) {
    if (table[i].x <= clamped && table[i + 1].x >= clamped) {
      lo = table[i];
      hi = table[i + 1];
      break;
    }
  }

  if (lo.x === hi.x) return { L: lo.L, M: lo.M, S: lo.S };

  const t = (clamped - lo.x) / (hi.x - lo.x);
  return {
    L: lo.L + t * (hi.L - lo.L),
    M: lo.M + t * (hi.M - lo.M),
    S: lo.S + t * (hi.S - lo.S),
  };
}

/** measurementPosition menentukan tabel: Terlentang (0-23bln, panjang) → WFL, Berdiri (24-59bln, tinggi) → WFH — sesuai pedoman WHO. */
export function getWfhwflParams(
  gender: Gender,
  ageMonths: number,
  heightCm: number
): LMSParams {
  const table = ageMonths < 24 ? data.wflByLength[gender] : data.wfhByHeight[gender];
  return interpolateByMeasure(table, heightCm);
}
