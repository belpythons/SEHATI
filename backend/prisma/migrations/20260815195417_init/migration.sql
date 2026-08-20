-- CreateEnum
CREATE TYPE "DataSourceType" AS ENUM ('PWA_DIRECT_USER', 'RISKESDAS_KEMENKES', 'SURVEY_CSV_UPLOAD', 'EXTERNAL_HEALTH_API');

-- CreateTable
CREATE TABLE "AnonymousSession" (
    "id" TEXT NOT NULL,
    "clientToken" TEXT NOT NULL,
    "persona" TEXT NOT NULL DEFAULT 'ORANG_TUA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnonymousSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScreeningRecord" (
    "id" TEXT NOT NULL,
    "shareHash" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "sourceType" "DataSourceType" NOT NULL DEFAULT 'PWA_DIRECT_USER',
    "sourceBatchId" TEXT,
    "persona" TEXT NOT NULL,
    "kelurahan" TEXT NOT NULL,
    "ageMonths" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "heightCm" DOUBLE PRECISION NOT NULL,
    "zScore" DOUBLE PRECISION NOT NULL,
    "zScoreWAZ" DOUBLE PRECISION,
    "zScoreWHZ" DOUBLE PRECISION,
    "statusGiziTBU" TEXT,
    "statusGiziBBU" TEXT,
    "statusGiziBBTB" TEXT,
    "exclusiveAsi" BOOLEAN NOT NULL,
    "sanitationAccess" BOOLEAN NOT NULL,
    "cleanWaterAccess" BOOLEAN NOT NULL,
    "smokeExposure" BOOLEAN NOT NULL,
    "economicQuintile" INTEGER NOT NULL,
    "diarrheaHistory" BOOLEAN NOT NULL,
    "riskTier" TEXT NOT NULL,
    "riskScore" DOUBLE PRECISION NOT NULL,
    "dominantFactors" TEXT[],
    "rawMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScreeningRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthKnowledgeBase" (
    "id" TEXT NOT NULL,
    "topicTitle" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "targetAgeGroupMinMonths" INTEGER NOT NULL DEFAULT 0,
    "targetAgeGroupMaxMonths" INTEGER NOT NULL DEFAULT 59,
    "targetRiskTier" TEXT NOT NULL,
    "tags" TEXT[],
    "guidelineContent" TEXT NOT NULL,
    "actionableSteps" TEXT[],
    "sourceReference" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HealthKnowledgeBase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngestionBatchLog" (
    "id" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceType" "DataSourceType" NOT NULL,
    "totalRecords" INTEGER NOT NULL,
    "successCount" INTEGER NOT NULL,
    "failedCount" INTEGER NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IngestionBatchLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnonymousSession_clientToken_key" ON "AnonymousSession"("clientToken");

-- CreateIndex
CREATE INDEX "AnonymousSession_clientToken_idx" ON "AnonymousSession"("clientToken");

-- CreateIndex
CREATE UNIQUE INDEX "ScreeningRecord_shareHash_key" ON "ScreeningRecord"("shareHash");

-- CreateIndex
CREATE INDEX "ScreeningRecord_sessionId_idx" ON "ScreeningRecord"("sessionId");

-- CreateIndex
CREATE INDEX "ScreeningRecord_shareHash_idx" ON "ScreeningRecord"("shareHash");

-- CreateIndex
CREATE INDEX "ScreeningRecord_kelurahan_idx" ON "ScreeningRecord"("kelurahan");

-- CreateIndex
CREATE INDEX "ScreeningRecord_riskTier_idx" ON "ScreeningRecord"("riskTier");

-- CreateIndex
CREATE INDEX "HealthKnowledgeBase_category_idx" ON "HealthKnowledgeBase"("category");

-- CreateIndex
CREATE INDEX "HealthKnowledgeBase_targetRiskTier_idx" ON "HealthKnowledgeBase"("targetRiskTier");

-- AddForeignKey
ALTER TABLE "ScreeningRecord" ADD CONSTRAINT "ScreeningRecord_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AnonymousSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
