/*
  Normalisasi ScreeningRecord (audit data/system analyst — lihat FDD §3 revisi).

  DESTRUKTIF DENGAN SENGAJA: mengosongkan ScreeningRecord/AnonymousSession/
  IngestionBatchLog. Disepakati dengan pemilik proyek — datanya cuma 21 baris
  data uji/seed (bukan data pengguna produksi), lebih murah direset lalu
  dijalankan ulang seedernya (npm run seed:riskesdas / seed:knowledge-base)
  daripada menulis migrasi pemindahan data baris-per-baris untuk dataset
  sekecil ini. HealthKnowledgeBase TIDAK disentuh (bukan bagian restrukturisasi).
*/

-- ResetData
TRUNCATE TABLE "AnonymousSession" CASCADE;
TRUNCATE TABLE "IngestionBatchLog";

-- CreateTable: Kelurahan (lookup 15 kelurahan Kota Bontang, ganti kolom teks bebas)
CREATE TABLE "Kelurahan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Kelurahan_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Kelurahan_name_key" ON "Kelurahan"("name");

-- UUID ditulis literal (bukan gen_random_uuid()) supaya tidak bergantung
-- pada extension pgcrypto/uuid-ossp yang belum tentu aktif di search_path.
INSERT INTO "Kelurahan" ("id", "name", "district") VALUES
    ('b5b4f9f6-1bc5-4f98-8a5a-f9b61796df0b', 'Api-Api', 'Bontang Utara'),
    ('1eda0fe3-e32a-4635-8359-d6352766ca3e', 'Bontang Baru', 'Bontang Utara'),
    ('efc8387c-9b06-4403-aa4d-15d6fee899c3', 'Bontang Kuala', 'Bontang Utara'),
    ('79cf77dc-ad30-46d4-93bc-311674f3ab27', 'Guntung', 'Bontang Utara'),
    ('97deb78c-5824-49d8-8e9e-2683c0931b7d', 'Gunung Elai', 'Bontang Utara'),
    ('3a92fb24-e31a-4d65-939f-60a0a30dd776', 'Loktuan', 'Bontang Utara'),
    ('ee4ec068-7223-4aa0-bd94-9cd0e28e05c7', 'Berbas Pantai', 'Bontang Selatan'),
    ('16b4d8f6-3459-452f-a5f5-7609df8ac23f', 'Berbas Tengah', 'Bontang Selatan'),
    ('60c5ba95-5848-4abd-b857-e93f1e77c335', 'Bontang Lestari', 'Bontang Selatan'),
    ('309570f4-3705-4135-b72e-ac1090f771e7', 'Satimpo', 'Bontang Selatan'),
    ('c4d7ab4d-ac84-4d08-b95c-1c91614f4135', 'Tanjung Laut', 'Bontang Selatan'),
    ('4711a40b-dd50-4773-b4ac-30ec3c1a37ed', 'Tanjung Laut Indah', 'Bontang Selatan'),
    ('51638090-e376-4085-825c-7e04534cacd9', 'Belimbing', 'Bontang Barat'),
    ('cc6e61bc-7c89-4588-95b7-bedcac1a3d50', 'Gunung Telihan', 'Bontang Barat'),
    ('f1e65f9f-9532-48cd-83dd-08f027729a7a', 'Kanaan', 'Bontang Barat');

-- AlterTable: ScreeningRecord — buang kolom yang pindah ke tabel anak,
-- tambah relasi Kelurahan (menggantikan kolom teks bebas)
DROP INDEX IF EXISTS "ScreeningRecord_kelurahan_idx";
DROP INDEX IF EXISTS "ScreeningRecord_riskTier_idx";

ALTER TABLE "ScreeningRecord"
    DROP COLUMN "kelurahan",
    DROP COLUMN "zScore",
    DROP COLUMN "zScoreWAZ",
    DROP COLUMN "zScoreWHZ",
    DROP COLUMN "statusGiziTBU",
    DROP COLUMN "statusGiziBBU",
    DROP COLUMN "statusGiziBBTB",
    DROP COLUMN "bblrOption",
    DROP COLUMN "exclusiveAsi",
    DROP COLUMN "mpasiAge",
    DROP COLUMN "animalProtein",
    DROP COLUMN "cleanWaterAccess",
    DROP COLUMN "sanitationAccess",
    DROP COLUMN "smokeExposure",
    DROP COLUMN "motherEducation",
    DROP COLUMN "economicQuintile",
    DROP COLUMN "diarrheaHistory",
    DROP COLUMN "posyanduKia",
    DROP COLUMN "riskTier",
    DROP COLUMN "riskScore",
    DROP COLUMN "dominantFactors",
    DROP COLUMN "rawMetadata",
    ADD COLUMN "kelurahanId" TEXT,
    ADD COLUMN "externalLocationLabel" TEXT,
    ADD CONSTRAINT "ScreeningRecord_persona_check"
        CHECK ("persona" IN (
            'Orang Tua / Anggota Keluarga Balita',
            'Kader Posyandu',
            'Tenaga Kesehatan / Bidan',
            'Surveyor / Peneliti Lapangan'
        )),
    ADD CONSTRAINT "ScreeningRecord_gender_check"
        CHECK ("gender" IN ('Laki-Laki', 'Perempuan'));

