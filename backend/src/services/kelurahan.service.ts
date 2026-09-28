import { prisma } from "../utils/prisma";

export interface ResolvedKelurahan {
  kelurahanId: string | null;
  externalLocationLabel: string | null;
}

/**
 * Menerjemahkan nama kelurahan (teks) ke FK `Kelurahan.id` bila cocok dengan
 * salah satu dari 15 kelurahan Kota Bontang, atau menyimpannya sebagai label
 * bebas (`externalLocationLabel`) bila di luar Bontang / tidak dikenali —
 * lihat FDD §3 & migration `normalize_screening_schema`.
 */
export async function resolveKelurahan(
  kelurahanName: string,
  isOutsideBontang: boolean
): Promise<ResolvedKelurahan> {
  if (isOutsideBontang) {
    return { kelurahanId: null, externalLocationLabel: kelurahanName };
  }

  const match = await prisma.kelurahan.findUnique({ where: { name: kelurahanName } });
  if (match) return { kelurahanId: match.id, externalLocationLabel: null };

  // Seharusnya tidak terjadi (Zod sudah memvalidasi terhadap daftar 15
  // kelurahan saat isOutsideBontang=false) — fallback jujur, data tetap
  // tersimpan sebagai label bebas alih-alih hilang/error.
  return { kelurahanId: null, externalLocationLabel: kelurahanName };
}

/** Preload semua Kelurahan jadi Map nama->id — dipakai proses batch/seed
 * supaya tidak query per-baris (penting untuk performa saat ribuan baris). */
export async function loadKelurahanMap(): Promise<Map<string, string>> {
  const rows = await prisma.kelurahan.findMany({ select: { id: true, name: true } });
  return new Map(rows.map((r) => [r.name, r.id]));
}
