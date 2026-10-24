import "dotenv/config";
import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { logger } from "../utils/logger";
import { redis, isRedisReady } from "../config/redis";
import { geminiService } from "../services/gemini.service";
import { chatMessages } from "../constants/messages";

const KB_CACHE_TTL_SECONDS = 60 * 60; // 1 jam — konten edukasi jarang berubah (lihat FDD §7)

async function findGuidelines(riskTier: string, ageMonths: number): Promise<any[]> {
  const cacheKey = `kb:${riskTier}:${ageMonths}`;

  try {
    if (isRedisReady()) {
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    }
  } catch (err) {
    logger.warn("Redis tidak terjangkau saat baca cache HealthKnowledgeBase:", (err as Error).message);
  }

  try {
    const guidelines = await prisma.healthKnowledgeBase.findMany({
      where: {
        targetAgeGroupMinMonths: { lte: ageMonths },
        targetAgeGroupMaxMonths: { gte: ageMonths },
        OR: [{ targetRiskTier: riskTier }, { targetRiskTier: "ALL" }],
      },
      take: 5,
    });

    if (isRedisReady()) {
      redis
        .set(cacheKey, JSON.stringify(guidelines), "EX", KB_CACHE_TTL_SECONDS)
        .catch((err) => logger.warn("Gagal menulis cache HealthKnowledgeBase:", err.message));
    }

    return guidelines;
  } catch (dbErr: any) {
    logger.warn("HealthKnowledgeBase query unavailable:", dbErr.message);
    return [];
  }
}

/**
 * Helper to build rich System Instruction for Gemini based on screening & knowledge base
 */
