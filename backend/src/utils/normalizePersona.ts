/**
 * Normalisasi persona ke salah satu dari 4 nilai kanonik yang dikunci oleh
 * CHECK constraint di database (lihat migration `normalize_screening_schema`
 * dan `backend/Backend API Gateway FDD.md` §3). Sebelum ini ada 3 varian
 * string berbeda ditulis ke kolom yang sama dari titik kode berbeda
 * (`session.controller.ts` & `services/ingestion/BatchPersistenceService.ts`
 * melewati validasi Zod di `screeningSchema` sama sekali) — fungsi ini jadi
 * satu sumber kebenaran yang dipakai ulang di semua titik tulis.
 *
 * Logika pemetaan sama persis dengan preprocessor Zod di
 * `validations/screening.schema.ts` (dipertahankan agar perilaku jalur submit
 * PWA tidak berubah), hanya di sini tanpa melempar error — nilai yang tidak
 * dikenali jatuh ke default netral, bukan menolak request.
 */
export const CANONICAL_PERSONAS = [
  "Orang Tua / Anggota Keluarga Balita",
  "Kader Posyandu",
  "Tenaga Kesehatan / Bidan",
  "Surveyor / Peneliti Lapangan",
] as const;

export type CanonicalPersona = (typeof CANONICAL_PERSONAS)[number];

const DEFAULT_PERSONA: CanonicalPersona = "Orang Tua / Anggota Keluarga Balita";

export function normalizePersona(input: unknown): CanonicalPersona {
  if (typeof input !== "string") return DEFAULT_PERSONA;
  const key = input.trim().toUpperCase();

  switch (key) {
    case "ORANG TUA":
    case "ORANG_TUA":
    case "ANGGOTA KELUARGA BALITA":
    case "ORANG TUA / ANGGOTA KELUARGA BALITA":
      return "Orang Tua / Anggota Keluarga Balita";
    case "KADER POSYANDU":
    case "KADER_POSYANDU":
    case "KADER":
      return "Kader Posyandu";
    case "TENAGA KESEHATAN":
    case "TENAGA_KESEHATAN":
    case "BIDAN":
      return "Tenaga Kesehatan / Bidan";
    case "SURVEYOR":
    case "PENELITI LAPANGAN":
    case "SURVEYOR_BATCH":
      return "Surveyor / Peneliti Lapangan";
    default:
      return CANONICAL_PERSONAS.includes(key as CanonicalPersona)
        ? (key as CanonicalPersona)
        : DEFAULT_PERSONA;
  }
}
