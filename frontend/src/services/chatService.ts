/**
 * Chat Service — Gemini AI Consultation Streaming Client
 *
 * Implements real-time SSE (Server-Sent Events) streaming for interactive
 * nutrition consultation grounded in child screening metrics & WHO 2006 standards.
 * Connects directly to backend GET /api/v1/chat/stream with graceful offline fallback.
 */
import { ScreeningRecord } from '../types/screening'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

export interface ChatStreamOptions {
  sessionId: string
  query: string
  record: ScreeningRecord | null
  onChunk: (chunk: string) => void
  onDone: () => void
  onError: (error: Error) => void
  signal?: AbortSignal
}

export interface ChatUmumStreamOptions {
  query: string
  onChunk: (chunk: string) => void
  onDone: () => void
  onError: (error: Error) => void
  signal?: AbortSignal
}

/**
 * Generic SSE reader for reading token streams from backend Express Gateway
 */
async function consumeSseStream(
  url: string,
  bodyPayload: any,
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (error: Error) => void,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(bodyPayload),
    signal,
  })

  if (!response.ok) {
    let errorDetail = `Server returned HTTP ${response.status}`
    try {
      const errJson = await response.json()
      if (errJson.error) errorDetail = errJson.error
    } catch {
      // ignore
    }
    throw new Error(errorDetail)
  }

  if (!response.body) {
    throw new Error('ReadableStream not supported by response body.')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  try {
    while (true) {
      if (signal?.aborted) {
        await reader.cancel()
        return
      }

      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      // Keep unfinished line in buffer
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data:')) continue

        const dataStr = trimmed.replace(/^data:\s*/, '')
        if (dataStr === '[DONE]') {
          onDone()
          return
        }

        try {
          const parsed = JSON.parse(dataStr)
          if (parsed.type === 'chunk' && typeof parsed.text === 'string') {
            onChunk(parsed.text)
          } else if (parsed.type === 'done') {
            onDone()
            return
          } else if (parsed.type === 'error') {
            onError(new Error(parsed.message || 'Gagal memproses respons dari Gemini AI.'))
            return
          }
        } catch {
          // If server sent plain text chunk instead of JSON
          if (dataStr) {
            onChunk(dataStr)
          }
        }
      }
    }

    onDone()
  } catch (err: any) {
    if (signal?.aborted || err?.name === 'AbortError') {
      return
    }
    throw err
  }
}

/**
 * Offline simulation fallback for personal mode
 */
function streamFallbackPersonal(options: ChatStreamOptions) {
  const { query, record, onChunk, onDone, onError, signal } = options
  try {
    const fullAnswer = generateContextualAnswer(query, record)
    const words = fullAnswer.split(/(?<=\s|(?<=[.,\n]))/)
    let index = 0
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
    }, 28)
  } catch (err: any) {
    onError(err instanceof Error ? err : new Error(String(err)))
  }
}

/**
 * Offline simulation fallback for mode umum
 */
function streamFallbackUmum(options: ChatUmumStreamOptions) {
  const { query, onChunk, onDone, onError, signal } = options
  try {
    const fullAnswer = generateUmumAnswer(query)
    const words = fullAnswer.split(/(?<=\s|(?<=[.,\n]))/)
    let index = 0
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
    }, 28)
  } catch (err: any) {
    onError(err instanceof Error ? err : new Error(String(err)))
  }
}

export const chatService = {
  /**
   * Stream chat consultation via live Gemini SSE backend (Personal Mode)
   * POST /api/v1/chat/stream with child screening metrics context
   */
  async streamChat(options: ChatStreamOptions): Promise<void> {
    const { sessionId, query, record, onChunk, onDone, onError, signal } = options

    if (!sessionId) {
      onError(new Error('sessionId is required to ground AI consultation context.'))
      return
    }

    const endpointUrl = `${API_BASE_URL}/api/v1/chat/stream`
    const payload = {
      sessionId,
      query,
      mode: 'personal',
      record,
    }

    try {
      await consumeSseStream(endpointUrl, payload, onChunk, onDone, onError, signal)
    } catch (networkError: any) {
      if (signal?.aborted || networkError?.name === 'AbortError') {
        return
      }

      console.info(
        '[SEHATI Chat] Live backend SSE unavailable, activating local offline knowledge generator:',
        networkError?.message || networkError
      )
      // Resilient fallback to local contextual generator
      streamFallbackPersonal(options)
    }
  },

  /**
   * Stream chat consultation for Mode Umum (general nutrition education)
   * POST /api/v1/chat/stream
   */
  async streamChatUmum(options: ChatUmumStreamOptions): Promise<void> {
    const { query, onChunk, onDone, onError, signal } = options

    const endpointUrl = `${API_BASE_URL}/api/v1/chat/stream`
    const payload = {
      query,
      mode: 'umum',
    }

    try {
      await consumeSseStream(endpointUrl, payload, onChunk, onDone, onError, signal)
    } catch (networkError: any) {
      if (signal?.aborted || networkError?.name === 'AbortError') {
        return
      }

      console.info(
        '[SEHATI Chat] Live backend SSE unavailable for Mode Umum, activating local offline knowledge generator:',
        networkError?.message || networkError
      )
      // Resilient fallback to local educational knowledge
      streamFallbackUmum(options)
    }
  },
}

