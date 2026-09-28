# Dokumentasi Run Testing — Backend SEHATI

Dokumen ini menjelaskan cara menjalankan dan memverifikasi hasil rombak backend (lihat `Backend API Gateway FDD.md` untuk desain lengkap). Semua contoh perintah & hasil di bawah **sudah benar-benar dijalankan** terhadap Supabase + Redis nyata selama pengerjaan Stage 1–6, bukan simulasi.

---

## 1. Menjalankan Backend Secara Lokal

### 1.1 Prasyarat
- Node.js 20+, npm.
- Docker Desktop (untuk Redis lokal) — atau Redis hosted (mis. Upstash) bila tidak pakai Docker.
- File `.env` sudah terisi (salin dari `.env.example`, isi `DATABASE_URL`/`DIRECT_URL` Supabase, `GEMINI_API_KEY`, `GATEWAY_API_KEY`, `REDIS_URL`).

### 1.2 Langkah
```bash
cd backend
npm install

# Redis lokal (skip bila REDIS_URL menunjuk ke Redis hosted)
docker run -d --name sehati-redis -p 6379:6379 redis:7-alpine

# Terapkan migrasi Prisma ke Supabase
npx prisma migrate deploy
npx prisma generate

# Jalankan server dev
npm run dev
```
Server berjalan di `http://localhost:5001` (atau sesuai `PORT`). Log yang benar akan menampilkan:
```
SEHATI Backend Gateway running on port 5001
[INFO] Redis connected (redis://localhost:6379)
```

### 1.3 Self-Check Mesin Domain (tanpa DB/Redis)
```bash
npm run selfcheck:zscore            # Z-Score WHO vs median resmi & kasus klinis
npm run selfcheck:risk              # weightedRiskEngine: profil sehat vs berisiko
npm run selfcheck:riskesdas-mapper  # mapping 20 baris riil Riskesdas
```
Semua harus mencetak `SEMUA LULUS` / `OK`.

### 1.4 Seeding Data Riil (sekali saja, atau setelah reset DB)
```bash
npm run seed:riskesdas         # 20 baris riil Riskesdas -> ScreeningRecord
npm run seed:knowledge-base    # 11 entri HealthKnowledgeBase dari 26 studi literatur
```

---

## 2. Verifikasi Tiap Endpoint (curl)

### 2.1 Health Check
```bash
curl -s http://localhost:5001/api/v1/health
```
Hasil nyata (dijalankan saat testing):
```json
{"status":"ok","timestamp":"2026-09-28T00:22:52.838Z","db":"connected","message":"Layanan berjalan normal."}
```
Matikan Supabase/putuskan `DATABASE_URL` untuk memverifikasi respons `503 { "status": "degraded", "db": "disconnected" }`.

### 2.2 Submit Skrining
```bash
curl -s -X POST http://localhost:5001/api/v1/screening/submit \
  -H "Content-Type: application/json" \
  -d '{
    "clientToken": "11111111-1111-4111-8111-111111111111",
    "persona": "Orang Tua / Anggota Keluarga Balita",
    "isOutsideBontang": false, "kelurahan": "Loktuan",
    "gender": "Laki-Laki", "ageMonths": 18, "weightKg": 8.5, "heightCm": 74.5,
    "bblrOption": 1, "exclusiveAsi": 1, "mpasiAge": 2, "animalProtein": [1,2],
    "cleanWaterAccess": 1, "sanitationAccess": 1, "smokeExposure": 1,
    "motherEducation": 3, "economicQuintile": 3, "diarrheaHistory": 1, "posyanduKia": 1
  }'
```
Hasil nyata yang diperoleh (Z-Score & risk dihitung in-process, bukan dari service eksternal):
```json
{"success":true,"data":{"...":"...","zScore":-2.88,"statusGiziTBU":"Pendek","riskTier":"HIGH","riskScore":0.85,"dominantFactors":["INDIKASI_PERAWAKAN_PENDEK_TBU"]},"shareHash":"_wr92Q-gXN"}
```
**Verifikasi manual**: bandingkan `zScore`/`riskTier` dengan hasil di dashboard frontend untuk input yang sama — harus identik.

### 2.3 Ambil Hasil via Share Hash (endpoint yang tadinya hilang)
```bash
curl -s http://localhost:5001/api/v1/screening/share/<shareHash-dari-langkah-2.2>
```
Harus mengembalikan `200` dengan data yang sama. Hash acak → `404 { "error": { "code": "NOT_FOUND" } }`.

