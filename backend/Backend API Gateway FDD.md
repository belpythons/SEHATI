# **FUNCTIONAL DESIGN DOCUMENT (FDD)**

## **Modul 2: Backend API Gateway & Orchestration (SEHATI)**

| Key Meta | Detail Specification |
| :---- | :---- |
| **System Name** | SEHATI (Sistem Edukasi Holistik dan Deteksi Stunting Terintegrasi) |
| **Sub-System** | Backend Gateway Layer |
| **Document Version** | 1.0.0-PROD |
| **Target Framework** | Node.js, Express.js, Prisma ORM, Supabase PostgreSQL, Google Gen AI SDK |
| **Status** | Approved for Execution |

### **1\. Architectural Role & Responsibilities**

Backend API Gateway berperan sebagai orkestrator pusat data:

1. Mengelola sesi anonim berbasis UUID clientToken.  
2. Meneruskan data kuesioner ke FastAPI ML Microservice untuk inferensi Z-score WHO dan Naïve Bayes.  
3. Menyimpan dan mengambil catatan hasil skrining (ScreeningRecord) di Supabase via Prisma ORM.  
4. Menyediakan endpoint SSE (*Server-Sent Events*) streaming untuk Chatbot AI yang mengambil data relasional langsung dari database (*Direct-DB Fetch*).  
5. Menyediakan API Ingestion batch terproteksi API Key statis untuk impor data survei Riskesdas/CSV.  
6. Menyediakan endpoint *Health Check* ringan yang dipicu GitHub Actions untuk menjaga database Supabase tetap aktif.

### **2\. Database Schema Definition (Prisma ORM)**

datasource db {  
  provider \= "postgresql"  
  url      \= env("DATABASE\_URL")  
}

generator client {  
  provider \= "prisma-client-js"  
}

enum DataSourceType {  
  PWA\_DIRECT\_USER  
  RISKESDAS\_KEMENKES  
  SURVEY\_CSV\_UPLOAD  
  EXTERNAL\_HEALTH\_API  
}

model AnonymousSession {  
  id               String            @id @default(uuid())  
  clientToken      String            @unique  
  persona          String            @default("ORANG\_TUA")  
  createdAt        DateTime          @default(now())  
  updatedAt        DateTime          @updatedAt  
  screenings       ScreeningRecord\[\]

  @@index(\[clientToken\])  
}

model ScreeningRecord {  
  id               String            @id @default(uuid())  
  shareHash        String            @unique @default(nanoid(10))  
  sessionId        String  
  session          AnonymousSession  @relation(fields: \[sessionId\], references: \[id\], onDelete: Cascade)  
  sourceType       DataSourceType    @default(PWA\_DIRECT\_USER)  
  sourceBatchId    String?  
  persona          String  
  kelurahan        String  
  ageMonths        Int  
  gender           String  
  weightKg         Float  
  heightCm         Float  
  zScore           Float             // Z-Score TB/U  
  zScoreWAZ        Float?            // Z-Score BB/U  
  zScoreWHZ        Float?            // Z-Score BB/TB  
  statusGiziTBU    String?           // Severely Stunted, Stunted, Normal, Tinggi  
  statusGiziBBU    String?           // Severely Underweight, Underweight, Normal, BB Lebih  
  statusGiziBBTB   String?           // Severely Wasted, Wasted, Normal, Risk Overweight, Overweight  
  exclusiveAsi     Boolean  
  sanitationAccess Boolean  
  cleanWaterAccess Boolean  
  smokeExposure    Boolean  
  economicQuintile Int  
  diarrheaHistory  Boolean  
  riskTier         String            // LOW, MODERATE, HIGH  
  riskScore        Float             // 0.0 \- 1.0  
  dominantFactors  String\[\]  
  rawMetadata      Json?  
  createdAt        DateTime          @default(now())

  @@index(\[sessionId\])  
  @@index(\[shareHash\])  
  @@index(\[kelurahan\])  
  @@index(\[riskTier\])  
}

model HealthKnowledgeBase {  
  id                    String    @id @default(uuid())  
  topicTitle            String  
  category              String  
  targetAgeGroupMinMonths Int     @default(0)  
  targetAgeGroupMaxMonths Int     @default(59)  
  targetRiskTier        String  
  tags                  String\[\]  
  guidelineContent      String    @db.Text  
  actionableSteps       String\[\]  
  sourceReference       String  
  createdAt             DateTime  @default(now())

  @@index(\[category\])  
  @@index(\[targetRiskTier\])  
}

model IngestionBatchLog {  
  id           String         @id @default(uuid())  
  sourceName   String  
  sourceType   DataSourceType  
  totalRecords Int  
  successCount Int  
  failedCount  Int  
  importedAt   DateTime       @default(now())  
}

### **3\. API Endpoint Specifications**

#### **3.1 Post Screening & Compute (POST /api/v1/screening/submit)**

* **Headers:** Content-Type: application/json  
* **Request Body:**

{  
  "clientToken": "uuid-string",  
  "persona": "ORANG\_TUA",  
  "kelurahan": "Loktuan",  
  "ageMonths": 18,  
  "gender": "L",  
  "weightKg": 8.5,  
  "heightCm": 74.5,  
  "exclusiveAsi": true,  
  "sanitationAccess": false,  
  "cleanWaterAccess": true,  
  "smokeExposure": true,  
  "economicQuintile": 2,  
  "diarrheaHistory": false  
}

* **Process Flow:**  
  1. Express menerima request dan memvalidasi payload dengan schema Zod.  
  2. Mencari atau membuat AnonymousSession berdasarkan clientToken.  
  3. Memanggil HTTP POST ml-service:8000/api/v1/predict untuk mendapatkan kalkulasi Z-Scores (TB/U, BB/U, BB/TB) dan inferensi Naïve Bayes.  
  4. Menyimpan record lengkap ke tabel ScreeningRecord Prisma.  
  5. Mengembalikan data analitik lengkap beserta shareHash.

#### **3.2 Direct DB Fetch SSE Chat Stream (GET /api/v1/chat/stream)**

* **Query Params:** sessionId={UUID}\&query={text}  
* **Headers Respon:** Content-Type: text/event-stream, Cache-Control: no-cache  
* **Process Flow:**  
  1. Express membaca data hasil skrining balita dari ScreeningRecord berdasarkan sessionId.  
  2. Express membaca aturan panduan terkait dari HealthKnowledgeBase yang sesuai dengan riskTier dan kelompok umur balita.  
  3. Menginject seluruh data kontekstual tersebut ke dalam System Instruction Gemini (gemini-2.5-flash).  
  4. Mengalirkan (*stream*) token teks balasan kata per kata ke frontend via SSE.

#### **3.3 Batch Ingestion Upload (POST /api/v1/ingest/upload/:sourceType)**

* **Headers:** X-API-KEY: {SECRET\_GATEWAY\_KEY}, Content-Type: multipart/form-data  
* **Params:** sourceType (riskesdas | csv-survey)  
* **Process Flow:** Menggunakan Adapter Pattern (IDataTransformer) untuk mentransformasi skema acak ke dalam skema standar ScreeningRecord dan menyimpan log di IngestionBatchLog.

#### **3.4 Keep-Alive Ping (GET /api/v1/health)**

* **Respon:** { "status": "ok", "timestamp": "2026-08-15T21:21:30Z", "db": "connected" }  
* **Fungsi:** Dipanggil oleh GitHub Actions setiap 24 jam untuk melakukan SELECT 1 ke Supabase PostgreSQL.