/**
 * Local offline contextual mock answers grounded in child's screening metrics & Bontang local foods
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

/**
 * Local offline answers for Mode Umum
 */
function generateUmumAnswer(query: string): string {
  const q = query.toLowerCase()

  if (q.includes('stunting') || q.includes('apa itu')) {
    return `**Apa Itu Stunting?**\n\n` +
      `Stunting adalah kondisi **gagal tumbuh** pada anak balita akibat kekurangan gizi kronis, terutama dalam 1.000 Hari Pertama Kehidupan (HPK). Menurut standar WHO, anak dikategorikan stunting jika **tinggi badan menurut usia (TB/U) berada di bawah -2 Standar Deviasi (SD)** dari median referensi pertumbuhan.\n\n` +
      `**Fakta Penting:**\n` +
      `• Prevalensi stunting di Indonesia: **21,6%** (SSGI 2022), turun dari 24,4% di 2021.\n` +
      `• Stunting bukan sekadar "anak pendek" — dampaknya meliputi gangguan perkembangan kognitif, daya tahan tubuh lemah, dan risiko penyakit degeneratif di usia dewasa.\n` +
      `• Penyebab utama: asupan gizi tidak adekuat, infeksi berulang (diare, ISPA), sanitasi buruk, dan kurangnya akses pangan bergizi.\n\n` +
      `💡 **Tip:** Lakukan skrining antropometri melalui SEHATI untuk mengetahui status gizi spesifik anak Anda dan mendapatkan rekomendasi nutrisi yang dipersonalisasi.`
  }

  if (q.includes('tanda') || q.includes('gejala') || q.includes('ciri') || q.includes('kenali')) {
    return `**Tanda-Tanda Awal Stunting yang Perlu Diwaspadai:**\n\n` +
      `1. **Pertumbuhan tinggi/panjang badan melambat** — anak terlihat lebih pendek dibanding teman sebaya.\n` +
      `2. **Berat badan sulit naik** meski asupan makan terlihat cukup.\n` +
      `3. **Mudah sakit** — sering mengalami infeksi berulang (batuk, pilek, diare).\n` +
      `4. **Perkembangan motorik terlambat** — terlambat duduk, merangkak, atau berjalan.\n` +
      `5. **Nafsu makan rendah** dan cenderung pemilih makanan (*picky eater*).\n\n` +
      `⚠️ **Penting:** Stunting sering tidak disadari karena dianggap "keturunan" atau "wajar". Pemantauan rutin di Posyandu dengan pengukuran TB/BB setiap bulan adalah cara paling efektif untuk deteksi dini.\n\n` +
      `💡 Gunakan fitur skrining SEHATI untuk menghitung Z-Score TB/U anak Anda secara otomatis.`
  }

  if (q.includes('cek') || q.includes('status gizi') || q.includes('ukur') || q.includes('z-score') || q.includes('cara')) {
    return `**Cara Mengecek Status Gizi Anak:**\n\n` +
      `**1. Ukur Tinggi/Panjang Badan:**\n` +
      `• Usia 0–24 bulan: ukur **panjang badan** (terlentang) menggunakan *infantometer*.\n` +
      `• Usia >24 bulan: ukur **tinggi badan** (berdiri) menggunakan *stadiometer* atau mikrotoa.\n\n` +
      `**2. Timbang Berat Badan:**\n` +
      `• Gunakan timbangan digital terkalibrasi, anak mengenakan pakaian minimal.\n\n` +
      `**3. Interpretasi Z-Score:**\n` +
      `• **> -2 SD**: Normal\n` +
      `• **-2 SD s/d -3 SD**: Pendek (*Stunted*) — perlu intervensi gizi\n` +
      `• **< -3 SD**: Sangat Pendek (*Severely Stunted*) — perlu rujukan segera\n\n` +
      `💡 **Cara Termudah:** Gunakan fitur skrining SEHATI — cukup masukkan usia, jenis kelamin, dan hasil pengukuran TB/BB, sistem akan menghitung Z-Score otomatis berdasarkan standar WHO 2006.`
  }

  if (q.includes('mpasi') || q.includes('makanan') || q.includes('resep') || q.includes('menu') || q.includes('makan')) {
    return `**Panduan Umum MPASI untuk Pencegahan Stunting:**\n\n` +
      `**Usia 6–8 Bulan (Perkenalan MPASI):**\n` +
      `• Tekstur: Bubur halus/puree → bertahap ke bubur kasar.\n` +
      `• Frekuensi: 2–3 kali makan utama + 1–2 kali selingan.\n` +
      `• Prioritas: Sumber **protein hewani** (telur, ikan, hati ayam) di setiap kali makan.\n\n` +
      `**Usia 9–12 Bulan:**\n` +
      `• Tekstur: Nasi tim, cincang halus, *finger food*.\n` +
      `• Frekuensi: 3–4 kali makan utama + 1–2 kali selingan.\n\n` +
      `**Usia 12–24 Bulan:**\n` +
      `• Sudah bisa makan menu keluarga dengan porsi lebih kecil dan tekstur disesuaikan.\n` +
      `• Pastikan **1 butir telur utuh setiap hari** — terbukti menurunkan risiko stunting hingga 47% (penelitian Ecuador, Lannotti et al. 2017).\n\n` +
      `🐟 **Tip Pangan Lokal Kalimantan Timur:** Ikan bawis, bandeng, dan udang rebon merupakan sumber protein hewani lokal yang terjangkau dan kaya Omega-3.`
  }

  if (q.includes('posyandu') || q.includes('jadwal') || q.includes('kader') || q.includes('puskesmas')) {
    return `**Peran Posyandu dalam Pencegahan Stunting:**\n\n` +
      `Posyandu adalah garda terdepan pemantauan tumbuh kembang balita di Indonesia. Layanan yang tersedia:\n\n` +
      `1. **Penimbangan & Pengukuran Rutin** — Berat badan dan tinggi/panjang badan diukur setiap bulan untuk memantau tren pertumbuhan.\n` +
      `2. **Pemberian Vitamin A** — Diberikan setiap Februari dan Agustus untuk anak usia 6–59 bulan.\n` +
      `3. **Imunisasi Dasar & Lanjutan** — Sesuai jadwal dari Kemenkes.\n` +
      `4. **PMT (Pemberian Makanan Tambahan)** — Untuk balita dengan status gizi kurang.\n` +
      `5. **Konseling Gizi** — Edukasi oleh kader terlatih tentang pola makan seimbang.\n\n` +
      `📅 **Tips:** Kunjungi Posyandu secara rutin setiap bulan dan bawa **Buku KIA** (Kesehatan Ibu dan Anak) untuk pencatatan grafik pertumbuhan anak.\n\n` +
      `💡 Lakukan skrining digital melalui SEHATI sebagai pelengkap pemantauan Posyandu Anda.`
  }

  // Default general answer
  return `Terima kasih atas pertanyaannya! Saya **HATI** — Asisten Gizi AI dari SEHATI.\n\n` +
    `Saya dapat membantu Anda dengan informasi seputar:\n` +
    `• **Apa itu stunting** dan cara pencegahannya\n` +
    `• **Tanda-tanda awal** yang perlu diwaspadai orang tua\n` +
    `• **Cara mengecek status gizi** anak (interpretasi Z-Score)\n` +
    `• **Panduan MPASI** dan nutrisi harian berbasis pangan lokal\n` +
    `• **Peran Posyandu** dalam pemantauan tumbuh kembang\n\n` +
    `Silakan tanyakan topik spesifik di atas, atau **lakukan skrining melalui SEHATI** untuk mendapatkan rekomendasi nutrisi yang dipersonalisasi berdasarkan data antropometri anak Anda.\n\n` +
    `_Catatan: Saat ini Anda menggunakan Mode Edukasi Umum. Untuk konsultasi berbasis data anak spesifik, selesaikan skrining terlebih dahulu._`
}

export default chatService
