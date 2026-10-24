# FUNCTIONAL DESIGN DOCUMENT (FDD)

## Backend API Gateway & Domain Engine — SEHATI

| Key Meta | Detail Spesifikasi |
| :---- | :---- |
| **Nama Sistem** | SEHATI (Sistem Edukasi Holistik dan Deteksi Stunting Terintegrasi) |
| **Sub-Sistem** | Backend Gateway Layer + Domain Engine (Z-Score & Risiko) |
| **Versi Dokumen** | 2.0.0-BACKEND-REWRITE |
| **Target Stack** | Node.js, Express.js, Prisma ORM, **Supabase PostgreSQL**, **Redis**, Google Gen AI SDK |
| **Status** | Disetujui untuk eksekusi (menggantikan `Backend API Gateway FDD.md` v1.0.0-PROD) |
| **Acuan Utama** | `frontend/src/types/screening.ts`, `frontend/src/lib/api.ts`, `frontend/src/services/chatService.ts` — frontend sudah **fix**, backend menyesuaikan diri ke kontrak ini, bukan sebaliknya. |

---

## 1. Ringkasan Perubahan dari Versi Sebelumnya

Dokumen v1.0.0-PROD menggambarkan arsitektur dengan FastAPI ML Microservice terpisah untuk Z-Score & Naive Bayes. Dalam praktiknya:

- `ml-service/` (FastAPI) ternyata memakai tabel LMS WHO yang **disederhanakan** (hanya 8 titik umur: 6,12,18,24,30,36,48,60 bulan, diinterpolasi linear) — bukan tabel WHO Child Growth Standards resmi bulanan.
- Model "Naive Bayes"-nya memakai tabel prior/likelihood yang **dikarang manual** (bukan hasil pelatihan dari data), dan memakai skema field boolean lama (`exclusiveAsi: bool`, `bblrHistory: bool`) yang sudah tidak sesuai skema Prisma/frontend saat ini (integer-coded).
- `backend/src/controllers/screening.controller.ts` berisi **3 implementasi tumpang tindih** dari endpoint yang sama, salah satunya meng-import file yang tidak ada di repo (`../validators/screening.validator`, `../services/screening.service`) — kemungkinan gagal resolve saat runtime.
- Endpoint `GET /api/v1/screening/share/:shareHash` yang **sudah dipanggil frontend** (`frontend/src/lib/api.ts`) **tidak pernah dibuatkan route/controller-nya** di backend — sehingga setiap kali seseorang membuka link share, frontend selalu jatuh ke mock data.
- `src/routes/index.ts`, `src/middlewares/errorHandler.ts`, `src/middlewares/validateRequest.ts` adalah dead code (tidak pernah di-import `app.ts`).
- Tidak ada Redis sama sekali.
- Database masih memakai Postgres generik, belum terhubung ke Supabase yang disediakan.

**Keputusan revisi (v2.0.0)**:

1. **ML Microservice Python dihapus dari alur produksi.** Backend Node menghitung sendiri Z-Score WHO (LMS asli) dan risiko stunting (Naive Bayes terlatih dari data riil). Folder `ml-service/` dibiarkan ada di repo sebagai arsip/referensi pola kode, tidak dijalankan dan tidak didokumentasikan lebih lanjut di sini.
2. **Scope dashboard dipersempit ke Individual saja** — mengikuti apa yang benar-benar dikonsumsi frontend hari ini (`/analytics`, 5 widget). Modul Komunitas & Makro/Spasial dari PRD v2.0.0-ANALYTICS **tidak diimplementasikan** pada revisi ini (lihat §12 Batasan).
3. **Database pindah ke Supabase PostgreSQL** (kredensial proyek disediakan terpisah, tidak dicatat di dokumen ini).
4. **Redis dipasang untuk 2 kebutuhan konkret**: cache-aside hasil skrining by `shareHash`, dan store terpusat untuk rate-limiter.
5. **Dua dataset riil dijadikan tetapan** — dengan satu revisi penting: file Riskesdas 2018 Kemenkes yang diterima **secara dimensi sheet mengklaim 130.620 baris, tapi setelah diperiksa baris-per-baris hanya ~20 baris yang benar-benar berisi data** (sisanya kosong hingga baris terakhir yang ternyata berisi teks catatan validasi yang nyasar, bukan data). 20 baris riil ini dipakai sebagai data uji/contoh nyata untuk seeding, **bukan** basis pelatihan statistik (20 baris jauh di bawah volume minimum untuk melatih model yang valid). Tinjauan literatur faktor risiko stunting (26 studi) dipakai untuk isi `HealthKnowledgeBase` **dan** untuk mengkalibrasi bobot mesin skor risiko (lihat §6 revisi).

---

## 2. Peran & Tanggung Jawab Arsitektur

Backend API Gateway tetap menjadi orkestrator pusat, dengan tanggung jawab yang diperbarui:

1. Mengelola sesi anonim berbasis `clientToken` (UUID) — tanpa login/password (Zero-Login Friction, tetap sesuai PRD).
2. **Menghitung sendiri** Z-Score WHO (TB/U, BB/U, BB/TB) dan skor risiko stunting (weighted-rule engine terkalibrasi literatur — lihat §6) — tidak lagi memanggil service eksternal.
3. Menyimpan & mengambil `ScreeningRecord` di Supabase via Prisma ORM.
4. Menyediakan endpoint SSE untuk Chatbot AI (Gemini) yang mengambil konteks langsung dari database (Direct-DB Fetch) — dipertahankan dari v1, ditambah caching Redis untuk lookup pedoman.
5. Menyediakan API Ingestion batch (terproteksi API Key) untuk impor data survei Riskesdas/CSV — dipakai juga untuk seeding data riil.
6. Menyediakan endpoint Health Check yang benar-benar melakukan ping ke database (bukan hardcoded).

### 2.1 Diagram Topologi (revisi)

```
Frontend Client Layer (React 19 PWA)
        │  HTTP REST (submit, share, health)     │ SSE (chat/stream)
        ▼                                         ▼
┌───────────────────────────────────────────────────────────┐
│                 Backend Gateway (Express.js)               │
│  ┌────────────┐   ┌───────────────┐   ┌──────────────────┐ │
│  │ Z-Score     │   │ Weighted Risk  │   │ Gemini Chat SSE  │ │
│  │ Engine      │   │ Engine         │   │ Controller       │ │
│  │ (in-process)│   │ (in-process,   │   │ (Direct-DB Fetch)│ │
│  │             │   │ bobot dari     │   │                  │ │
│  │             │   │ 26 studi lit.) │   │                  │ │
│  └─────┬──────┘   └───────┬───────┘   └────────┬─────────┘ │
│        └──────────────┬───┴────────────────────┘           │
│                        ▼                                    │
│              Prisma ORM Client                              │
└────────┬───────────────────────────────────────┬───────────┘
         │                                         │
         ▼                                         ▼
┌─────────────────────┐                 ┌───────────────────────┐
│ Supabase PostgreSQL   │                │ Redis                 │
│ (ScreeningRecord,     │◄───cache-aside─┤ - GET share/:hash      │
│  AnonymousSession,    │                │ - rate-limit store     │
│  HealthKnowledgeBase, │                └───────────────────────┘
│  IngestionBatchLog)   │
└──────────────────────┘
```

**Tidak ada lagi** kotak "ML Microservice Layer" / "FastAPI" pada topologi produksi.

---

## 3. Skema Database (Prisma ORM) — Revisi Normalisasi

**Revisi §3 ini menggantikan versi sebelumnya** (yang memakai satu tabel `ScreeningRecord` datar berisi 34 kolom). Setelah backend jalan, audit data/system analyst menemukan 3 masalah struktural nyata di skema lama:

1. **Satu tabel raksasa** — identitas, lokasi, antropometri mentah, hasil hitung WHO, 11 jawaban kuesioner, dan output skor risiko semua digabung jadi satu baris. Sulit dibaca, dan akan makin menyiksa saat baris bertambah jadi ratusan ribu.
2. **Relasi yang seharusnya ada tapi hilang**: `ScreeningRecord.sourceBatchId` (string bebas) tidak pernah benar-benar terhubung ke `IngestionBatchLog.id` (UUID acak terpisah) — dua ID yang kebetulan mirip tapi tidak pernah di-JOIN.
3. **`persona` tidak konsisten** — 3 varian string ditulis ke kolom yang sama dari 3 titik kode berbeda, dua di antaranya melewati validasi Zod sama sekali.

**Prinsip desain revisi**: pecah `ScreeningRecord` jadi entitas inti + 3 tabel anak 1:1 berdasar peran data (input mentah vs. hasil hitung vs. output mesin), tegakkan relasi `Kelurahan` & `IngestionBatchLog` yang sungguhan, kunci integritas `persona`/`gender` pakai CHECK constraint — **tanpa mengubah kontrak API**. Sebuah VIEW SQL (`screening_record_flat`) merekonstruksi bentuk datar yang sama persis yang dikonsumsi `frontend/src/types/screening.ts`, jadi endpoint baca tinggal `SELECT * FROM screening_record_flat` dan frontend tidak perlu diubah sama sekali (diverifikasi end-to-end: respons `POST /submit` & `GET /share/:hash` identik bentuknya sebelum/sesudah normalisasi, dashboard browser tampil sama).

### 3.1 Diagram Entitas