CREATE INDEX "ScreeningRecord_kelurahanId_idx" ON "ScreeningRecord"("kelurahanId");

ALTER TABLE "ScreeningRecord"
    ADD CONSTRAINT "ScreeningRecord_kelurahanId_fkey"
        FOREIGN KEY ("kelurahanId") REFERENCES "Kelurahan"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT "ScreeningRecord_sourceBatchId_fkey"
        FOREIGN KEY ("sourceBatchId") REFERENCES "IngestionBatchLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: GrowthAssessment (1:1 — hasil hitung WHO, terpisah dari input mentah)
CREATE TABLE "GrowthAssessment" (
    "screeningRecordId" TEXT NOT NULL,
    "zScore" DOUBLE PRECISION NOT NULL,
    "zScoreWAZ" DOUBLE PRECISION,
    "zScoreWHZ" DOUBLE PRECISION,
    "statusGiziTBU" TEXT,
    "statusGiziBBU" TEXT,
    "statusGiziBBTB" TEXT,

    CONSTRAINT "GrowthAssessment_pkey" PRIMARY KEY ("screeningRecordId"),
    CONSTRAINT "GrowthAssessment_screeningRecordId_fkey"
        FOREIGN KEY ("screeningRecordId") REFERENCES "ScreeningRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: ScreeningDeterminants (1:1 — jawaban kuesioner mentah)
CREATE TABLE "ScreeningDeterminants" (
    "screeningRecordId" TEXT NOT NULL,
    "bblrOption" INTEGER NOT NULL,
    "exclusiveAsi" INTEGER NOT NULL,
    "mpasiAge" INTEGER NOT NULL,
    "animalProtein" INTEGER[],
    "cleanWaterAccess" INTEGER NOT NULL,
    "sanitationAccess" INTEGER NOT NULL,
    "smokeExposure" INTEGER NOT NULL,
    "motherEducation" INTEGER NOT NULL,
    "economicQuintile" INTEGER NOT NULL,
    "diarrheaHistory" INTEGER NOT NULL,
    "posyanduKia" INTEGER NOT NULL,

    CONSTRAINT "ScreeningDeterminants_pkey" PRIMARY KEY ("screeningRecordId"),
    CONSTRAINT "ScreeningDeterminants_screeningRecordId_fkey"
        FOREIGN KEY ("screeningRecordId") REFERENCES "ScreeningRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: RiskAssessment (1:1 — output mesin skor risiko)
CREATE TABLE "RiskAssessment" (
    "screeningRecordId" TEXT NOT NULL,
    "riskTier" TEXT NOT NULL,
    "riskScore" DOUBLE PRECISION NOT NULL,
    "dominantFactors" TEXT[],
    "rawMetadata" JSONB,
    "engineVersion" TEXT NOT NULL DEFAULT 'weighted-v1',

    CONSTRAINT "RiskAssessment_pkey" PRIMARY KEY ("screeningRecordId"),
    CONSTRAINT "RiskAssessment_screeningRecordId_fkey"
        FOREIGN KEY ("screeningRecordId") REFERENCES "ScreeningRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "RiskAssessment_riskTier_idx" ON "RiskAssessment"("riskTier");

-- CreateView: screening_record_flat — merekonstruksi bentuk datar yang
-- dikonsumsi frontend (frontend/src/types/screening.ts ScreeningRecord),
-- supaya kontrak API tidak berubah walau tabel fisiknya sudah dipecah.
CREATE VIEW "screening_record_flat" AS
SELECT
    sr."id",
    sr."shareHash",
    sr."sessionId",
    sr."sourceType",
    sr."sourceBatchId",
    sr."persona",
    COALESCE(k."name", sr."externalLocationLabel") AS "kelurahan",
    sr."isOutsideBontang",
    sr."ageMonths",
    sr."gender",
    sr."weightKg",
    sr."heightCm",
    ga."zScore",
    ga."zScoreWAZ",
    ga."zScoreWHZ",
    ga."statusGiziTBU",
    ga."statusGiziBBU",
    ga."statusGiziBBTB",
    d."bblrOption",
    d."exclusiveAsi",
    d."mpasiAge",
    d."animalProtein",
    d."cleanWaterAccess",
    d."sanitationAccess",
    d."smokeExposure",
    d."motherEducation",
    d."economicQuintile",
    d."diarrheaHistory",
    d."posyanduKia",
    ra."riskTier",
    ra."riskScore",
    ra."dominantFactors",
    ra."rawMetadata",
    ra."engineVersion",
    sr."createdAt"
FROM "ScreeningRecord" sr
LEFT JOIN "Kelurahan" k ON k."id" = sr."kelurahanId"
JOIN "GrowthAssessment" ga ON ga."screeningRecordId" = sr."id"
JOIN "ScreeningDeterminants" d ON d."screeningRecordId" = sr."id"
JOIN "RiskAssessment" ra ON ra."screeningRecordId" = sr."id";