### 2.4 Sesi Anonim
```bash
curl -s -X POST http://localhost:5001/api/v1/session \
  -H "Content-Type: application/json" \
  -d '{"clientToken":"<uuid>","persona":"Kader Posyandu"}'
```
Verifikasi field `persona` pada respons **sama** dengan yang dikirim (bug lama: selalu `ORANG_TUA`).

### 2.5 Ingest Batch (terproteksi API Key)
```bash
# Tanpa API key -> 401
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:5001/api/v1/ingest/upload/csv-survey

# Dengan API key + file CSV
curl -s -X POST http://localhost:5001/api/v1/ingest/upload/csv-survey \
  -H "X-API-KEY: <GATEWAY_API_KEY dari .env>" \
  -F "file=@contoh-survey.csv"
```

### 2.6 Chat SSE (butuh `GEMINI_API_KEY` asli di `.env`)
```bash
curl -s -N -X POST http://localhost:5001/api/v1/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"query":"apa itu stunting","mode":"umum"}'
```
Harus streaming `data: {"type":"chunk",...}` diakhiri `data: {"type":"done"}`. Tanpa `GEMINI_API_KEY` valid, respons tetap SSE tapi berisi `type: "error"` dengan pesan yang jelas (bukan crash).

---

## 3. Verifikasi Database — Index & Query Plan

Sejak normalisasi skema (lihat FDD §3), `screening_record_flat` adalah VIEW gabungan 5 tabel (`ScreeningRecord` + `Kelurahan` + `GrowthAssessment` + `ScreeningDeterminants` + `RiskAssessment`). Dibuktikan dengan `EXPLAIN ANALYZE` (dijalankan nyata terhadap Supabase setelah normalisasi + reseed):

```sql
EXPLAIN ANALYZE SELECT * FROM "screening_record_flat" WHERE "shareHash" = 'Y1MtLsNTYk';
```
```
Nested Loop (... 4 level, satu per tabel yang di-JOIN)
  -> Index Scan using "ScreeningRecord_shareHash_idx" on "ScreeningRecord"
  -> Index Scan using "Kelurahan_pkey" on "Kelurahan"
  -> Index Scan using "GrowthAssessment_pkey" on "GrowthAssessment"
  -> Index Scan using "RiskAssessment_pkey" on "RiskAssessment"
  -> Index Scan using "ScreeningDeterminants_pkey" on "ScreeningDeterminants"
Execution Time: 0.128 ms
```
Setiap tabel yang di-JOIN kena **Index Scan** (bukan Seq Scan) — join lewat VIEW tidak menambah biaya berarti karena semua sisi join (PK anak tabel = FK ke induk) sudah terindeks otomatis oleh Prisma (`@id` selalu jadi PRIMARY KEY/index).

```sql
EXPLAIN ANALYZE SELECT * FROM "ScreeningRecord"
WHERE "kelurahanId" = (SELECT id FROM "Kelurahan" WHERE name='Loktuan');
```
```
Index Scan using "ScreeningRecord_kelurahanId_idx" on "ScreeningRecord"
Execution Time: 0.057 ms
```

```sql
EXPLAIN ANALYZE SELECT * FROM "RiskAssessment" WHERE "riskTier" = 'HIGH';
```
```
Bitmap Index Scan on "RiskAssessment_riskTier_idx"
Execution Time: 0.048 ms
```

**Cara menjalankan sendiri**: buka Supabase Dashboard → SQL Editor, atau via Prisma:
```ts
await prisma.$queryRawUnsafe(`EXPLAIN ANALYZE SELECT * FROM "screening_record_flat" WHERE "shareHash" = '...'`);
```
Jika hasil menunjukkan `Seq Scan` (bukan `Index Scan`) setelah data bertambah banyak, itu tanda index perlu ditinjau ulang — tidak terjadi pada kondisi saat ini (21 baris data: 1 PWA + 20 Riskesdas).

**Verifikasi relasi `IngestionBatchLog` yang tadinya hilang** (lihat FDD §3):
```sql
SELECT COUNT(*) FROM "ScreeningRecord" sr
JOIN "IngestionBatchLog" b ON b.id = sr."sourceBatchId"
WHERE sr."sourceType" = 'RISKESDAS_KEMENKES';
-- Harus = 20 (semua baris seed Riskesdas benar-benar ter-JOIN ke log batch-nya)
```

---

## 4. Verifikasi Redis