```
Kelurahan                         IngestionBatchLog
  id, name (unik), district         id (=batchId asli, BUKAN UUID acak lagi),
  15 baris seed (3 kecamatan)        sourceName, sourceType, counts
  │                                  │
  │ 0..N                             │ 0..N (RELASI BARU — bug lama diperbaiki)
  ▼                                  ▼
AnonymousSession ──1..N──► ScreeningRecord (INTI, ramping: ~13 kolom)
  id, clientToken, persona            id, shareHash, sessionId, sourceType,
  (identitas anonim per                sourceBatchId, persona, kelurahanId,
   perangkat, zero-login)              externalLocationLabel, isOutsideBontang,
                                       ageMonths, gender, weightKg, heightCm
                                       │
                    ┌──────────────────┼──────────────────┐
                    ▼ 1:1              ▼ 1:1               ▼ 1:1
            GrowthAssessment    ScreeningDeterminants    RiskAssessment
            (hasil hitung WHO)  (jawaban kuesioner)      (output mesin risiko)
            zScore, zScoreWAZ,  bblrOption, exclusiveAsi, riskTier, riskScore,
            zScoreWHZ,          mpasiAge, animalProtein,  dominantFactors,
            statusGiziTBU/      cleanWaterAccess,         rawMetadata,
            BBU/BBTB            sanitationAccess, dst.    engineVersion

HealthKnowledgeBase — TETAP berdiri sendiri, ini BENAR (bukan bug): tabel
referensi konten statis (mirip CMS), tidak terikat ke screening manapun.
```

**VIEW `screening_record_flat`** — JOIN kelima tabel (`ScreeningRecord` + `Kelurahan` + `GrowthAssessment` + `ScreeningDeterminants` + `RiskAssessment`) jadi satu baris datar. Dipakai `GET /screening/share/:hash` dan lookup chat controller. Ditulis sebagai raw SQL di migration (bukan Prisma `view` block, supaya tidak bergantung pada dukungan preview-feature yang belum tentu stabil) — dibaca lewat `prisma.$queryRaw`.

**Kenapa `_prisma_migrations` tidak muncul di diagram**: itu tabel bookkeeping internal Prisma sendiri (mencatat migrasi mana yang sudah diterapkan), bukan entitas bisnis aplikasi — kalau memakai tool ERD, tabel ini sebaiknya di-exclude dari visualisasi, bukan tanda desain yang salah.

### 3.2 Prisma Schema

```prisma
enum DataSourceType {
  PWA_DIRECT_USER
  RISKESDAS_KEMENKES
  SURVEY_CSV_UPLOAD
  EXTERNAL_HEALTH_API
}

model Kelurahan {
  id         String            @id @default(uuid())
  name       String            @unique
  district   String            // Kecamatan: Bontang Utara/Selatan/Barat
  createdAt  DateTime          @default(now())
  screenings ScreeningRecord[]
}

model AnonymousSession {
  id          String            @id @default(uuid())
  clientToken String            @unique
  persona     String            @default("Orang Tua / Anggota Keluarga Balita")
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  screenings  ScreeningRecord[]

  @@index([clientToken])
}

model IngestionBatchLog {
  id           String            @id            // disuplai aplikasi = sourceBatchId, bukan auto-uuid
  sourceName   String
  sourceType   DataSourceType
  totalRecords Int
  successCount Int
  failedCount  Int
  importedAt   DateTime          @default(now())
  screenings   ScreeningRecord[]
}

model ScreeningRecord {
  id                    String             @id @default(uuid())
  shareHash             String             @unique @default(nanoid(10))
  sessionId             String
  session               AnonymousSession   @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  sourceType            DataSourceType     @default(PWA_DIRECT_USER)
  sourceBatchId         String?
  batch                 IngestionBatchLog? @relation(fields: [sourceBatchId], references: [id])
  persona               String             // CHECK constraint: 4 nilai kanonik
  kelurahanId           String?
  kelurahan             Kelurahan?         @relation(fields: [kelurahanId], references: [id])
  externalLocationLabel String?            // dipakai saat isOutsideBontang / data eksternal
  isOutsideBontang      Boolean
  ageMonths             Int
  gender                String             // CHECK constraint: 'Laki-Laki' | 'Perempuan'
  weightKg              Float
  heightCm              Float
  createdAt             DateTime           @default(now())

  growth       GrowthAssessment?
  determinants ScreeningDeterminants?
  risk         RiskAssessment?

  @@index([sessionId])
  @@index([shareHash])
  @@index([kelurahanId])
}

model GrowthAssessment {
  screeningRecordId String          @id
  screening         ScreeningRecord @relation(fields: [screeningRecordId], references: [id], onDelete: Cascade)
  zScore            Float
  zScoreWAZ         Float?
  zScoreWHZ         Float?
  statusGiziTBU     String?
  statusGiziBBU     String?
  statusGiziBBTB    String?
}

model ScreeningDeterminants {
  screeningRecordId String          @id
  screening         ScreeningRecord @relation(fields: [screeningRecordId], references: [id], onDelete: Cascade)
  bblrOption        Int
  exclusiveAsi      Int
  mpasiAge          Int
  animalProtein     Int[]
  cleanWaterAccess  Int
  sanitationAccess  Int
  smokeExposure     Int
  motherEducation   Int
  economicQuintile  Int
  diarrheaHistory   Int
  posyanduKia       Int
}

model RiskAssessment {
  screeningRecordId String          @id
  screening         ScreeningRecord @relation(fields: [screeningRecordId], references: [id], onDelete: Cascade)
  riskTier          String
  riskScore         Float
  dominantFactors   String[]
  rawMetadata       Json?
  engineVersion     String          @default("weighted-v1")

  @@index([riskTier])
}

model HealthKnowledgeBase {
  id                      String   @id @default(uuid())
  topicTitle              String
  category                String
  targetAgeGroupMinMonths Int      @default(0)
  targetAgeGroupMaxMonths Int      @default(59)
  targetRiskTier          String
  tags                    String[]
  guidelineContent        String   @db.Text
  actionableSteps         String[]
  sourceReference         String
  createdAt               DateTime @default(now())

  @@index([category])
  @@index([targetRiskTier])
}
```

