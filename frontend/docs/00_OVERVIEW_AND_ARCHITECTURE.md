# 🏗️ Modul 00: Arsitektur & Standar Frontend Client

Dokumen ini mendefinisikan arsitektur aplikasi, tata letak folder komponen, pustaka pendukung, strategi state management, dan dukungan Progressive Web App (PWA) untuk klien **SEHATI**.

---

## 1. Spesifikasi Teknologi & Dependencies

| Kategori | Pustaka / Teknologi | Versi Target / Peran |
| :--- | :--- | :--- |
| **Core Framework** | React + TypeScript + Vite | React 19 / Fast HMR Bundle |
| **Styling & Design System** | Tailwind CSS + Lucide Icons | Utility-first, responsive & accessible |
| **Motion & Animation** | Framer Motion | Smooth step transition & widget drag animations |
| **Grid Drag-and-Drop** | `@dnd-kit/core`, `@dnd-kit/sortable` | Reorderable widget dashboard layout |
| **Visualisasi Data** | `recharts` / `chart.js`, `react-gauge-component` | Plotting kurva Z-Score WHO & meter risiko |
| **Streaming SSE** | `@microsoft/fetch-event-source` | Real-time token streaming Chatbot Gemini AI |
| **Offline Cache & PWA** | `vite-plugin-pwa`, `idb` (IndexedDB) | Zero-loss offline questionnaire storage |
| **Validasi Form** | `zod` + `react-hook-form` | Parametric validation & custom error messages |

---

## 2. Struktur Direktori Frontend Direkomendasikan

```
frontend/
├── mock_data.json                  # Master Mock Data untuk hardcode UI
├── docs/                           # Dokumentasi FDD breakdown per page
│   ├── README.md
│   ├── 00_OVERVIEW_AND_ARCHITECTURE.md
│   ├── 01_PAGE_LANDING.md
│   ├── 02_PAGE_QUESTIONNAIRE.md
│   ├── 03_PAGE_ANALYTICS.md
│   └── 04_SHARED_COMPONENTS.md
├── src/
│   ├── assets/                     # SVGs, icons, kurva baku WHO
│   ├── components/
│   │   ├── common/                 # Reusable UI primitives (Button, Card, Badge, Modal)
│   │   ├── layout/                 # FloatingNavbar, Footer, AppShell, OfflineBanner
│   │   ├── landing/                # Hero, BontangContext, FeatureGrid, PersonaCards
│   │   ├── questionnaire/          # Step1Persona, Step2Antro, Step3Determinan, StepProgress
│   │   ├── analytics/              # Widgets (GrowthChart, RiskGauge, Radar, Nutrition, Share, Chat)
│   │   └── chat/                   # FloatingAiChatDrawer, MessageItem, QuickPrompts
│   ├── hooks/                      # useSessionToken, useOfflineDraft, usePWAInstall, useChatStream
│   ├── services/                   # IndexedDB storage, API client, SSE handler
│   ├── types/                      # TypeScript schemas (Screening, ZScore, Persona, RiskTier)
│   ├── pages/
│   │   ├── LandingPage.tsx         # Route: /
│   │   ├── QuestionnairePage.tsx   # Route: /questionnaire
│   │   └── AnalyticsPage.tsx       # Route: /analytics & /analytics/:shareHash
│   ├── App.tsx                     # Routing & Session Provider
│   └── main.tsx                    # React Root Entry & Service Worker Registration
```

---

## 3. Strategi State Management & Offline Flow

### A. Zero-Login Friction & Anonymous Session
* Saat aplikasi pertama kali dibuka, hook `useSessionToken` memeriksa apakah `clientToken` (UUID) tersimpan di `localStorage`. Jika belum, dibuatkan token acak baru.
* Semua catatan skrining lokal diasosiasikan dengan token ini.

### B. Offline Questionnaire Buffer (IndexedDB)
* Saat koneksi internet terputus (`navigator.onLine === false`):
  1. Header menampilkan badge **"Mode Offline"**.
  2. Form kuesioner dapat diisi seperti biasa.
  3. Tombol **"Simpan Draft (Offline)"** menyimpan draft ke IndexedDB store `sehati_drafts`.
  4. Saat koneksi online kembali, muncul prompt sinkronisasi otomatis ke backend.

---

## 4. Skema Warna & Token Desain (Theme Tokens)

| Token Nama | Kode Warna | Penggunaan Utama |
| :--- | :--- | :--- |
| `primary-blue` | `#2563EB` / `#1D4ED8` | Brand SEHATI, Primary CTA, TB/U Indicator |
| `emerald-green` | `#10B981` / `#059669` | Status Normal, Z-Score aman, Risk Tier LOW |
| `amber-warning` | `#F59E0B` / `#D97706` | Status Underweight / Wasted, Risk Tier MODERATE |
| `rose-danger` | `#EF4444` / `#DC2626` | Status Stunted / Severely Stunted, Risk Tier HIGH |
| `purple-accent` | `#8B5CF6` / `#7C3AED` | Gemini AI Assistant, Widget Chat, Special Badges |
| `surface-bg` | `#F8FAFC` / `#FFFFFF` | Background halaman, Card widget container |
