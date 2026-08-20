# 🌟 SEHATI Frontend (PWA Client)

Frontend client antarmuka web progresif (PWA) untuk platform **SEHATI (Sistem Edukasi Holistik dan Deteksi Stunting Terintegrasi)** balita Kota Bontang.

Dibangun dengan **React 19 + TypeScript + Vite + TailwindCSS**, didukung arsitektur **Mock-First** & fallback offline IndexedDB.

---

## 🚀 Panduan Setup & Menjalankan Proyek

### 1. Prasyarat
- **Node.js**: v18+ atau v20+
- **npm** / **pnpm** / **yarn**

### 2. Instalasi Dependensi
Jalankan perintah berikut di direktori `frontend`:
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Salin file template [`.env.example`](.env.example) menjadi `.env` atau `.env.local`:
```bash
# Salin file konfigurasi environment
cp .env.example .env.local
```

Buka file `.env.local` dan sesuaikan nilainya:
```env
# Base URL Backend API Gateway (Express.js)
# Default lokal backend berjalan pada port 3000
VITE_API_URL=http://localhost:3000
```

> **Catatan**: Frontend mengadopsi pendekatan *mock-first*. Jika backend belum aktif atau offline, frontend akan otomatis beralih menggunakan *mock layer* dan cache lokal tanpa kendala.

### 4. Menjalankan Server Development
```bash
npm run dev
```
Akses aplikasi melalui browser pada URL yang tertera (biasanya `http://localhost:5173`).

---

## 📜 Script yang Tersedia

- `npm run dev`: Menjalankan Vite development server.
- `npm run build`: Melakukan compile TypeScript & bundling Vite untuk production.
- `npm run preview`: Menjalankan preview lokal dari hasil build production.
- `npm run lint`: Memeriksa kode dengan ESLint.

---

## 📚 Dokumentasi Lebih Lanjut

- 📑 [Indeks Dokumentasi Komponen & Halaman](docs/README.md)
- 📐 [Arsitektur & Standar Frontend](docs/00_OVERVIEW_AND_ARCHITECTURE.md)
- 🎨 [Desain Halaman Landing](docs/01_PAGE_LANDING.md)
- 📋 [Spesifikasi Halaman Kuesioner](docs/02_PAGE_QUESTIONNAIRE.md)
- 📊 [Spesifikasi Dashboard Analitik](docs/03_PAGE_ANALYTICS.md)
- 🧩 [Shared Components & Utilitas](docs/04_SHARED_COMPONENTS.md)