Skema lengkap dengan doc-comment `///` per model ada di `backend/prisma/schema.prisma` — dibaca banyak tool ERD/IDE sebagai tooltip penjelas, jadi tidak perlu dokumentasi terpisah untuk "apa fungsi tabel ini" lagi.

### 3.3 Integritas Data Tambahan

- **CHECK constraint** `persona` (4 nilai kanonik) dan `gender` ('Laki-Laki'/'Perempuan') di level Postgres — menolak data kotor walau ada kode yang lupa validasi Zod (2 titik kode ditemukan melewati Zod sepenuhnya: `session.controller.ts` dan pembuatan sesi batch di `BatchPersistenceService.ts` — sudah diperbaiki untuk selalu memanggil `normalizePersona()`, lihat `backend/src/utils/normalizePersona.ts`, tapi constraint tetap dipasang sebagai pertahanan lapis kedua).
- **FK sungguhan** `ScreeningRecord.sourceBatchId → IngestionBatchLog.id` — sebelum revisi ini dua ID acak terpisah yang tidak pernah cocok; sekarang `IngestionBatchLog.id` disuplai aplikasi persis sama dengan `sourceBatchId` yang dipakai baris-baris hasil batch tersebut, jadi benar-benar bisa di-JOIN.
- **`engineVersion`** di `RiskAssessment` mencatat versi algoritma skor risiko yang menghasilkan baris tsb (default `"weighted-v1"`) — berguna untuk audit kalau metodologinya berubah lagi di masa depan (sudah pernah terjadi sekali: rencana Naive Bayes → weighted-rule, lihat §6).

---

## 4. Kontrak API Endpoint

Semua response error memakai format seragam:
```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "..." } }
```

### 4.1 `POST /api/v1/screening/submit`

- **Headers**: `Content-Type: application/json`
- **Request Body** — persis `ScreeningSubmitPayload` di `frontend/src/types/screening.ts`:
```json
{
  "clientToken": "uuid-string",
  "persona": "Orang Tua / Anggota Keluarga Balita",
  "isOutsideBontang": false,
  "kelurahan": "Loktuan",
  "gender": "Laki-Laki",
  "ageMonths": 18,
  "weightKg": 8.5,
  "heightCm": 74.5,
  "bblrOption": 1,
  "exclusiveAsi": 1,
  "mpasiAge": 2,
  "animalProtein": [1, 2],
  "cleanWaterAccess": 1,
  "sanitationAccess": 1,
  "smokeExposure": 1,
  "motherEducation": 3,
  "economicQuintile": 3,
  "diarrheaHistory": 1,
  "posyanduKia": 1,
  "rawMetadata": { "measurementPosition": "Terlentang" }
}
```
- **Alur Proses**:
  1. Validasi Zod (`screeningSchema` — sudah ada, dipertahankan).
  2. `findOrCreateSession` berdasar `clientToken`.
  3. Panggil `zscoreEngine.calculateZScores(...)` — **in-process**, tanpa HTTP call keluar.
  4. Panggil `weightedRiskEngine.calculateRisk(...)` — **in-process**, bobot dari `literatureWeights.ts`.
  5. Simpan `ScreeningRecord` (Prisma).
  6. Invalidasi/tulis cache Redis `screening:share:{shareHash}` (write-through, TTL panjang karena immutable).
  7. Response 201:
```json
{ "data": { "...ScreeningRecord..." }, "shareHash": "AbC123XyZ0" }
```

### 4.2 `GET /api/v1/screening/share/:shareHash` — **BARU**

