/**
 * Seed `HealthKnowledgeBase` dari tinjauan 26 studi literatur faktor risiko
 * stunting (`data/sources/resume-faktor-risiko-stunting.xlsx`) — lihat FDD §10.3.
 * Konten panduan ditulis merangkum praktik kesehatan masyarakat yang mapan
 * (WHO/Kemenkes), `sourceReference` mengutip studi riil dari tinjauan literatur.
 *
 * Jalankan: npx tsx scripts/seedHealthKnowledgeBase.ts
 */
import "dotenv/config";
if (process.env.DIRECT_URL) process.env.DATABASE_URL = process.env.DIRECT_URL;

import { prisma } from "../src/utils/prisma";

const entries = [
  {
    topicTitle: "Pemberian ASI Eksklusif 6 Bulan Pertama",
    category: "NUTRISI_ASI",
    targetAgeGroupMinMonths: 0,
    targetAgeGroupMaxMonths: 12,
    targetRiskTier: "ALL",
    tags: ["asi eksklusif", "menyusui", "0-6 bulan"],
    guidelineContent:
      "ASI eksklusif tanpa makanan/minuman tambahan selama 6 bulan pertama memberikan seluruh kebutuhan gizi bayi dan antibodi pelindung dari infeksi. Bayi yang tidak mendapat ASI eksklusif berisiko lebih tinggi mengalami episode infeksi berulang yang mengganggu penyerapan gizi dan pertumbuhan linier.",
    actionableSteps: [
      "Susui bayi sesuai permintaan, minimal 8-12 kali per hari pada bulan-bulan awal.",
      "Hindari pemberian air putih, madu, atau makanan padat sebelum usia 6 bulan.",
      "Jika produksi ASI dirasa kurang, konsultasikan ke kader Posyandu/bidan sebelum beralih ke susu formula.",
    ],
    sourceReference: "Abdulla, Faruq et al. (2023) — faktor risiko stunting anak <5 tahun di Bangladesh",
  },
  {
    topicTitle: "Praktik Pemberian MPASI yang Tepat Waktu",
    category: "NUTRISI_MPASI",
    targetAgeGroupMinMonths: 6,
    targetAgeGroupMaxMonths: 24,
    targetRiskTier: "ALL",
    tags: ["mpasi", "tekstur", "6-24 bulan"],
    guidelineContent:
      "MPASI yang diberikan terlalu dini (<6 bulan) meningkatkan risiko infeksi saluran cerna, sementara yang terlalu terlambat (>6 bulan) menyebabkan defisit energi dan mikronutrien pada periode pertumbuhan tercepat anak. Tekstur MPASI juga harus disesuaikan bertahap dengan usia agar asupan energi tercukupi.",
    actionableSteps: [
      "Mulai MPASI tepat di usia 6 bulan dengan tekstur bubur halus, naik bertahap ke tekstur kasar/cincang di usia 9-12 bulan.",
      "Sertakan sumber protein hewani (telur, ikan, daging, hati ayam) di setiap kali makan utama, bukan hanya karbohidrat.",
      "Berikan 3x makan utama + 1-2x selingan pada usia 9-24 bulan.",
    ],
    sourceReference: "Marume, Anesu et al. (2022) — pola makan anak & stunting di Zimbabwe",
  },
  {
    topicTitle: "Keragaman Protein Hewani Harian",
    category: "NUTRISI_PROTEIN",
    targetAgeGroupMinMonths: 6,
    targetAgeGroupMaxMonths: 59,
    targetRiskTier: "MODERATE",
    tags: ["protein hewani", "telur", "ikan", "asupan gizi"],
    guidelineContent:
      "Asupan protein hewani yang terbatas pada satu jenis atau sangat jarang dikonsumsi berkaitan dengan defisiensi asam amino esensial dan zat besi/zinc yang dibutuhkan untuk pertumbuhan tulang panjang dan perkembangan kognitif anak.",
    actionableSteps: [
      "Targetkan minimal 2 jenis sumber protein hewani berbeda per minggu (ikan, telur, daging, susu).",
      "Berikan 1 butir telur utuh setiap hari secara konsisten — terbukti menurunkan risiko stunting pada studi di Ekuador.",
      "Manfaatkan sumber protein laut lokal (ikan segar) yang relatif terjangkau di wilayah pesisir.",
    ],
    sourceReference: "Ressa Andriyanu Utami et al. (2019) — pola asuh gizi & stunting balita di Jakarta Selatan",
  },
  {
    topicTitle: "Akses Sanitasi & Jamban Sehat",
    category: "SANITASI_LINGKUNGAN",
    targetAgeGroupMinMonths: 0,
    targetAgeGroupMaxMonths: 59,
    targetRiskTier: "HIGH",
    tags: ["jamban sehat", "sanitasi", "enteropati lingkungan"],
    guidelineContent:
      "Sanitasi buruk (buang air besar sembarangan, jamban tanpa septic tank) menyebabkan kontaminasi lingkungan rumah tangga oleh patogen yang memicu enteropati lingkungan — peradangan usus kronis subklinis yang menghambat penyerapan nutrisi walau asupan makanan sudah cukup.",
    actionableSteps: [
      "Gunakan jamban leher angsa dengan tangki septik tertutup, berjarak minimal 10 meter dari sumber air.",
      "Cuci tangan pakai sabun sebelum menyiapkan/memberi makan anak dan setelah dari toilet.",
      "Jaga area bermain balita bebas dari kontaminasi tinja (manusia maupun hewan ternak).",
    ],
    sourceReference: "Uwiringiyimana, V. et al. (2022) — pola spasial stunting & faktor sosioekonomi di Rwanda",
  },
  {
    topicTitle: "Akses Air Minum Layak & Terlindungi",
    category: "SANITASI_LINGKUNGAN",
    targetAgeGroupMinMonths: 0,
    targetAgeGroupMaxMonths: 59,
    targetRiskTier: "HIGH",
    tags: ["air bersih", "air minum", "diare"],
    guidelineContent:
      "Sumber air minum yang tidak terlindungi (sumur gali terbuka, air permukaan) meningkatkan risiko kontaminasi mikrobiologis yang memicu diare berulang — salah satu jalur utama menuju stunting akibat hilangnya cairan dan nutrisi berulang kali.",
    actionableSteps: [
      "Prioritaskan sumber air terlindungi: PDAM, sumur bor tertutup, atau air kemasan/isi ulang bersertifikat.",
      "Masak air hingga mendidih sempurna sebelum dikonsumsi bila sumber air belum terjamin higienitasnya.",
      "Simpan air minum di wadah tertutup untuk mencegah kontaminasi ulang.",
    ],
    sourceReference: "Emily A. Kragel et al. (2020) — faktor risiko pertumbuhan terhambat di Guatemala",
  },
  {
    topicTitle: "Rumah Bebas Asap Rokok untuk Balita",
    category: "KESEHATAN_LINGKUNGAN",
    targetAgeGroupMinMonths: 0,
    targetAgeGroupMaxMonths: 59,
    targetRiskTier: "MODERATE",
    tags: ["asap rokok", "thirdhand smoke", "ispa"],
    guidelineContent:
      "Paparan asap rokok — termasuk residu yang menempel di pakaian/perabot (third-hand smoke) — berkaitan dengan gangguan penyerapan vitamin A dan C serta peningkatan risiko infeksi saluran pernapasan akut (ISPA) berulang pada balita.",
    actionableSteps: [
      "Terapkan aturan 100% bebas rokok di dalam rumah, termasuk saat tidak ada balita di ruangan.",
      "Anggota keluarga yang merokok sebaiknya mandi dan berganti pakaian sebelum menggendong/berinteraksi dekat dengan balita.",
      "Jangan merokok di kendaraan yang ditumpangi balita, walau jendela terbuka.",
    ],
    sourceReference: "Dyah Dwi Astuti et al. (2020) — paparan asap rokok & stunting anak usia 25-59 bulan",
  },
  {
    topicTitle: "Riwayat Berat Badan Lahir Rendah (BBLR)",
    category: "RIWAYAT_KELAHIRAN",
    targetAgeGroupMinMonths: 0,
    targetAgeGroupMaxMonths: 24,
    targetRiskTier: "HIGH",
    tags: ["bblr", "berat lahir", "kejar tumbuh"],
    guidelineContent:
      "Bayi dengan berat badan lahir rendah (<2.500 gram) memiliki cadangan nutrisi dan sistem imun yang lebih rentan sejak lahir, sehingga butuh pemantauan pertumbuhan lebih ketat dan intervensi gizi lebih dini untuk mengejar ketertinggalan (catch-up growth).",
    actionableSteps: [
      "Lakukan penimbangan & pengukuran panjang badan lebih sering (setiap 2 minggu) pada 6 bulan pertama bila riwayat BBLR.",
      "Prioritaskan ASI eksklusif penuh — bayi BBLR sangat diuntungkan dari kandungan antibodi dan kepadatan energi ASI.",
      "Rujuk ke tenaga kesehatan bila kenaikan berat badan tidak sesuai kurva KMS selama 2 bulan berturut-turut.",
    ],
    sourceReference: "Abdulazeez Imam et al. (2021) — stunting pada program pengobatan malnutrisi akut di Nigeria",
  },
  {
    topicTitle: "Pendidikan Ibu & Literasi Gizi Keluarga",
    category: "SOSIAL_EKONOMI",
    targetAgeGroupMinMonths: 0,
    targetAgeGroupMaxMonths: 59,
    targetRiskTier: "MODERATE",
    tags: ["pendidikan ibu", "literasi gizi", "baduta"],
    guidelineContent:
      "Tingkat pendidikan ibu berkorelasi dengan pemahaman gizi, kebersihan, dan pemanfaatan layanan kesehatan — ibu dengan pendidikan dasar cenderung memiliki akses informasi kesehatan anak yang lebih terbatas dibanding ibu dengan pendidikan menengah/tinggi.",
    actionableSteps: [
      "Ikuti kelas edukasi gizi di Posyandu/Puskesmas terdekat, tersedia gratis untuk semua tingkat pendidikan.",
      "Manfaatkan Buku KIA sebagai panduan tahapan tumbuh kembang dan jadwal imunisasi yang mudah diikuti.",
      "Bergabung dengan kelompok pendukung ibu (PKK/kelas ibu balita) untuk berbagi informasi praktik pengasuhan baik.",
    ],
    sourceReference: "Agung Dwi Laksono et al. (2022) — pendidikan ibu & stunting anak baduta di Indonesia",
  },
  {
    topicTitle: "Dampak Kuintil Ekonomi Rendah pada Akses Gizi",
    category: "SOSIAL_EKONOMI",
    targetAgeGroupMinMonths: 0,
    targetAgeGroupMaxMonths: 59,
    targetRiskTier: "HIGH",
    tags: ["ekonomi", "kuintil", "akses pangan"],
    guidelineContent:
      "Keluarga pada kuintil ekonomi terendah lebih rentan mengalami keterbatasan akses pangan bergizi tinggi (protein hewani, buah-sayur) secara konsisten — faktor sosial-ekonomi tercatat sebagai salah satu determinan yang paling sering diteliti dalam literatur stunting global.",
    actionableSteps: [
      "Manfaatkan program bantuan pangan/PMT pemulihan yang tersedia di Posyandu/Puskesmas setempat.",
      "Prioritaskan sumber protein terjangkau (telur, ikan lokal, tempe/tahu) dibanding daging olahan yang lebih mahal.",
      "Konsultasikan ke kader Posyandu mengenai program bantuan sosial (PKH/BPNT) yang relevan bagi keluarga balita.",
    ],
    sourceReference: "Renuka Devi Logarajan et al. (2023) — faktor sosial & stunting anak etnis Melayu di Malaysia",
  },
  {
    topicTitle: "Kunjungan Rutin Posyandu & Pemanfaatan Buku KIA",
    category: "AKSES_LAYANAN_KESEHATAN",
    targetAgeGroupMinMonths: 0,
    targetAgeGroupMaxMonths: 59,
    targetRiskTier: "ALL",
    tags: ["posyandu", "kia", "pemantauan rutin"],
    guidelineContent:
      "Kunjungan Posyandu yang tidak rutin menyebabkan keterlambatan deteksi dini masalah pertumbuhan — banyak kasus stunting baru diketahui setelah kondisi memburuk karena tidak ada pemantauan berkala terhadap kurva berat/tinggi badan anak.",
    actionableSteps: [
      "Datang ke Posyandu setiap bulan untuk penimbangan, pengukuran panjang/tinggi badan, dan imunisasi sesuai jadwal.",
      "Simpan dan bawa Buku KIA di setiap kunjungan agar grafik pertumbuhan tercatat berkelanjutan.",
      "Tanyakan hasil plot kurva WHO ke kader/bidan setiap kunjungan, jangan hanya menerima angka berat/tinggi tanpa interpretasi.",
    ],
    sourceReference: "Joy Kinko Luzingu et al. (2022) — stunting, wasting, underweight & akses layanan kesehatan di DRC",
  },
  {
    topicTitle: "Pencegahan Diare Berulang pada Balita",
    category: "RIWAYAT_KESEHATAN",
    targetAgeGroupMinMonths: 0,
    targetAgeGroupMaxMonths: 59,
    targetRiskTier: "HIGH",
    tags: ["diare", "infeksi berulang", "rehidrasi"],
    guidelineContent:
      "Episode diare berulang (≥2 kali dalam periode singkat) menguras cairan dan mikronutrien penting (zinc, zat besi) yang berdampak langsung pada perlambatan pertambahan berat dan tinggi badan — siklus infeksi-malnutrisi yang saling memperberat.",
    actionableSteps: [
      "Berikan oralit dan suplemen zinc segera saat anak diare, lanjutkan pemberian makan (bukan dipuasakan).",
      "Pastikan kebersihan alat makan/minum anak dan cuci tangan pakai sabun sebelum menyuapi.",
      "Segera bawa ke fasilitas kesehatan bila diare disertai demam tinggi, darah pada tinja, atau tanda dehidrasi berat.",
    ],
    sourceReference: "Berhanu Kibemo Lefebo et al. (2023) — inflamasi usus & faktor terkait stunting balita",
  },
];

async function main() {
  console.log(`Menyiapkan ${entries.length} entri HealthKnowledgeBase...`);

  let created = 0;
  for (const entry of entries) {
    const existing = await prisma.healthKnowledgeBase.findFirst({
      where: { topicTitle: entry.topicTitle },
    });
    if (existing) {
      console.log(`Lewati (sudah ada): ${entry.topicTitle}`);
      continue;
    }
    await prisma.healthKnowledgeBase.create({ data: entry });
    created++;
    console.log(`Dibuat: ${entry.topicTitle}`);
  }

  console.log(`\nSelesai. ${created} entri baru dibuat (dari ${entries.length} total didefinisikan).`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Seeding HealthKnowledgeBase gagal:", err);
  process.exit(1);
});
