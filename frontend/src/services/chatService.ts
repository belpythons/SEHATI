/**
 * Chat Service — Gemini AI Consultation Streaming Client
 *
 * Implements SSE (Server-Sent Events) streaming for real-time interactive
 * nutrition consultation based on the child's screening context.
 *
 * Note: Uses mock progressive streaming by default per Phase 6 instructions
 * to ensure bulletproof demonstration reliability. Contract strictly matches
 * GET /api/v1/chat/stream?sessionId=${sessionId}&query=${encodeURIComponent(query)}.
 */
import { ScreeningRecord } from '../types/screening'

export interface ChatStreamOptions {
  sessionId: string
  query: string
  record: ScreeningRecord | null
  onChunk: (chunk: string) => void
  onDone: () => void
  onError: (error: Error) => void
  signal?: AbortSignal
}

/**
 * Generate contextual mock answers grounded in child's screening metrics & Bontang local foods
 */
function generateContextualAnswer(query: string, record: ScreeningRecord | null): string {
  const q = query.toLowerCase()
  const age = record?.ageMonths ?? 18
  const kel = record?.kelurahan ?? 'Kota Bontang'
  const zScore = record?.zScore ?? -1.5
  const isStunted = zScore < -2.0
  const gender = record?.gender === 'L' ? 'laki-laki' : 'perempuan'

  if (q.includes('bawis') || q.includes('resep') || q.includes('menu') || q.includes('makan') || q.includes('mpasi')) {
    return `Halo! Untuk balita ${gender} usia **${age} bulan** di **Kelurahan ${kel}**, berikut adalah panduan variasi menu gizi pangan lokal yang sangat dianjurkan:\n\n` +
      `**1. Sup Bening Ikan Bawis Daun Kelor (Menu Unggulan Bontang)**\n` +
      `• **Porsi:** 1-2 potong ikan bawis segar (buang duri) + 2 sdm daun kelor muda.\n` +
      `• **Keunggulan:** Ikan bawis kaya akan seng (*Zinc*) dan kalsium yang membantu mineralisasi tulang balita, sedangkan daun kelor memasok mikronutrien vitamin A & C.\n` +
      `• **Tips Olah:** Tambahkan 1 sdt minyak kelapa/lemak sehat pada kuah sup untuk meningkatkan densitas kalori.\n\n` +
      `**2. Pepes Ikan Bandeng Tanpa Duri & Tahu Kukus**\n` +
      `• Sumber asam lemak Omega-3 dan DHA tinggi untuk perkembangan kognitif otak balita.\n\n` +
      `**3. Telur Ayam Rebus Harian:**\n` +
      `• Pastikan balita mendapatkan minimal 1 butir telur utuh setiap hari secara konsisten.`
  }

  if (q.includes('posyandu') || q.includes('jadwal') || q.includes('kader') || q.includes('timbang')) {
    return `Untuk pemantauan tumbuh kembang balita di wilayah **Kelurahan ${kel}**:\n\n` +
      `• **Jadwal Posyandu:** Rutin dilaksanakan setiap bulan pada minggu ke-1 hingga ke-2 di Posyandu Balita kelurahan setempat.\n` +
      `• **Layanan yang Diterima:**\n` +
      `  1. Penimbangan Berat Badan (Dacin/Timbangan Digital terkalibrasi).\n` +
      `  2. Pengukuran Panjang/Tinggi Badan (*Infantometer* / *Stadiometer*).\n` +
      `  3. Pemberian Vitamin A (bulan Februari & Agustus) dan imunisasi dasar lanjutan.\n` +
      `  4. Konsultasi PMT (Pemberian Makanan Tambahan) pemulihan jika Z-Score TB/U di bawah -2 SD.\n\n` +
      `Bawalah buku KIA (*Kesehatan Ibu dan Anak*) setiap kunjungan untuk pencatatan grafik KMS.`
  }

  if (q.includes('z-score') || q.includes('stunting') || q.includes('tumbuh') || q.includes('kejar') || q.includes('tinggi')) {
    return `Berdasarkan hasil skrining antropometri balita Anda:\n\n` +
      `• **Usia Antropometri:** ${age} Bulan\n` +
      `• **Z-Score TB/U:** **${zScore} SD** (${record?.statusGiziTBU || (isStunted ? 'Pendek (Stunted)' : 'Normal')})\n` +
      `• **Derajat Kerentanan:** **${record?.riskTier || 'MODERATE'}**\n\n` +
      `**Rekomendasi Percepatan Kejar Tumbuh (*Catch-up Growth*):**\n` +
      `1. **Prioritas Protein Hewani Ganda (*Double Protein*):** Kombinasikan 1 butir telur + 1 porsi ikan laut segar (bawis/tongkol) pada menu harian.\n` +
      `2. **Sanitasi & Air Bersih:** Pastikan air minum dimasak mendidih dan alat makan higienis untuk mencegah infeksi diare berulang yang menghambat penyerapan gizi.\n` +
      `3. **Lingkungan Bebas Asap Rokok:** Lindungi balita dari paparan asap rokok yang dapat mengganggu sirkulasi mikronutrien dalam darah.`
  }

  // General default consultation answer
  return `Terima kasih atas pertanyaannya. Sebagai Asisten Nutrisi SEHATI Kota Bontang, saya siap membantu panduan tumbuh kembang balita Anda (${age} bulan, Kelurahan ${kel}).\n\n` +
    `Kunci utama pencegahan stunting pada rentang usia ini adalah pemenuhan gizi seimbang berbasis **protein hewani laut lokal**, pemantauan rutin antropometri di Posyandu, dan menjaga sanitasi rumah tangga.\n\n` +
    `Apakah Anda ingin menanyakan resep olahan pangan lokal spesifik, takaran porsi harian, atau tips mengatasi anak susah makan (GTM)?`
}

export const chatService = {
  /**
   * Stream chat consultation via progressive token mock simulation
   * (Matches GET /api/v1/chat/stream contract)
   */
  async streamChat(options: ChatStreamOptions): Promise<void> {
    const { sessionId, query, record, onChunk, onDone, onError, signal } = options

    if (!sessionId) {
      onError(new Error('sessionId is required to ground AI consultation context.'))
      return
    }

    try {
      const fullAnswer = generateContextualAnswer(query, record)
      // Break into realistic SSE token chunks (words and punctuation)
      const words = fullAnswer.split(/(?<=\s|(?<=[.,\n]))/)

      let index = 0
      const intervalMs = 28 // Realistic typewriter streaming speed

      const timer = setInterval(() => {
        if (signal?.aborted) {
          clearInterval(timer)
          return
        }

        if (index < words.length) {
          onChunk(words[index])
          index++
        } else {
          clearInterval(timer)
          onDone()
        }
      }, intervalMs)
    } catch (err: any) {
      onError(err instanceof Error ? err : new Error(String(err)))
    }
  },
}

export default chatService