- Endpoint ini sebelumnya hilang meski sudah dipanggil frontend (`screeningApi.getByShareHash`).
- **Alur**: cek Redis (`screening:share:{shareHash}`) → jika hit, kembalikan langsung; jika miss, query Prisma by `shareHash` (indexed) → jika ketemu, tulis ke Redis lalu kembalikan → jika tidak ketemu, `404 { error: { code: "NOT_FOUND" } }`.
- Response 200: sama bentuk dengan `data` pada submit.

### 4.3 `GET /api/v1/health`

- Ping database asli: `SELECT 1` via Prisma. Response mencerminkan hasil sebenarnya, bukan hardcode:
```json
{ "status": "ok", "timestamp": "2026-09-28T00:00:00Z", "db": "connected" }
```
Jika query gagal → `503 { "status": "degraded", "db": "disconnected" }`.

### 4.4 `POST /api/v1/chat/stream` (SSE)

- Dipertahankan dari implementasi v1 (`chat.controller.ts` + `gemini.service.ts` sudah bekerja dengan baik) — direct-relational-fetch `ScreeningRecord` + `HealthKnowledgeBase` by `sessionId`/`riskTier`, injeksi ke system prompt Gemini, stream token via SSE `data: {"type":"chunk","text":"..."}` ... `data: [DONE]`.
- **Perubahan**: lookup `HealthKnowledgeBase` per (`riskTier`, rentang umur) di-cache Redis (`kb:{riskTier}:{ageMonths}`, TTL 1 jam — konten edukasi jarang berubah).

### 4.5 `POST /api/v1/ingest/upload/:sourceType`

- Headers: `X-API-KEY`, `Content-Type: multipart/form-data`.
- `sourceType`: `riskesdas | csv-survey`.
- Dipertahankan dari v1 (`BatchOrchestrator` sudah solid), dengan perubahan: `BatchMLService` tidak lagi memanggil `mlClient.service.ts` (HTTP ke FastAPI) — memanggil `zscoreEngine`/`weightedRiskEngine` in-process untuk baris yang belum punya Z-Score/risk precomputed.

### 4.6 `POST /api/v1/session`

- Dipertahankan (find-or-create `AnonymousSession`), dirapikan agar konsisten menyimpan `persona` sesuai yang dikirim (bug lama: selalu hardcode `"ORANG_TUA"`).

---

## 5. Mesin Z-Score WHO (Pengganti ML Microservice)

- **Sumber**: tabel LMS resmi WHO Child Growth Standards 2006 (bulanan, 0–59 bulan, Laki-laki/Perempuan, 3 indeks: Length/Height-for-Age, Weight-for-Age, Weight-for-Length/Height) — diambil dari tabel referensi resmi WHO saat implementasi (Stage 3), **bukan** direproduksi dari ingatan/perkiraan, mengingat ini dipakai untuk keputusan kesehatan anak riil.
- **Formula**: `Z = ((X/M)^L - 1) / (L·S)` bila `L ≠ 0`, atau `Z = ln(X/M)/S` bila `L = 0`.
- **Interpolasi**: untuk Weight-for-Length/Height, indeks tabel berbasis panjang/tinggi badan (bukan umur) — interpolasi linear antar titik tabel terdekat bila nilai pengukuran jatuh di antara dua baris tabel.
- **Klasifikasi status gizi**: ambang batas standar WHO (`< -3 SD`, `-3 s/d -2 SD`, `-2 s/d +2/+3 SD`, dst — persis seperti yang sudah dipakai konsisten di `mockApi.ts`/`ml-service` untuk pelabelan, dipertahankan agar UI tidak berubah makna).
- Modul ini murni fungsi (`(ageMonths, gender, weightKg, heightCm) → { zScoreTBU, zScoreWAZ, zScoreWHZ, statusGiziTBU, statusGiziBBU, statusGiziBBTB }`), tidak ada I/O, mudah diuji (`scripts/selfcheck-zscore.ts` — memverifikasi Z=0 tepat di median WHO & klasifikasi status gizi).
- Tabel LMS diunduh langsung dari cdn.who.int (bukan direproduksi dari ingatan) — 8 file resmi WHO Child Growth Standards 2006 (LHFA/WFA/WFL/WFH, boys & girls), diringkas ke `who-lms-data.json` lewat `scripts/who-source/extract.py` (lihat komentar sumber lengkap di `whoLmsTables.ts`).

---

## 6. Mesin Skor Risiko — Weighted Multi-Determinant Engine (Revisi dari Rencana Naive Bayes)

**Pivot penting dari rencana awal**: rencana semula (disetujui di awal Stage 3) adalah melatih model Naive Bayes dari 130.620 baris Riskesdas riil. Setelah file sumber (`data/sources/riskesdas-2018-baduta.xlsx`) diperiksa baris-per-baris, ternyata sheet `Baduta real` hanya **dideklarasikan berdimensi** 130.620 baris — isi riilnya cuma 20 baris data balita yang lengkap (baris 2–21), sisanya kosong total, dan 5 baris di ekor sheet (130.617–130.621) bukan data melainkan teks catatan validasi ("Pemeriksaan kesalahan dan ketidaktepatan data", `#REF!`, `#DIV/0!`) yang tampaknya nyasar dari footer sheet `Variabel`. Sudah diverifikasi dengan dua parser independen (Python `openpyxl` dan Node `xlsx`/SheetJS) — hasilnya sama, jadi ini bukan bug parser.