```bash
# Cek Redis hidup
docker exec sehati-redis redis-cli ping   # -> PONG

# Lihat key yang tersimpan
docker exec sehati-redis redis-cli KEYS "*"
# screening:share:<hash>   -> cache-aside hasil skrining
# rl:submit:...            -> rate-limit store endpoint submit
# rl:chat:...              -> rate-limit store endpoint chat

# Cek isi cache share-hash
docker exec sehati-redis redis-cli GET "screening:share:<hash>"

# Statistik hit/miss cache
docker exec sehati-redis redis-cli INFO stats | grep keyspace
# keyspace_hits / keyspace_misses naik seiring GET /screening/share/:hash dipanggil berulang
```
Cara memverifikasi cache-aside benar-benar dipakai: panggil `GET /screening/share/:hash` dua kali — panggilan pertama boleh miss (baca DB, tulis cache), panggilan kedua **harus** lebih cepat dan `keyspace_hits` bertambah.

---

## 5. Verifikasi Frontend Sudah Pakai Data Live (Bukan Dummy)

1. Set `frontend/.env.local` → `VITE_API_URL=http://localhost:5001` (sudah dibuat, lihat §1.1).
2. Jalankan backend (§1) dan `npm run dev` di `frontend/`.
3. Buka `http://localhost:5173/questionnaire`, isi & submit form.
4. **Checklist visual di halaman `/analytics/:shareHash`**:
   - [ ] Badge di kanan-atas bertuliskan **"Live Backend API"** (titik hijau berdenyut), **bukan** "Mode Simulasi (Mock Data)".
   - [ ] Buka link share yang sama di tab/browser baru (memaksa fetch ulang dari server, bukan cache sessionStorage) → badge tetap "Live Backend API".
   - [ ] Nilai Z-Score/risk yang tampil di dashboard cocok dengan hasil `curl` manual (§2.2) untuk input yang sama.
5. **Checklist chatbot**: buka drawer HATI, tanyakan sesuatu → jawaban muncul streaming kata-per-kata dari Gemini (bukan teks kalengan `generateContextualAnswer`/`generateUmumAnswer` di `chatService.ts` — itu hanya aktif sebagai fallback saat backend benar-benar tidak terjangkau).
6. **Regresi mode offline** (fitur PWA yang disengaja, FR-INT-04 — **jangan dianggap bug**): matikan backend (`Ctrl+C` di terminal dev server), lalu submit form skrining baru → badge harus berubah ke "Mode Simulasi (Mock Data)" dan submission masuk antrean offline (`sehati_offline_queue_*` di IndexedDB). Nyalakan backend lagi → antrean otomatis ter-sinkron saat aplikasi mendeteksi online kembali. *(Alur kode ini — `screeningService.ts` — tidak diubah sama sekali oleh rombakan backend; diverifikasi lewat pembacaan kode langsung, bukan re-test UI otomatis, karena floating chat launcher pada UI menyulitkan automasi klik presisi selama sesi ini — disarankan verifikasi manual sekali oleh manusia sebelum rilis.)*

---

## 6. Keterbatasan yang Perlu Diketahui

- **Volume data Riskesdas**: hanya 20 baris riil (bukan 130.620) — lihat FDD §6. Model risiko akhirnya adalah **weighted-rule engine terkalibrasi literatur**, bukan Naive Bayes yang dilatih statistik.
- **2 fitur tanpa data sumber**: `smokeExposure` & `diarrheaHistory` pada baris hasil seeding Riskesdas memakai nilai default nasional (dicatat di `rawMetadata.dataQualityNotes`), bukan observasi langsung.
- **Modul Komunitas/Makro**: belum diimplementasikan (frontend belum punya halamannya) — lihat FDD §11.
- **Supabase pooled connection**: `DATABASE_URL` memakai mode transaction (6543), `DIRECT_URL` memakai mode session (5432) di host pooler yang sama — kedua-duanya sudah diverifikasi bisa connect dari jaringan ini (host direct `db.<ref>.supabase.co` tidak resolve dari jaringan pengembangan ini).
- **Redis wajib menyala** untuk endpoint yang dipasangi rate-limiter (`submit`, `chat/stream`, `ingest/upload`) — tanpa Redis, endpoint-endpoint ini akan gagal (rate-limit store tidak bisa diakses), bukan degradasi halus. Ini keputusan sadar (fail-fast lebih baik daripada rate-limit yang diam-diam tidak berfungsi). Sebaliknya, `GET /screening/share/:hash` dan cache `HealthKnowledgeBase` di chat **tetap resilien** tanpa Redis — cache-nya dibungkus try/catch dan otomatis fallback baca langsung ke database.
