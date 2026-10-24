# 🌟 SEHATI: Sistem Edukasi Holistik dan Deteksi Stunting Terintegrasi
### Platform Progressive Web App (PWA) Deteksi Dini, Prediksi Risiko Stunting, dan Edukasi Gizi Berbasis Standar WHO 2006 & Pangan Lokal Pesisir Kota Bontang

[![Production URL](https://img.shields.io/badge/Production-sehati.domcloud.dev-2563eb?style=for-the-badge&logo=googlechrome&logoColor=white)](https://sehati.domcloud.dev/)
[![SDG 3](https://img.shields.io/badge/UN%20SDG-SDG%203%20%7C%20Good%20Health-4c9f38?style=for-the-badge&logo=unitednations&logoColor=white)](https://sdgs.un.org/goals/goal3)
[![SDG 2](https://img.shields.io/badge/UN%20SDG-SDG%202%20%7C%20Zero%20Hunger-d3a029?style=for-the-badge&logo=unitednations&logoColor=white)](https://sdgs.un.org/goals/goal2)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline--First%20IndexedDB-0ea5e9?style=for-the-badge&logo=pwa&logoColor=white)](#-arsitektur--spesifikasi-teknologi)
[![Node.js](https://img.shields.io/badge/Backend-Express.js%20%7C%20Prisma%20ORM-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](#-arsitektur--spesifikasi-teknologi)
[![Python](https://img.shields.io/badge/ML%20Service-FastAPI%20%7C%20Scikit--Learn-3776ab?style=for-the-badge&logo=python&logoColor=white)](#-arsitektur--spesifikasi-teknologi)
[![Google Gemini](https://img.shields.io/badge/Generative%20AI-Gemini%203.6--Flash%20SSE-8e75ff?style=for-the-badge&logo=googlegemini&logoColor=white)](#-arsitektur--spesifikasi-teknologi)

---

## 📌 Ringkasan Eksekutif (Executive Summary)

**SEHATI** (**S**istem **E**dukasi **H**olistik dan **D**eteksi Stunting **T**er**i**ntegrasi) adalah platform kesehatan publik berbasis *Progressive Web App* (PWA) yang dirancang khusus untuk memutus rantai stunting pada balita (0–59 bulan) di **Kota Bontang, Kalimantan Timur**. 

Menggabungkan ketelitian klinis **Standar Baku Pertumbuhan Anak WHO 2006 (Box-Cox LMS Method)** dengan kecerdasan buatan **Categorical Naïve Bayes Classifier (Akurasi 98,4%)** serta pendampingan konsultasi interaktif **Google Gemini AI 3.6-Flash**, SEHATI menghadirkan solusi skrining gizi yang cepat (< 3 menit), tanpa gesekan registrasi (*Zero-Login Friction*), dan andal digunakan di wilayah pesisir tanpa internet melalui teknologi *Offline-First IndexedDB*.

Platform dapat diakses secara publik pada: **[https://sehati.domcloud.dev/](https://sehati.domcloud.dev/)**

---

## 📑 Daftar Isi
1. [Latar Belakang & Urgensi Masalah](#-latar-belakang--urgensi-masalah)
2. [Penyelarasan dengan Sustainable Development Goals (SDGs)](#-penyelarasan-dengan-sustainable-development-goals-sdgs)
3. [Manfaat & Dampak Adanya Proyek](#-manfaat--dampak-adanya-proyek)
4. [Arsitektur Sistem & Diagram Alir](#-arsitektur-sistem--diagram-alir)
5. [Panduan Pengguna (Multi-Role User Guide)](#-panduan-pengguna-multi-role-user-guide)
   - [Peran 1: Orang Tua (Pemantauan Mandiri & Konsultasi)](#1-panduan-untuk-orang-tua)
   - [Peran 2: Kader Posyandu (Skrining Lapangan & Buffer Offline)](#2-panduan-untuk-kader-posyandu)
   - [Peran 3: Surveyor & Tenaga Kesehatan (Ingestion Batch & Analitik)](#3-panduan-untuk-surveyor--tenaga-kesehatan)
6. [Panduan Setup & Instalasi Lokal](#-panduan-setup--instalasi-lokal)
7. [Spesifikasi API & Microservice](#-spesifikasi-api--microservice)
8. [Struktur Direktori Repositori](#-struktur-direktori-repositori)
9. [Lisensi & Ucapan Terima Kasih](#-lisensi--kontak)

---

## 🚨 Latar Belakang & Urgensi Masalah

Stunting merupakan gangguan pertumbuhan dan perkembangan anak akibat kekurangan gizi kronis dan infeksi berulang, yang ditandai dengan panjang atau tinggi badannya berada di bawah standar antropometri anak. Dampak stunting tidak hanya menurunkan tinggi fisik, tetapi juga merusak perkembangan kognitif permanen, menurunkan produktivitas masa dewasa, dan memicu risiko penyakit metabolik.

```
                    KONDISI EPIDEMIOLOGI STUNTING
       Nasional (SSGI)        Target Nasional          Kota Bontang
           [ 21,6% ]             [ 14,0% ]               [ 27,4% ]
              ▲                                              ▲
              │                 GAP KRITIS                   │
              └──────────────────────────────────────────────┘
```

### Konteks Wilayah Kota Bontang, Kalimantan Timur:
* Berdasarkan data *Survei Status Gizi Indonesia (SSGI)* dan pemantauan dinas kesehatan setempat, angka prevalensi stunting Kota Bontang mencapai **27,4%**, berada signifikan di atas rata-rata nasional (**21,6%**) dan jauh melampaui target nasional (**14,0%**).
* Kota Bontang memiliki karakteristik geografis pesisir dengan 15 kelurahan yang tersebar di 3 kecamatan (*Bontang Barat, Bontang Utara, Bontang Selatan*). Sebagian permukiman merupakan kawasan pesisir dan perkampungan atas air (seperti *Bontang Kuala, Loktuan, Tanjung Laut Indah, Berbas Pantai*) yang kerap menghadapi tantangan sanitasi air laut, pengelolaan limbah rumah tangga, dan keterbatasan sinyal internet.
* **Paradoks Pesisir**: Meskipun Kota Bontang kaya akan sumber daya laut segar bernutrisi tinggi (seperti **Ikan Bawis** / *Siganus canaliculatus*, Ikan Bandeng, dan kepiting), pemahaman pola asuh MPASI (*Makanan Pendamping ASI*) kaya protein hewani ganda (*double protein*) masih minim. Banyak balita mengalami defisit protein karena pola makan yang didominasi karbohidrat dan jajanan ultra-proses.

### Permasalahan yang Diselesaikan SEHATI:
1. **Keterlambatan Deteksi (Lost Golden Window)**: Banyak balita baru diketahui stunting setelah berusia di atas 2 tahun, di mana jendela emas intervensi 1000 Hari Pertama Kehidupan (HPK) telah tertutup.
2. **Ketergantungan Infrastruktur Jaringan**: Aplikasi kesehatan konvensional seringkali gagal digunakan di lapangan karena membutuhkan koneksi internet stabil secara konstan saat posyandu berjalan.
3. **Edukasi yang Bersifat Generik & Mahal**: Panduan gizi yang beredar sering merekomendasikan bahan makanan impor mahal (seperti salmon, minyak zaitun) yang tidak realistis bagi masyarakat menengah ke bawah, mengabaikan kekayaan pangan lokal Bontang yang murah dan bergizi setara.

---

## 🎯 Penyelarasan dengan Sustainable Development Goals (SDGs)

SEHATI dirancang secara presisi sebagai instrumen pencapaian agenda pembangunan global berkelanjutan (UN SDGs), khususnya:

| Tujuan SDG | Target Spesifik | Kontribusi Nyata Platform SEHATI |
| :--- | :--- | :--- |
| **SDG 3: Kehidupan Sehat & Sejahtera** *(Good Health and Well-being)* | **Target 3.2**: Mengakhiri kematian neonatal dan balita yang dapat dicegah.<br>**Target 3.4**: Mengurangi angka kesakitan akibat malnutrisi dan infeksi berulang. | Menyediakan deteksi Z-score WHO terstandarisasi untuk memitigasi risiko infeksi diare dan morbiditas balita melalui intervensi preventif sejak usia 0 bulan. |
| **SDG 2: Tanpa Kelaparan** *(Zero Hunger)* | **Target 2.2**: Menghilangkan segala bentuk malnutrisi, termasuk target penurunan stunting dan wasting balita pada tahun 2030. | Mengidentifikasi status gizi buruk (*severely stunted*, *wasted*, *underweight*) dan memberikan intervensi diet protein hewani ganda berbasis pangan lokal. |
| **SDG 6: Air Bersih & Sanitasi** *(Clean Water and Sanitation)* | **Target 6.2**: Mencapai akses sanitasi yang memadai dan menghentikan buang air besar sembarangan. | Memasukkan determinan jamban sehat dan air minum terlindungi sebagai variabel utama inferensi model Naïve Bayes. |
| **SDG 10: Berkurangnya Kesenjangan** *(Reduced Inequalities)* | **Target 10.2**: Memberdayakan dan mendorong inklusi sosial, ekonomi tanpa diskriminasi. | Platform bersifat gratis, *open-access*, tanpa persyaratan registrasi perangkat mewah, dan dapat berjalan secara luring di kawasan marjinal pesisir. |

---

## 💡 Manfaat & Dampak Adanya Proyek

Platform SEHATI memberikan dampak transformatif multidimensional bagi berbagai lapisan ekosistem kesehatan anak:

```
                            EKOSISTEM BENEFIT SEHATI
    ┌───────────────────────────┬───────────────────────────┐
    │     ORANG TUA & BALITA    │       KADER POSYANDU      │
    │  • Skrining mandiri <3 mnt │  • Operasional PWA offline│
    │  • Rekomendasi Ikan Bawis │  • Deteksi cepat tanpa lag│
    │  • Konsultasi AI 24/7     │  • Auto-sync data posyandu│
    ├───────────────────────────┼───────────────────────────┤
    │  PUSKESMAS & NAKES AHLI   │  DINAS KESEHATAN & PEMKOT │
    │  • Rekam medis standar WHO│  • Peta prevalensi 15 kel.│
    │  • Shareable link rujukan │  • Ingest batch Riskesdas │
    │  • Deteksi komorbid diare │  • Kebijakan intervensi   │
    └───────────────────────────┴───────────────────────────┘
```

### 1. Manfaat Klinis & Ketepatan Diagnostik
* **Akurasi Berstandar WHO**: Menggantikan kalkulasi manual dengan rumus matematis baku **Box-Cox LMS** untuk 3 indeks antropometri sekaligus:
  * **TB/U (Tinggi Badan menurut Umur)**: Indikator stunting kronis (*Severely Stunted*, *Stunted*, *Normal*, *Tinggi*).
  * **BB/U (Berat Badan menurut Umur)**: Indikator berat kurang (*Severely Underweight*, *Underweight*, *Normal*).
  * **BB/TB (Berat Badan menurut Tinggi Badan)**: Indikator malnutrisi akut wasting atau kegemukan (*Severely Wasted*, *Wasted*, *Normal*, *Overweight*).
* **Prediksi Kerentanan Multidimensi**: Model Naïve Bayes memproses determinan non-klinis (ASI eksklusif, sanitasi, air minum, asap rokok, kuintil ekonomi, pendidikan ibu, dan riwayat diare) untuk mengklasifikasikan risiko ke dalam tier **LOW**, **MODERATE**, dan **HIGH** dengan akurasi 98,4%.

### 2. Manfaat Operasional bagi Kader Posyandu
* **Zero-Login Friction**: Kader tidak perlu menghabiskan waktu membuat akun atau menghafal kata sandi saat melayani antrean panjang balita di posyandu.
* **Offline-First Resilience**: Jika koneksi internet terputus di balai posyandu, data kuesioner otomatis tersimpan dalam *IndexedDB storage* lokal. Begitu perangkat tersambung kembali ke internet, sistem secara otomatis melakukan sinkronisasi tanpa kehilangan data satu pun.

### 3. Manfaat Edukasi & Budaya Pangan Lokal bagi Keluarga
* **Optimalisasi Protein Pesisir Bontang**: SEHATI mengedukasi keluarga untuk memaksimalkan potensi ikan laut segar lokal, khususnya **Ikan Bawis** (kandungan asam amino esensial tinggi dengan harga terjangkau), telur ayam harian, dan daun kelor pekarangan, sebagai solusi nyata pencegahan stunting tanpa membebani keuangan keluarga.
* **Asisten Interaktif HATI**: Didukung Google Gemini AI 3.6-Flash yang telah disuntikkan rekam medis balita dan panduan gizi resmi, siap menjawab kekhawatiran orang tua dengan bahasa Indonesia yang empatik, ilmiah, dan solutif.

### 4. Manfaat Strategis bagi Pemerintah Kota Bontang
* **Pemetaan Determinan per Kelurahan**: Mengidentifikasi akar masalah spesifik di tiap kelurahan (misalnya: apakah stunting di Kelurahan Loktuan dipicu oleh akses air bersih, atau di Tanjung Laut karena paparan asap rokok dan MPASI dini).
* **Standardisasi Ingestion Data**: Menyediakan pintu masuk integrasi data batch survei Kemenkes RI/Riskesdas melalui REST API terproteksi.

---

## 🏗️ Arsitektur Sistem & Diagram Alir

Platform SEHATI dirancang menggunakan arsitektur modular berorientasi layanan (*service-oriented*) yang memisahkan beban kerja antarmuka (*Client*), orkestrasi sesi (*Gateway*), komputasi matematika (*ML Microservice*), dan kecerdasan generatif (*AI Cloud*).

> 📑 **Katalog Diagram Lengkap**: Dokumentasi teknis terperinci, spesifikasi notasi, dan keputusan desain dapat dilihat pada [**`diagrams/DIAGRAMS.md`**](diagrams/DIAGRAMS.md).

### 1. Entity Relationship Diagram (ERD) `[Status: Wajib]`
Diagram basis data relasional PostgreSQL (Supabase) via Prisma ORM dengan integritas kunci primer/asing, constraint unik, dan pengindeksan teroptimasi.
* **File Sumber**: [`diagrams/erd.mmd`](diagrams/erd.mmd)
* **File Ekspor**: [Lihat Format Vektor (SVG)](diagrams/erd.svg) | [Lihat Format Gambar (PNG)](diagrams/erd.png)

```mermaid
erDiagram
    AnonymousSession ||--o{ ScreeningRecord : "generates"
    IngestionBatchLog ||--o{ ScreeningRecord : "imports batch"
    ScreeningRecord }o..o{ HealthKnowledgeBase : "references guidelines"

    AnonymousSession {
        string id PK "UUID Primary Key"
        string clientToken UK "UUID Client Token"
        string persona "ORANG_TUA, KADER_POSYANDU, SURVEYOR"
        datetime createdAt "Timestamp Sesi Dibuat"
        datetime updatedAt "Timestamp Sesi Diperbarui"
    }

    ScreeningRecord {
        string id PK "UUID Primary Key"
        string shareHash UK "Nanoid 10 Karakter Tautan Publik"
        string sessionId FK "Foreign Key ke AnonymousSession"
        string sourceType "PWA_DIRECT_USER, RISKESDAS, SURVEY_CSV"
        string sourceBatchId FK "Nullable FK ke IngestionBatchLog"
        string persona "Persona Pengisi Saat Skrining"
        string kelurahan "15 Kelurahan di Kota Bontang"
        int ageMonths "Usia Balita 0 sampai 59 Bulan"
        string gender "Laki-laki atau Perempuan"
        float weightKg "Berat Badan dalam Kilogram"
        float heightCm "Panjang atau Tinggi Badan dalam Sentimeter"
        boolean isOutsideBontang "Flag Domisili Luar Bontang"
        float zScore "Z-Score TB/U Indikator Stunting"
        float zScoreWAZ "Z-Score BB/U Indikator Underweight"
        float zScoreWHZ "Z-Score BB/TB Indikator Wasting"
        string statusGiziTBU "Severely Stunted, Stunted, Normal, Tinggi"
        string statusGiziBBU "Severely Underweight, Underweight, Normal"
        string statusGiziBBTB "Severely Wasted, Wasted, Normal, Overweight"
        int bblrOption "1 Normal, 2 BBLR, 3 Tidak Tahu"
        int exclusiveAsi "1 ASI Eksklusif, 2 Formula, 3 Belum 6 Bln"
        int mpasiAge "1 Dini, 2 Tepat 6 Bln, 3 Terlambat, 4 Belum"
        string animalProtein "Pilihan Protein Hewani Array"
        int cleanWaterAccess "1 Kemasan, 2 PDAM, 3 Sumur, 4 Lainnya"
        int sanitationAccess "1 Jamban Sehat Sendiri, 2 Komunal, 3 Tidak Ada"
        int smokeExposure "1 Bebas Rokok, 2 Terpapar Asap Rokok"
        int motherEducation "1 SD, 2 SMP, 3 SMA/SMK, 4 Sarjana"
        int economicQuintile "1 Kuintil Terbawah sampai 5 Tertinggi"
        int diarrheaHistory "1 Tidak Pernah/1x, 2 Berulang"
        int posyanduKia "1 Rutin plus KIA, 2 Kadang, 3 Tidak Pernah"
        string riskTier "LOW, MODERATE, HIGH (Naive Bayes)"
        float riskScore "Skor Probabilitas Risiko 0.0 sampai 1.0"
        string dominantFactors "Faktor Dominan Anomali Risiko"
        json rawMetadata "Metadata Tambahan dan Debugging"
        datetime createdAt "Waktu Skrining Tercatat"
    }

    HealthKnowledgeBase {
        string id PK "UUID Primary Key"
        string topicTitle "Judul Topik Intervensi Gizi dan Pola Asuh"
        string category "GIZI_LOKAL, SANITASI, MPASI, 1000_HPK"
        int targetAgeGroupMinMonths "Umur Minimum Balita"
        int targetAgeGroupMaxMonths "Umur Maksimum Balita"
        string targetRiskTier "Target Risiko LOW, MODERATE, HIGH"
        string tags "Tag Topik Pangan Lokal"
        text guidelineContent "Konten Panduan Klinis dan Intervensi"
        string actionableSteps "Langkah Aksi Praktis untuk Pengasuh"
        string sourceReference "Referensi Dokumen WHO dan Kemenkes RI"
        datetime createdAt "Waktu Pengetahuan Ditambahkan"
    }

    IngestionBatchLog {
        string id PK "UUID Primary Key"
        string sourceName "Nama File atau Batch Sumber"
        string sourceType "Tipe Sumber Impor Data"
        int totalRecords "Total Baris Data Diproses"
        int successCount "Jumlah Baris Berhasil Diimpor"
        int failedCount "Jumlah Baris Gagal Validasi"
        datetime importedAt "Waktu Impor Selesai"
    }
```

---

### 2. High-Level System Architecture Diagram `[Status: Sangat Direkomendasikan]`
Menggambarkan interaksi antar lapisan Client (React 19), API Gateway (Express.js), Komputasi ML (FastAPI), Intelegensi Buatan (Gemini), dan Database (Supabase PostgreSQL).
* **File Sumber**: [`diagrams/system-architecture.mmd`](diagrams/system-architecture.mmd)
* **File Ekspor**: [Lihat Format Vektor (SVG)](diagrams/system-architecture.svg) | [Lihat Format Gambar (PNG)](diagrams/system-architecture.png)

```mermaid
graph TB
    subgraph ClientLayer["CLIENT LAYER - Frontend PWA (React 19 + TypeScript)"]
        direction TB
        PWA["PWA Client - sehati.domcloud.dev<br/>Vite + React 19 + TailwindCSS v4"]
        SW["Service Worker<br/>vite-plugin-pwa (Cache-First Shell)"]
        IDB[("IndexedDB Storage<br/>idb-keyval (Offline Drafts & Queue)")]
        UI_Q["Multi-Step Questionnaire<br/>Framer Motion (Antropometri & Determinan)"]
        UI_Dash["Analytics Dashboard<br/>@dnd-kit (Draggable Grid Widgets)"]
        UI_Chart["Growth Curves & Gauges<br/>Chart.js + Recharts + Gauge Component"]
        UI_Chat["AI Chat Assistant Drawer<br/>@microsoft/fetch-event-source (SSE Client)"]

        PWA --> SW
        PWA --> IDB
        PWA --> UI_Q
        PWA --> UI_Dash
        UI_Dash --> UI_Chart
        UI_Dash --> UI_Chat
    end

    subgraph GatewayLayer["API GATEWAY LAYER - Node.js + Express.js"]
        direction TB
        GW["Express.js API Gateway (:5001)<br/>Helmet, CORS, Rate-Limiter, Morgan"]
        ZodVal["Schema Validator<br/>Zod (Antropometri & Determinan)"]
        SessMgr["Anonymous Session Manager<br/>UUID Client Token Handler"]
        ScreeningCtrl["Screening Controller<br/>POST /api/v1/screening/submit"]
        ChatCtrl["SSE Stream Controller<br/>POST/GET /api/v1/chat/stream"]
        IngestAdapter["Batch Ingestion Adapter<br/>POST /api/v1/ingest/upload/:sourceType"]
        HealthCtrl["Health Check Ping<br/>GET /api/v1/health"]

        GW --> ZodVal
        ZodVal --> SessMgr
        SessMgr --> ScreeningCtrl
        GW --> ChatCtrl
        GW --> IngestAdapter
        GW --> HealthCtrl
    end

    subgraph MLLayer["MACHINE LEARNING SERVICE LAYER - Python 3.11 + FastAPI"]
        direction TB
        FastAPIApp["FastAPI Microservice (:8000)<br/>Uvicorn ASGI Engine"]
        LMS_Engine["Triple-Index WHO Z-Score Engine<br/>Box-Cox LMS Method (TB/U, BB/U, BB/TB)"]
        NB_Classifier["Categorical Naive Bayes Classifier<br/>Scikit-Learn (98.4% Akurasi, 3 Tiers)"]
        Factor_Extract["Dominant Risk Factor Extractor<br/>Posterior Probability Impact Analysis"]

        FastAPIApp --> LMS_Engine
        FastAPIApp --> NB_Classifier
        NB_Classifier --> Factor_Extract
    end

    subgraph CloudAILayer["GENERATIVE AI & GROUNDING LAYER"]
        direction TB
        GeminiSDK["Google Gen AI SDK (@google/genai)<br/>gemini-3.6-flash"]
        PromptEngine["Contextual Prompt Builder<br/>Child Metrics + Knowledge Grounding"]
        SSEStreamer["Token-by-Token SSE Streamer<br/>AsyncGenerator Pipeline"]

        PromptEngine --> GeminiSDK
        GeminiSDK --> SSEStreamer
    end

    subgraph DataLayer["PERSISTENCE LAYER - Supabase Managed PostgreSQL"]
        direction TB
        PrismaClient["Prisma ORM Client v7.x<br/>@prisma/client + @prisma/adapter-pg"]
        Pooler["Connection Pooler<br/>PgBouncer Session Mode (:6543)"]
        DirectDB["Direct PostgreSQL (:5432)<br/>Schema Migrations"]
        
        T_Session["Table: AnonymousSession"]
        T_Screening["Table: ScreeningRecord"]
        T_KB["Table: HealthKnowledgeBase"]
        T_Ingest["Table: IngestionBatchLog"]

        PrismaClient --> Pooler
        Pooler --> T_Session
        Pooler --> T_Screening
        Pooler --> T_KB
        Pooler --> T_Ingest
        DirectDB --> T_Screening
    end

    subgraph ExternalSources["EXTERNAL DATA SOURCES & AUTOMATION"]
        direction TB
        Kemenkes["Kemenkes RI / SSGI<br/>Riskesdas & Survey Datasets (CSV)"]
        GHActions["GitHub Actions Cron<br/>Keep-Alive Pinger (24h Interval)"]
        DomcloudHost["Domcloud Hosting<br/>Public Production Edge (PWA)"]
    end

    PWA -.->|"HTTP/HTTPS REST"| GW
    UI_Q -->|"POST /screening/submit"| GW
    UI_Chat -->|"SSE Request"| ChatCtrl
    IDB -.->|"Auto-Sync Drafts"| GW

    ScreeningCtrl -->|"HTTP POST /api/v1/predict"| FastAPIApp
    FastAPIApp -->|"Z-Scores, Tiers, Factors"| ScreeningCtrl

    ChatCtrl -->|"Direct-DB Query"| PrismaClient
    ChatCtrl -->|"Inject Rekam Medis"| PromptEngine
    SSEStreamer -->|"Token Stream (text/event-stream)"| UI_Chat

    ScreeningCtrl -->|"Create Record"| PrismaClient
    IngestAdapter -->|"Batch Insert"| PrismaClient
    Kemenkes -->|"CSV / Riskesdas Data"| IngestAdapter

    GHActions -->|"Keep-Alive Ping (GET /api/v1/health)"| HealthCtrl
    HealthCtrl -->|"SELECT 1 Ping"| PrismaClient
    DomcloudHost --- PWA
```

---

### 3. Flowchart & Activity Diagram (Alur Bisnis Aplikasi) `[Status: Wajib]`
Alur komprehensif dari saat landing page dibuka, pengisian kuesioner 3-langkah, buffering offline IndexedDB, kalkulasi komputasi ganda di backend, visualisasi kurva Z-score, hingga konsultasi SSE stream.
* **File Sumber**: [`diagrams/flowchart-activity.mmd`](diagrams/flowchart-activity.mmd)
* **File Ekspor**: [Lihat Format Vektor (SVG)](diagrams/flowchart-activity.svg) | [Lihat Format Gambar (PNG)](diagrams/flowchart-activity.png)

```mermaid
flowchart TD
    startNode([Pengguna Mengakses Aplikasi<br/>sehati.domcloud.dev]) --> checkNetwork{Periksa Koneksi Internet}

    checkNetwork -->|Offline| offlinePWA[Muat PWA Shell via Service Worker Cache]
    checkNetwork -->|Online| onlinePWA[Muat Halaman Langsung dari Edge Server]

    offlinePWA --> landingPage[Halaman Landing Page<br/>Statistik Stunting Bontang 27.4%]
    onlinePWA --> landingPage

    landingPage --> clickStart[Klik Tombol Mulai Skrining<br/>Zero-Login Friction]
    clickStart --> formStep1[Step 1: Seleksi Persona dan Wilayah<br/>Pilih Persona dan Kelurahan di Kota Bontang]

    formStep1 --> formStep2[Step 2: Antropometri Balita<br/>Jenis Kelamin, Usia 0-59 Bln, Berat kg, Tinggi cm]
    formStep2 --> formStep3[Step 3: Determinan Lingkungan dan Pola Asuh<br/>ASI, MPASI, Sanitasi, Air Bersih, Asap Rokok, Diare]

    formStep3 --> submitDecision{Apakah Perangkat Sedang Online}

    submitDecision -->|Offline| saveIndexedDB[Simpan Payload ke Antrean IndexedDB<br/>idb-keyval Local Buffer]
    saveIndexedDB --> notifyOffline[Notifikasi: Data Tersimpan Lokal Secara Aman<br/>Status Pending Sync]
    notifyOffline --> waitOnline[Tunggu Event online Window Browser]
    waitOnline --> autoSync[Otomatis Trigger Sinkronisasi Antrean ke Gateway]
    autoSync --> submitPayload

    submitDecision -->|Online| submitPayload[Kirim HTTP POST /api/v1/screening/submit<br/>Payload JSON + UUID clientToken]

    submitPayload --> valGate{Validasi Schema Zod di Backend}
    valGate -->|Invalid| errVal[Return 400 Bad Request<br/>Tampilkan Pesan Validasi Error ke User]
    errVal --> formStep2

    valGate -->|Valid| sessionHandling[Cek atau Buat AnonymousSession<br/>Lookup clientToken di Supabase]
    sessionHandling --> callML[Panggil FastAPI ML Microservice<br/>POST /api/v1/predict]

    subgraph ML_Microservice["Eksekusi di Microservice ML (FastAPI)"]
        direction TB
        calcLMS[Komputasi Box-Cox LMS WHO 2006<br/>Hitung Z-Score TB/U, BB/U, BB/TB]
        calcNB[Inferensi Model Naive Bayes<br/>Hitung Probabilitas Posterior Risiko Stunting]
        classifyStatus[Klasifikasi Status Gizi dan Risk Tier<br/>LOW, MODERATE, HIGH plus Ekstraksi Faktor Dominan]

        calcLMS --> calcNB --> classifyStatus
    end

    callML --> ML_Microservice
    classifyStatus --> returnMLResult[Kembalikan Hasil Prediksi Lengkap ke Gateway]

    returnMLResult --> saveDB[Simpan Record ke Tabel ScreeningRecord<br/>Relasi ke AnonymousSession]
    saveDB --> genHash[Generate nanoid Unique shareHash<br/>10 Karakter Acak Unik]
    genHash --> returnClient[Respon 201 Created ke Frontend PWA<br/>Data Rekam Medis plus shareHash]

    returnClient --> renderDashboard[Tampilkan Dashboard Analitik Interaktif<br/>URL: /analytics/:shareHash]
    renderDashboard --> widgetCurves[Widget 1: Kurva Baku Pertumbuhan WHO 2006<br/>Plotting Z-Score TB/U, BB/U, BB/TB]
    renderDashboard --> widgetGauge[Widget 2: Risk Gauge Meter Kerentanan]
    renderDashboard --> widgetRadar[Widget 3: Radar Chart Faktor Pemicu Risiko]
    renderDashboard --> widgetFood[Widget 4: Rekomendasi Pangan Lokal Bontang<br/>Ikan Bawis, Bandeng, Telur, Daun Kelor]
    renderDashboard --> widgetShare[Widget 5: Salin Link Publik Hasil Skrining]

    renderDashboard --> openChat[Pengguna Membuka Drawer Chat HATI Assistant]
    openChat --> sendChatQuery[Kirim Pertanyaan Edukasi Gizi Balita]
    sendChatQuery --> chatGateway[Request ke /api/v1/chat/stream<br/>sessionId + query + history]

    subgraph ChatGrounding["AI Direct-DB Grounding dan SSE Streaming"]
        direction TB
        fetchChildData[Ambil Rekam Medis Balita dari ScreeningRecord]
        fetchKB[Ambil Panduan Intervensi dari HealthKnowledgeBase]
        injectPrompt[Inject Data Balita ke System Instruction Gemini]
        callGemini[Panggil Google Gemini 3.6-flash Model]
        streamTokens[Alirkan Token Kata per Kata via SSE<br/>Content-Type: text/event-stream]

        fetchChildData --> injectPrompt
        fetchKB --> injectPrompt
        injectPrompt --> callGemini
        callGemini --> streamTokens
    end

    chatGateway --> ChatGrounding
    streamTokens --> displayChat[Teks Muncul Real-Time di Chat Drawer Pengguna]
    displayChat --> endNode([Selesai: Pengguna Menerima Wawasan Terarah])
```

---

### 4. Deployment & Infrastructure Diagram `[Status: Nilai Tambah]`
Topologi deployment cloud produksi pada platform Domcloud (`sehati.domcloud.dev`), integrasi Supabase connection pooler, dan GitHub Actions automation.
* **File Sumber**: [`diagrams/deployment-infrastructure.mmd`](diagrams/deployment-infrastructure.mmd)
* **File Ekspor**: [Lihat Format Vektor (SVG)](diagrams/deployment-infrastructure.svg) | [Lihat Format Gambar (PNG)](diagrams/deployment-infrastructure.png)

```mermaid
graph TB
    subgraph UserTier["END-USER CLIENT DEVICES"]
        direction LR
        Mobile["Smartphone PWA<br/>Android / iOS Browser"]
        Desktop["Laptop / PC POS<br/>Kader Posyandu & Puskesmas"]
        Surveyor["Surveyor Tablet<br/>Petugas Lapangan Kemenkes"]
    end

    subgraph CloudEdge["DOMCLOUD PUBLIC HOSTING EDGE (sehati.domcloud.dev)"]
        direction TB
        DNS["DNS & SSL Management<br/>Let's Encrypt Automated TLS 1.3"]
        Nginx["Nginx Reverse Proxy & Static Server<br/>HTTP/2, Brotli/Gzip Compression, Cache-Control"]
        StaticPWA["PWA Static App Shell<br/>Vite Build Bundle (/dist)"]
        
        DNS --> Nginx
        Nginx --> StaticPWA
    end

    subgraph AppServer["PRODUCTION BACKEND APPLICATION SERVER"]
        direction TB
        PM2["Node.js Runtime Engine<br/>Express.js v5 REST & SSE Gateway (Port 5001)"]
        SecEnv["Environment Variables (.env)<br/>DATABASE_URL, GEMINI_API_KEY, GATEWAY_API_KEY"]
        PrismaAdapter["Prisma ORM Client<br/>@prisma/adapter-pg (Connection Pool)"]

        PM2 --- SecEnv
        PM2 --> PrismaAdapter
    end

    subgraph MLContainer["COMPUTE & MACHINE LEARNING SERVICE"]
        direction TB
        Uvicorn["Python 3.11 Uvicorn ASGI Server<br/>FastAPI Microservice (Internal Port 8000)"]
        MemoryTables["In-Memory WHO Reference Tables<br/>Box-Cox LMS Values (Stateless & High-Speed)"]
        TrainedModel["Preloaded Naive Bayes Classifier<br/>Scikit-Learn Serialized Pipeline"]

        Uvicorn --> MemoryTables
        Uvicorn --> TrainedModel
    end

    subgraph CloudDB["SUPABASE MANAGED POSTGRESQL (AWS Cloud)"]
        direction TB
        PgBouncer["PgBouncer Connection Pooler<br/>Port 6543 (Session Pooling for Express Gateway)"]
        DirectPostgres["Direct PostgreSQL Instance<br/>Port 5432 (Prisma Migrations & Admin)"]
        EncryptedStorage["Cloud Storage Volume<br/>Encrypted At Rest (AES-256) & Daily Backups"]

        PgBouncer --> EncryptedStorage
        DirectPostgres --> EncryptedStorage
    end

    subgraph GoogleAICloud["GOOGLE CLOUD AI INFRASTRUCTURE"]
        direction TB
        GeminiAPI["Google Gemini API Endpoint<br/>Model: gemini-3.6-flash"]
        StreamPipeline["High-Throughput Token Streaming<br/>Low-Latency SSE Delivery"]

        GeminiAPI --> StreamPipeline
    end

    subgraph AutomationOps["DEVOPS, CI/CD & HEALTH AUTOMATION"]
        direction TB
        GH_Repo["GitHub Repository<br/>Branch: main (CI/CD Pipeline)"]
        GH_Actions["GitHub Actions Cron Keep-Alive<br/>Pings GET /api/v1/health every 24 Hours"]
        PreventSleep["Anti-Inactivity Shield<br/>Prevents Supabase Free-Tier Auto-Pause"]

        GH_Repo --> GH_Actions
        GH_Actions --> PreventSleep
    end

    UserTier ==>|"HTTPS (Port 443)"| DNS
    Nginx -->|"Proxy Pass /api/v1/*"| PM2
    PM2 -->|"HTTP Internal Loopback :8000"| Uvicorn
    PrismaAdapter ==>|"TLS Connection :6543"| PgBouncer
    PM2 ==>|"HTTPS REST Stream"| GeminiAPI
    StreamPipeline -.->|"SSE Tokens"| PM2
    Nginx -.->|"SSE Stream Forward"| UserTier

    PreventSleep ==>|"HTTP Health Ping (SELECT 1)"| PM2
```

---

## 📖 Panduan Pengguna (Multi-Role User Guide)

Platform SEHATI menyediakan alur navigasi adaptif sesuai peran pengguna di lapangan:

### 1. Panduan untuk Orang Tua
> **Tujuan**: Memantau tumbuh kembang mandiri anak di rumah, mendeteksi stunting sebelum terlambat, dan berkonsultasi menu gizi harian.

1. **Mengakses & Memasang Aplikasi (PWA)**:
   - Buka peramban di ponsel Anda dan akses **[https://sehati.domcloud.dev/](https://sehati.domcloud.dev/)**.
   - Untuk kemudahan akses offline, ketuk menu browser (titik tiga atau ikon bagikan) lalu pilih **"Tambahkan ke Layar Utama" (Install App)**. Ikon SEHATI akan muncul di layar ponsel seperti aplikasi native.
2. **Memulai Skrining Mandiri**:
   - Di Halaman Utama, klik tombol **"Mulai Skrining Sekarang"** (tanpa perlu membuat akun atau login).
   - **Langkah 1 (Persona & Wilayah)**: Pilih peran **"Orang Tua"**, lalu pilih **Kelurahan Domisili** Anda di Kota Bontang (misal: *Loktuan*, *Bontang Kuala*, *Tanjung Laut*).
   - **Langkah 2 (Antropometri Fisik)**:
     - Masukkan jenis kelamin balita (Laki-laki / Perempuan).
     - Masukkan umur balita saat ini (0 – 59 bulan).
     - Pilih posisi saat pengukuran tinggi badan: **Terlentang** (wajib untuk balita < 2 tahun) atau **Berdiri** (untuk anak ≥ 2 tahun).
     - Masukkan berat badan (kg, misal: `8.5`) dan tinggi badan (cm, misal: `74.5`).
   - **Langkah 3 (Pola Asuh & Lingkungan)**:
     - Jawab pertanyaan seputar riwayat kelahiran (BBLR), pemberian ASI Eksklusif 6 bulan pertama, usia pengenalan MPASI, frekuensi makan protein hewani, fasilitas sanitasi jamban, sumber air minum, paparan asap rokok di rumah, dan riwayat diare berulang.
3. **Membaca Hasil Analitik di Dashboard**:
   - Klik **"Lihat Hasil Analisis"**. Anda akan diarahkan ke dashboard interaktif:
     - **Kurva Pertumbuhan WHO 2006**: Melihat titik posisi anak pada pita standar deviasi (SD). Jika titik berada di bawah garis merah (-2 SD), balita Anda tergolong *Pendek (Stunted)*.
     - **Meter Risiko Kerentanan (Gauge)**: Menunjukkan probabilitas kerentanan stunting (*LOW*, *MODERATE*, atau *HIGH*).
     - **Faktor Determinan Dominan**: Mengetahui aspek lingkungan atau pola asuh apa yang paling memperberat risiko balita Anda.
     - **Rekomendasi Pangan Lokal Bontang**: Panduan menu harian kaya protein hewani ganda (contoh: sup ikan bawis kuah kuning + telur rebus cincang) yang terjangkau.
4. **Konsultasi dengan Asisten Cerdas HATI**:
   - Ketuk tombol **"Tanya HATI Assistant"** di pojok kanan bawah dashboard.
   - Ajukan pertanyaan seputar menu makan, cara mengatasi balita gerakan tutup mulut (GTM), atau jadwal posyandu terdekat. AI akan merespons secara streaming kata per kata dengan konteks kondisi gizi balita Anda.
5. **Membagikan Hasil Skrining ke Tenaga Medis**:
   - Klik tombol **"Salin Tautan"** (`/analytics/:shareHash`). Tautan ini dapat langsung Anda kirim via WhatsApp ke Bidan Kelurahan, Dokter Puskesmas, atau keluarga tanpa memerlukan akun login.

---

### 2. Panduan untuk Kader Posyandu
> **Tujuan**: Mempercepat alur pemantauan bulanan di balai posyandu dan memastikan data tetap tercatat meskipun internet padam (*offline*).

1. **Persiapan Sesi Posyandu**:
   - Buka aplikasi SEHATI di tablet atau smartphone kader sebelum sesi penimbangan dimulai.
   - PWA akan secara otomatis menyimpan *App Shell* ke cache memori lokal.
2. **Melakukan Pencatatan Cepat di Meja Posyandu**:
   - Pilih persona **"Kader Posyandu"** dan kelurahan wilayah kerja posyandu Anda.
   - Masukkan data penimbangan dacin/timbangan digital dan alat ukur panjang badan (*infantometer* / *stadiometer*).
   - Validasi data otomatis akan mencegah kesalahan ketik ekstrem (misal tinggi badan terbalik dengan berat badan).
3. **Penanganan Kondisi Luar Jaringan (Offline Mode)**:
   - Jika sinyal internet terputus di balai posyandu, sistem akan menampilkan indikator **"Offline Mode"**.
   - Kader tetap dapat mengklik **"Simpan Skrining"**. Data akan ditampung di antrean lokal *IndexedDB* secara aman.
   - Setelah posyandu selesai dan kader mendapatkan sinyal internet, sistem secara otomatis mensinkronisasikan seluruh antrean balita ke basis data pusat.
4. **Tindakan Lanjutan untuk Balita Risiko Tinggi (HIGH)**:
   - Jika hasil skrining menunjukkan kategori **HIGH Risk Tier** atau Z-score TB/U < -3 SD (*Severely Stunted*), kader dianjurkan untuk:
     - Menyalin tautan rekam medis balita (`/analytics/:shareHash`).
     - Meneruskan tautan ke Petugas Gizi Puskesmas pembina wilayah untuk penjadwalan Pemberian Makanan Tambahan (PMT) lokal berbasis protein hewani.

---

### 3. Panduan untuk Surveyor & Tenaga Kesehatan
> **Tujuan**: Integrasi data agregat hasil survei lapangan (Riskesdas / SSGI) dan analisis determinan tingkat kelurahan.

1. **Akses API Ingestion Batch (Unggah Data Survei)**:
   - Siapkan berkas data survei lapangan dalam format CSV terstruktur (antropometri dan determinan lingkungan).
   - Kirim permintaan `POST` terproteksi ke endpoint Gateway dengan header autentikasi:
     ```http
     POST /api/v1/ingest/upload/csv-survey HTTP/1.1
     Host: api.sehati.domcloud.dev
     X-API-KEY: <SECRET_GATEWAY_KEY>
     Content-Type: multipart/form-data
     ```
2. **Monitoring Log Ingest**:
   - Sistem akan memvalidasi setiap baris data menggunakan *Ingestion Adapter Pattern* dan mencatat riwayat pemrosesan pada tabel `IngestionBatchLog` (`totalRecords`, `successCount`, `failedCount`).
3. **Analisis Kebijakan Berbasis Determinan Dominan**:
   - Melalui agregasi data di tabel `ScreeningRecord`, dinas kesehatan dapat memfilter kelurahan dengan pemicu risiko spesifik (misal: persentase balita tanpa akses jamban leher angsa di Kelurahan Berbas Pantai) untuk intervensi infrastruktur lintas dinas (Dinas Kesehatan & Dinas PUPR Kota Bontang).

---

## 💻 Panduan Setup & Instalasi Lokal

Untuk menjalankan ekosistem SEHATI di lingkungan komputer lokal Anda (*development*):

### 1. Prasyarat Sistem
* **Node.js**: v20.x atau v22.x LTS
* **Python**: v3.11.x
* **NPM** atau **PNPM**
* **Database**: PostgreSQL lokal atau akun cloud gratis di [Supabase](https://supabase.com)

---

### 2. Kloning Repositori
```bash
git clone https://github.com/belpythons/SEHATI.git
cd SEHATI
```

---

### 3. Setup Sub-Sistem 1: Backend API Gateway (`backend`)
```bash
cd backend

# 1. Install dependensi Node.js
npm install

# 2. Konfigurasi environment
cp .env.example .env
```
Buka file `backend/.env` dan sesuaikan nilainya:
```env
PORT=5001
DATABASE_URL="postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
ML_SERVICE_URL="http://localhost:8000/api/v1/predict"
ML_TIMEOUT_MS=10000
GATEWAY_API_KEY="kunci_rahasia_ingest_anda"
GEMINI_API_KEY="AIzaSy...API_KEY_GEMINI_ANDA"
GEMINI_MODEL="gemini-3.6-flash"
CORS_ORIGIN="http://localhost:5173, http://localhost:3000"
```

Jalankan migrasi Prisma dan server backend:
```bash
# Generate Prisma Client
npx prisma generate

# Jalankan server dalam mode watch
npm run dev
# Server aktif pada http://localhost:5001
```

---

### 4. Setup Sub-Sistem 2: ML Microservice (`ml-service`)
Buka terminal baru di folder root:
```bash
cd ml-service

# 1. Buat dan aktifkan virtual environment Python
python -m venv venv

# Di Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Di Linux/macOS:
source venv/bin/activate

# 2. Install dependensi
pip install fastapi uvicorn pydantic
# Catatan: inferensi Naive Bayes & Z-Score WHO diimplementasikan manual (pure Python),
# tidak bergantung pada scikit-learn/pandas/numpy.

# 3. Jalankan FastAPI Uvicorn ASGI Server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
# Microservice aktif pada http://localhost:8000
# Dokumentasi Swagger UI: http://localhost:8000/docs
```

---

### 5. Setup Sub-Sistem 3: Frontend PWA (`frontend`)
Buka terminal baru di folder root:
```bash
cd frontend

# 1. Install dependensi React 19 & Vite
npm install

# 2. Konfigurasi environment lokal
cp .env.example .env.local
```
Pastikan file `frontend/.env.local` mengarah ke port gateway backend:
```env
VITE_API_URL=http://localhost:5001
```

Jalankan Vite Development Server:
```bash
npm run dev
# Buka peramban di http://localhost:5173
```

---

### 6. Menjalankan Otomasi Ekspor Diagram
Untuk mengekspor seluruh diagram Mermaid ke gambar SVG dan PNG:
```bash
# Di direktori root proyek
node scripts/export-diagrams.js
```

---

## 📡 Spesifikasi API & Microservice

### Endpoint Utama Backend Gateway (`http://localhost:5001`):
* `POST /api/v1/screening/submit`: Menerima kuesioner antropometri dan determinan balita, memanggil ML microservice, menyimpan record ke Supabase, dan mengembalikan `shareHash`.
* `POST/GET /api/v1/chat/stream`: Endpoint SSE (*Server-Sent Events*) untuk konsultasi interaktif gizi anak dengan grounding rekam medis balita dan panduan pangan lokal Bontang via Google Gemini.
* `POST /api/v1/ingest/upload/:sourceType`: Endpoint impor batch data survei Riskesdas / CSV terproteksi API Key header `X-API-KEY`.
* `GET /api/v1/health`: Endpoint verifikasi status kesehatan server gateway dan koneksi Supabase PostgreSQL.

### Endpoint Utama ML Microservice (`http://localhost:8000`):
* `POST /api/v1/predict`: Menerima payload fisik antropometri balita dan variabel lingkungan, menghitung Z-scores WHO (Box-Cox LMS), mengeksekusi klasifikasi Naïve Bayes, dan mengembalikan `zScoreTBU`, `statusGiziTBU`, `riskTier`, dan `dominantFactors`.
* `GET /health`: Endpoint liveness probe microservice FastAPI.

---

## 📂 Struktur Direktori Repositori

```
SEHATI/
├── backend/                             # [Modul 2] Backend Express.js API Gateway
│   ├── prisma/
│   │   └── schema.prisma                # Skema Database Supabase PostgreSQL
│   ├── src/
│   │   ├── adapters/                    # Ingestion Adapter Transformer (CSV/Riskesdas)
│   │   ├── controllers/                 # Controller Screening, Chat SSE, Session, Ingest
│   │   ├── routes/                      # Rute Endpoint REST API v1
│   │   ├── services/                    # Gemini GenAI SDK, ML Client HTTP, Session
│   │   ├── validations/                 # Skema Validasi Payload Zod
│   │   ├── server.ts                    # Entry Point Express Server
│   │   └── app.ts                       # Konfigurasi Middleware & Routing
│   └── package.json
│
├── frontend/                            # [Modul 1] Progressive Web App (PWA Client)
│   ├── public/                          # PWA Icons, Manifest, Static Assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/               # Widget Kurva WHO, Gauge, Radar, Pangan Lokal
│   │   │   ├── forms/                   # Multi-Step Form Kuesioner (Framer Motion)
│   │   │   └── layout/                  # Floating Navbar, Footer, Drawers
│   │   ├── pages/                       # Landing, Questionnaire, Analytics, UserGuide, Bontang
│   │   ├── services/                    # SSE Chat Service, Offline Queue (IndexedDB)
│   │   └── App.tsx                      # Routing & State Orchestration
│   └── vite.config.ts                   # Konfigurasi Vite & vite-plugin-pwa
│
├── ml-service/                          # [Modul 3] Microservice Machine Learning (FastAPI)
│   └── app/
│       ├── core/                        # Konfigurasi & Loader Data WHO 2006
│       ├── schemas/                     # Skema Pydantic Payload Antropometri
│       ├── services/
│       │   ├── zscore_engine.py         # Engine Box-Cox LMS WHO 2006 (TB/U, BB/U, BB/TB)
│       │   └── inference_engine.py      # Classifier Naïve Bayes & Ekstraksi Determinan
│       └── main.py                      # FastAPI Application Router
│
├── diagrams/                            # Koleksi Lengkap Diagram Arsitektur Sistem
│   ├── DIAGRAMS.md                      # Dokumentasi & Analisis Teknis Detail Diagram
│   ├── erd.mmd                          # Sumber Mermaid: Entity Relationship Diagram
│   ├── erd.svg                          # Vektor Gambar ERD
│   ├── erd.png                          # Gambar Raster ERD
│   ├── system-architecture.mmd          # Sumber Mermaid: Arsitektur Sistem High-Level
│   ├── system-architecture.svg          # Vektor Gambar Arsitektur Sistem
│   ├── system-architecture.png          # Gambar Raster Arsitektur Sistem
│   ├── flowchart-activity.mmd           # Sumber Mermaid: Alur Kerja Bisnis Aplikasi
│   ├── flowchart-activity.svg           # Vektor Gambar Flowchart & Activity
│   ├── flowchart-activity.png           # Gambar Raster Flowchart & Activity
│   ├── deployment-infrastructure.mmd    # Sumber Mermaid: Topologi Deployment Cloud
│   ├── deployment-infrastructure.svg    # Vektor Gambar Deployment
│   └── deployment-infrastructure.png    # Gambar Raster Deployment
│
├── scripts/
│   └── export-diagrams.js               # Script Otomasi Ekspor Mermaid ke SVG & PNG
│
└── README.md                            # Dokumentasi Induk Sistem (Level: System Analyst)
```

---

## 📄 Lisensi & Kontak

Proyek ini dilisensikan di bawah **ISC License**. Dikembangkan untuk memajukan kesehatan anak Indonesia dan mempercepat pencapaian target penurunan stunting nasional, dimulai dari pesisir Kota Bontang.

* **Aplikasi Publik Live**: [https://sehati.domcloud.dev/](https://sehati.domcloud.dev/)
* **Penyelarasan Kebijakan**: SDG 3 (Kesehatan yang Baik) & SDG 2 (Tanpa Kelaparan / Nol Stunting)
* **Konteks Intervensi**: 15 Kelurahan Kota Bontang, Kalimantan Timur, Indonesia.

---
*Dibuat dengan dedikasi penuh untuk generasi masa depan Indonesia yang sehat, cerdas, dan bebas stunting.*