20 baris bukan volume yang cukup untuk melatih model statistik yang bisa dipercaya (risiko overfit total). Atas keputusan pemilik proyek, skema risiko diganti menjadi **weighted-rule engine** yang dikalibrasi dari proporsi kemunculan tiap faktor determinan di 26 studi tinjauan literatur (`Resume artikel faktor risiko stunting.xlsx`, sheet `Analisis faktor stunting`) — **bukan** model Naive Bayes yang benar-benar dilatih dari data. 20 baris Riskesdas riil tetap dipakai (sebagai data uji/contoh nyata saat seeding, lihat §10), hanya tidak lagi jadi basis pelatihan.

### 6.1 Cara Kerja (`src/domain/risk/weightedRiskEngine.ts`)

1. Baseline skor `0.15` (titik awal netral, sama seperti konvensi yang sudah divalidasi produk di `frontend/src/lib/mockApi.ts`).
2. Untuk tiap determinan (BBLR, ASI eksklusif, usia MPASI, keragaman protein hewani, akses air bersih, akses sanitasi, paparan asap rokok, riwayat diare, kuintil ekonomi, pendidikan ibu, keaktifan posyandu), tambahkan kontribusi poin bila nilainya mengindikasikan risiko — besar kontribusi maksimum tiap faktor dihitung dari `proporsi_studi_yang_meneliti_faktor_ini × faktor_skala` (lihat `literatureWeights.ts`), bukan angka yang ditebak manual.
3. Bila Z-Score TB/U hasil pengukuran saat ini `< -2 SD`, tambahkan boost tetap `+0.35` **dan** jadikan `riskTier` minimal `HIGH` — status gizi yang sudah buruk saat ini adalah sinyal risiko terkuat, konvensi ini dipertahankan dari produk lama supaya makna tier tidak berubah di mata pengguna.
4. Skor akhir di-clamp ke rentang `[0.05, 0.98]`.
5. Klasifikasi tier: `>= 0.70` → HIGH, `>= 0.40` → MODERATE, selebihnya LOW (ambang sama seperti FR-CMP-02 PRD).
6. `dominantFactors` = daftar label faktor yang benar-benar berkontribusi (poin > 0), diurutkan dari kontribusi terbesar, maksimal 5 — memakai kosakata label yang sama persis dengan `factorLabels` di `frontend/src/components/analytics/DeterminantRadarWidget.tsx` supaya tampil rapi di UI tanpa perlu mengubah frontend.

### 6.2 Bobot dari Literatur (`literatureWeights.ts`)

Proporsi kemunculan faktor di 26 studi (mis. Sosial-ekonomi 50%, Pendidikan ibu 46%, ASI 23%, Sanitasi 23%, Akses air bersih 19,2%, Akses layanan kesehatan 15%, Berat lahir 7,7%, Asap rokok 3,8%, Diare 3,8%) diskalakan sehingga total kontribusi maksimum seluruh faktor ≈ 0,85 (menyisakan ruang untuk baseline 0,15 + boost Z-Score sebelum di-cap 0,98). Ini membuat faktor yang lebih sering terbukti relevan di literatur (ekonomi, pendidikan ibu) punya bobot lebih besar daripada yang jarang diteliti (asap rokok, diare) — kalibrasi yang lebih bisa dipertanggungjawabkan dibanding angka yang ditebak manual di versi mock lama.

### 6.3 Keterbatasan yang Didokumentasikan Jujur

- Ini **bukan** model machine learning yang dilatih dari data berlabel — murni fungsi deterministik berbasis bobot. Istilah "Naive Bayes" di PRD/copy UI lama sudah tidak akurat menggambarkan mesin ini; disarankan disesuaikan di iterasi dokumentasi produk berikutnya (di luar scope backend).
- Proporsi literatur mengukur seberapa sering faktor **diteliti**, bukan besar efeknya secara presisi (studi tidak semuanya melaporkan effect size yang bisa dibandingkan apple-to-apple) — dipakai sebagai sinyal kalibrasi relatif.
- Modul ini murni fungsi (`RiskEngineInput → RiskEngineResult`), tidak ada I/O, mudah diuji (`scripts/selfcheck-risk.ts`).

---

## 7. Strategi Redis