function buildSystemInstruction(screening: any | null, guidelines: any[] = []): string {
  const baseIdentity = `Anda adalah "HATI" (Asisten Kesehatan & Gizi Cerdas SEHATI — Sistem Edukasi & Analisis Holistik Anak Terintegrasi Indonesia), berfokus pada pencegahan dan penanganan stunting serta optimalisasi tumbuh kembang balita di Kota Bontang, Kalimantan Timur.

Karakter & Gaya Komunikasi:
- Berbahasa Indonesia yang hangat, empatik, jelas, solutif, dan berbasis bukti medis (WHO Child Growth Standards 2006 & Kemenkes RI).
- Gunakan format markdown rapi (bullet points, bolding kata kunci penting, paragraf terstruktur).
- Hindari istilah medis yang terlalu rumit tanpa penjelasan sederhana.
- Selalu berikan rekomendasi pangan lokal bergizi tinggi khas pesisir Kota Bontang (seperti Ikan Bawis, Ikan Bandeng, Telur Ayam harian, Daun Kelor, Tempe/Tahu).
- PENTING: Anda adalah asisten edukasi dan skrining awal, bukan pengganti diagnosis medis dokter spesialis anak atau tenaga kesehatan di Puskesmas/Posyandu. Untuk kondisi gawat darurat atau infeksi berat, anjurkan segera ke fasilitas kesehatan.`;

  if (!screening) {
    // Mode Edukasi Umum (General Nutrition Education)
    return `${baseIdentity}

Konteks Pengguna: Mode Edukasi Umum (Belum melakukan skrining individual balita).
Tujuan:
1. Menjawab pertanyaan seputar pencegahan stunting, 1000 Hari Pertama Kehidupan (HPK), standar Z-Score WHO, dan tahapan MPASI.
2. Memberikan edukasi tentang pentingnya konsumsi protein hewani ganda (*double protein*) setiap hari (misal 1 butir telur + 1 porsi ikan bawis/laut).
3. Mendorong orang tua untuk melakukan pemantauan rutin di Posyandu dan melakukan skrining mandiri di aplikasi SEHATI.`;
  }

  // Personal Consultation Grounding
  const genderStr = screening.gender === "L" || screening.gender === "Laki-Laki" ? "Laki-laki" : "Perempuan";
  const ageMonths = screening.ageMonths ?? "Tidak diketahui";
  const zScore = screening.zScore != null ? Number(screening.zScore).toFixed(2) : "Belum dihitung";
  const statusGiziTBU = screening.statusGiziTBU || (screening.zScore < -2.0 ? "Pendek (Stunted)" : "Normal");
  const zScoreWAZ = screening.zScoreWAZ != null ? Number(screening.zScoreWAZ).toFixed(2) : "N/A";
  const zScoreWHZ = screening.zScoreWHZ != null ? Number(screening.zScoreWHZ).toFixed(2) : "N/A";
  const riskTier = screening.riskTier || "MODERATE";
  const riskScore = screening.riskScore != null ? (Number(screening.riskScore) * 100).toFixed(1) + "%" : "N/A";
  const kelurahan = screening.kelurahan || "Kota Bontang";
  const dominantFactors = Array.isArray(screening.dominantFactors) && screening.dominantFactors.length > 0
    ? screening.dominantFactors.join(", ")
    : "Tidak ada faktor dominan anomali";

  let guidelineContext = "";
  if (guidelines.length > 0) {
    guidelineContext = `\nPanduan Klinis & Intervensi Terkait:\n` +
      guidelines
        .map((g, i) => `${i + 1}. **${g.topicTitle}**: ${g.guidelineContent}${g.actionableSteps ? " (Langkah: " + g.actionableSteps.join("; ") + ")" : ""}`)
        .join("\n");
  }

  return `${baseIdentity}

DATA REKAM MEDIS & HASIL SKRINING BALITA:
- Nama Wilayah: Kelurahan ${kelurahan}, Kota Bontang
- Usia Balita: ${ageMonths} Bulan
- Jenis Kelamin: ${genderStr}
- Berat Badan: ${screening.weightKg ?? "-"} kg | Tinggi/Panjang Badan: ${screening.heightCm ?? "-"} cm
- Z-Score TB/U (Tinggi menurut Usia): ${zScore} SD (${statusGiziTBU})
- Z-Score BB/U (Berat menurut Usia): ${zScoreWAZ} SD (${screening.statusGiziBBU ?? "Normal"})
- Z-Score BB/TB (Berat menurut Tinggi): ${zScoreWHZ} SD (${screening.statusGiziBBTB ?? "Normal"})
- Kategori Risiko Stunting: ${riskTier} (Skor Kerentanan: ${riskScore})
- Determinan Risiko Dominan: ${dominantFactors}
- Pola Asuh & Sanitasi:
  * Riwayat ASI: ${screening.exclusiveAsi === 1 ? "ASI Eksklusif" : "Tidak Eksklusif / Formula"}
  * MPASI: ${screening.mpasiAge === 2 ? "Tepat 6 Bulan" : screening.mpasiAge === 1 ? "Dini (<6 bln)" : ">6 bln / Belum"}
  * Akses Sanitasi & Air Bersih: ${screening.sanitationAccess === 1 ? "Layak/Jamban Sehat" : "Kurang Memadai"}, ${screening.cleanWaterAccess === 1 || screening.cleanWaterAccess === 2 ? "Air Bersih Terlindungi" : "Perlu Peningkatan"}
  * Paparan Asap Rokok: ${screening.smokeExposure === 2 ? "Terpapar Asap Rokok di Rumah (Faktor Risiko)" : "Bebas Asap Rokok"}
  * Riwayat Diare Berulang: ${screening.diarrheaHistory === 2 ? "Ada Riwayat Diare Berulang (Perlu Perhatian Khusus)" : "Jarang/Tidak Pernah"}
  * Kunjungan Posyandu: ${screening.posyanduKia === 1 ? "Rutin Aktif + Buku KIA" : "Tidak Rutin/Jarang"}
${guidelineContext}

INSTRUKSI KHUSUS KONSULTASI:
1. Hubungkan penjelasan Anda langsung dengan data antropometri dan determinan spesifik balita di atas.
2. Jika Z-Score TB/U < -2.0 SD (Stunted) atau Kategori Risiko HIGH/MODERATE:
   - Berikan panduan kejar tumbuh (*catch-up growth*) yang realistis.
   - Tekankan asupan *double protein hewani* harian (utamakan Ikan Bawis khas Bontang & Telur Ayam).
   - Ingatkan pentingnya menjaga kebersihan alat makan dan sanitasi untuk mencegah infeksi diare berulang.
3. Selalu berikan motivasi positif bagi orang tua tanpa membuat mereka merasa disalahkan.`;
}