| Use Case | Key Pattern | TTL | Alasan |
|---|---|---|---|
| Cache hasil skrining by shareHash | `screening:share:{shareHash}` | Tanpa TTL (invalidasi manual bila diperlukan) — record immutable setelah dibuat | Link share bisa dibuka berkali-kali (WA/rujukan nakes), hindari round-trip DB berulang |
| Cache lookup HealthKnowledgeBase per chat | `kb:{riskTier}:{ageMonths}` | 1 jam | Konten edukasi jarang berubah, dipanggil tiap chat SSE dibuka |
| Rate-limit store | (dikelola otomatis oleh `rate-limit-redis`) | sesuai window (15 menit) | Supaya limit konsisten lintas instance backend, best-practice produksi |

Redis **tidak** dipakai untuk: tabel WHO LMS, bobot weighted-risk engine (konstanta kecil, cukup in-memory), atau session store (sesi anonim tetap di Postgres via `AnonymousSession`).

---

## 8. Middleware & Keamanan

- `helmet()`, `cors()` (origin dari `CORS_ORIGIN`), `express.json({limit:'10kb'})`, `morgan('combined')` — dipertahankan.
- `apiKeyAuth` (X-API-KEY) tetap melindungi `/ingest/upload`.
- `express-rate-limit` + `rate-limit-redis` sebagai store — dipasang di `submit`, `chat/stream`, `ingest/upload`.
- Validasi Zod (`screeningSchema` dkk.) tetap jadi lapisan validasi tunggal (hapus sisa `express-validator`/`validateRequest.ts` yang dead code).
- Error handler tunggal (satu middleware, hapus duplikasi inline di `app.ts` vs `errorHandler.ts` yang tidak dipakai).

---

## 9. Environment Variables

| Var | Keterangan |
|---|---|
| `PORT` | Port server (default 5001, disamakan dengan default frontend `VITE_API_URL`) |
| `DATABASE_URL` | Supabase Postgres connection string (dipakai Prisma Client runtime) |
| `DIRECT_URL` | Supabase direct connection (dipakai Prisma Migrate) |
| `REDIS_URL` | Connection string Redis (baru) |
| `GATEWAY_API_KEY` | API key statis untuk `/ingest/upload` |
| `CORS_ORIGIN` | Origin frontend yang diizinkan |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | Konfigurasi Gemini chat (dipertahankan) |

`ML_SERVICE_URL`, `ML_TIMEOUT_MS` **dihapus** dari `.env.example` (tidak lagi relevan).

---

## 10. Strategi Seeding Data Riil

**Catatan volume (lihat §6.1)**: hanya 20 baris dari file Riskesdas yang benar-benar berisi data riil, bukan 130.620 seperti dimensi sheet yang dideklarasikan. Ke-20 baris ini diseed ke `ScreeningRecord` lewat `npm run seed:riskesdas` (`scripts/seedRiskesdas.ts`) — memakai `riskesdasMapper.ts` untuk pemetaan kolom, Z-Score TB/U resmi dari dataset, `zscoreEngine` untuk BB/U & BB/TB (tidak tersedia resmi di dataset), dan `weightedRiskEngine` untuk skor risiko. `HealthKnowledgeBase` diisi lewat `npm run seed:knowledge-base` (`scripts/seedHealthKnowledgeBase.ts`) — 11 entri merangkum praktik kesehatan mapan (WHO/Kemenkes) dengan `sourceReference` mengutip studi riil dari tinjauan literatur 26 studi.

### 10.1 Pemetaan Kolom Riskesdas 2018 → Skema Kanonik

| Kolom Riskesdas (`Baduta real`) | Field Kanonik | Catatan |
|---|---|---|
| `WEIGHT3_02012023_VALIDASI` | `weightKg` | Pakai kolom **tervalidasi** ini, bukan `weight_balita` mentah (codebook sendiri menandai `weight_balita` bermasalah satuan) |
| `HEIGHT3_02012023_VALIDASI` | `heightCm` | Kolom tervalidasi |
| `UMUR_BL_B` | `ageMonths` | Langsung |
| `P404` | `gender` | 1→`Laki-Laki`, 2→`Perempuan` |
| `Z-Score (PB/U)` | `zScore` | Pakai nilai resmi yang sudah dihitung Kemenkes, tidak dihitung ulang |
| `Status Gizi` | `statusGiziTBU` | Dipetakan ke label kita (`Pendek`, `Sangat Pendek`, `Normal`, `Tinggi`) |
| `P1405` + `P1404` | `bblrOption` | `<2500g`→2, `>=2500g`→1, tidak tercatat/`P1404=2 atau 8`→3 |
| `P1303`/`P1305`/`P1307` | `exclusiveAsi` | Kombinasi "pernah disusui + tidak diberi makanan lain sebelum 6 bulan" → 1; formula/campuran → 2; usia <6 bulan → 3 |
| `P1311` | `mpasiAge` | Bucket kategori 1–6 (≤4 bln) → 1; 7 (5–6 bln) → 2; 8 (>6 bln) → 3; `77` (tidak berlaku) → 4 |
| `P705C1`,`P705D1`,`P705A1`,`P706A1/B1` | `animalProtein[]` | Frekuensi ≥1 hari/minggu → masukkan kode ikan/telur/daging/susu; semua 0 → `[5]` |
| `P501` | `cleanWaterAccess` | Kemasan/isi ulang→1; PDAM→2; sumur bor→3; lainnya (tak terlindung)→4 |
| `P504`+`P505`+`P506` | `sanitationAccess` | Milik sendiri+septic tank/IPAL→1; cemplung→2; MCK umum→3; tidak punya→4 |
| `DIDIK_IBU` | `motherEducation` | {1,2}→1(SD), {3}→2(SMP), {4}→3(SMA), {5}→4(PT) |
| `kuintil` | `economicQuintile` | Langsung (1–5) |
| `P1004` | `posyanduKia` | Bisa tunjukkan buku KIA→1; disimpan kader/kadang→2; hilang/tidak pernah→3 |
| *(tidak tersedia di subset ini)* | `smokeExposure` | Tidak ada kolom identik → default ke nilai modus populasi + tandai `rawMetadata.dataQualityNotes` |
| *(tidak tersedia di subset ini)* | `diarrheaHistory` | Sama seperti di atas |
| `STRATA`/`PSU`/`kuintil` | — | Tidak dipetakan ke `kelurahan` Bontang (data nasional) → lihat §10.2 |

### 10.2 Penandaan Data Riskesdas

Setiap baris hasil seeding disimpan dengan:
```json
{
  "sourceType": "RISKESDAS_KEMENKES",
  "isOutsideBontang": true,
  "kelurahan": "Data Riskesdas Nasional",
  "persona": "SURVEYOR_BATCH",
  "sourceBatchId": "RISKESDAS-2018-<timestamp>"
}
```
Ini memastikan data riil ini tidak tercampur secara menyesatkan dengan statistik per-kelurahan Bontang dari pengguna PWA asli, tapi tetap tersimpan dan bisa dipakai untuk analitik agregat/pelatihan model di masa depan.

### 10.3 `HealthKnowledgeBase` dari Literatur

26 studi pada `Resume artikel faktor risiko stunting.xlsx` (sheet `faktor stunting`) dan tabel proporsi faktor (sheet `Analisis faktor stunting`) dipakai untuk:
- Menyusun 8-12 entri `HealthKnowledgeBase` per kategori determinan dominan (sanitasi, ASI eksklusif, ekonomi, pendidikan ibu, dst.), `sourceReference` diisi sitasi asli (penulis, tahun, judul).
- Proporsi kemunculan tiap faktor di 26 studi **langsung dipakai** sebagai bobot kalibrasi `weightedRiskEngine` (lihat §6.2) — bukan sekadar catatan referensi, tapi input numerik nyata ke rumus skor risiko.

---

## 11. Batasan Eksplisit (Out of Scope pada Revisi Ini)

- **Model Naive Bayes terlatih** — dibatalkan (lihat §6). Diganti weighted-rule engine terkalibrasi literatur karena data pelatihan yang tersedia (20 baris riil) tidak cukup untuk pelatihan statistik yang valid. Bila di masa depan tersedia dataset riil dengan volume memadai (ratusan-ribuan baris), pelatihan Naive Bayes bisa dihidupkan kembali — struktur `scripts/riskesdasMapper.ts` sudah disiapkan untuk itu.
- **Modul Komunitas & Makro/Spasial** (PRD §5 Modul 3b/3c) — tidak diimplementasikan karena frontend belum punya halaman/route untuk itu. `analyticsAggregator.service.ts` (stub lama) dibiarkan tidak terpakai, didokumentasikan di sini sebagai titik ekstensi masa depan bila frontend membangun dashboard tersebut.
- **ML Microservice Python (`ml-service/`)** — tidak dijalankan, tidak menjadi dependency produksi.
- **Manajemen user berbasis password/email** — tetap out of scope sesuai PRD (Zero-Login Friction).
- **Supabase pooled connection (Supavisor, port 6543)** — belum tersedia saat penulisan dokumen ini; sementara pakai direct connection untuk `DATABASE_URL` maupun `DIRECT_URL`. Item lanjutan: pisahkan begitu connection string pooled tersedia (penting untuk skalabilitas produksi).

---

## 12. Referensi

- PRD - Sistem Analitik SEHATI v2.0.0-ANALYTICS (konteks bisnis, visi produk, NFR).
- Proposal Sosial SEHATI (KPP Mining Youth in Action, 2024) — latar belakang & konteks Kota Bontang.
- Riskesdas 2018 Kemenkes — data riil determinan & antropometri balita.
- Tinjauan literatur 26 studi faktor risiko stunting — dasar isi `HealthKnowledgeBase`.
- Rencana eksekusi bertahap: lihat berkas plan sesi ini (Stage 1–7).