export const chatController = {
  /**
   * SSE Streaming Chat Endpoint
   * Handles GET /api/v1/chat/stream?sessionId=...&query=...&mode=...
   * and POST /api/v1/chat/stream
   */
  async stream(req: Request, res: Response) {
    const rawQuery = req.query.query || req.body?.query;
    const rawSessionId = req.query.sessionId || req.body?.sessionId;
    const rawMode = req.query.mode || req.body?.mode;
    const history = req.body?.history || [];

    const query = typeof rawQuery === "string" ? rawQuery.trim() : "";
    const sessionId = typeof rawSessionId === "string" ? rawSessionId.trim() : "";
    const mode = typeof rawMode === "string" ? rawMode.trim() : (sessionId ? "personal" : "umum");

    if (!query) {
      return res.status(400).json({
        success: false,
        error: chatMessages.queryRequired || "Pertanyaan (query) wajib diisi.",
      });
    }

    // Set Server-Sent Events headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    if (typeof (res as any).flushHeaders === "function") {
      (res as any).flushHeaders();
    }

    let isClientDisconnected = false;
    res.on("close", () => {
      if (!res.writableEnded) {
        isClientDisconnected = true;
      }
    });

    try {
      let screeningRecord: any = req.body?.record || null;
      let guidelines: any[] = [];

      // If record was passed as query param JSON string
      if (!screeningRecord && typeof req.query.record === "string") {
        try {
          screeningRecord = JSON.parse(req.query.record);
        } catch {
          // ignore
        }
      }

      // If in personal mode and no record passed yet, fetch screening context from database
      if (!screeningRecord && mode !== "umum" && sessionId) {
        try {
          // Baca dari view screening_record_flat (bukan tabel ScreeningRecord
          // mentah) — sejak normalisasi skema, Z-Score/determinan/risiko ada
          // di tabel anak terpisah; view merekonstruksinya jadi satu baris.
          const screenings: any[] = await prisma.$queryRaw`
            SELECT * FROM "screening_record_flat"
            WHERE "sessionId" = ${sessionId}
            ORDER BY "createdAt" DESC
            LIMIT 1
          `;

          screeningRecord = screenings[0] || null;
        } catch (dbError) {
          logger.warn("Could not fetch DB screening records for chat context:", dbError);
        }
      }

      if (screeningRecord) {
        const riskTier = screeningRecord.riskTier || "MODERATE";
        const ageMonths = Number(screeningRecord.ageMonths) || 0;

        try {
          guidelines = await findGuidelines(riskTier, ageMonths);
        } catch {
          // If knowledge base DB is not seeded or offline, continue with core rules
        }
      }

      // Build personalized or general system instruction
      const systemInstruction = buildSystemInstruction(screeningRecord, guidelines);

      // Send initial metadata event
      res.write(
        `data: ${JSON.stringify({
          type: "init",
          mode: screeningRecord ? "personal" : "umum",
          hasScreening: Boolean(screeningRecord),
        })}\n\n`
      );

      // Check if Gemini API key is configured
      if (!geminiService.isConfigured()) {
        logger.warn("GEMINI_API_KEY is not configured in backend environment.");
        res.write(
          `data: ${JSON.stringify({
            type: "chunk",
            text: "Kunci API Gemini (GEMINI_API_KEY) belum dikonfigurasi pada file .env di server backend. Silakan masukkan kunci API Gemini Anda untuk mengaktifkan konsultasi AI langsung.",
          })}\n\n`
        );
        res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
        res.end();
        return;
      }

      logger.info(`Starting Gemini stream for query: "${query.slice(0, 40)}..." [mode: ${screeningRecord ? 'personal' : 'umum'}]`);

      // Stream tokens directly from Gemini API
      const streamGenerator = geminiService.streamChat({
        systemInstruction,
        query,
        history,
      });

      let chunkCount = 0;
      for await (const chunk of streamGenerator) {
        if (isClientDisconnected) {
          logger.info("Client disconnected, breaking stream.");
          break;
        }
        chunkCount++;
        res.write(`data: ${JSON.stringify({ type: "chunk", text: chunk })}\n\n`);
        (res as any).flush?.();
      }

      logger.info(`Gemini stream finished with ${chunkCount} chunks.`);

      if (!isClientDisconnected) {
        res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
        (res as any).flush?.();
        res.end();
      }
    } catch (error: any) {
      logger.error("Chat streaming controller error:", error);

      if (!isClientDisconnected) {
        const errorMessage =
          error?.message?.includes("API_KEY") || error?.status === 400
            ? "Terjadi kendala pada otentikasi Gemini API. Pastikan GEMINI_API_KEY valid."
            : "Maaf, terjadi kendala saat memproses konsultasi AI. Silakan coba kembali.";

        res.write(
          `data: ${JSON.stringify({
            type: "error",
            message: errorMessage,
          })}\n\n`
        );
        res.end();
      }
    }
  },
};