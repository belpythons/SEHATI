# 📄 Modul 04: Spesifikasi Komponen Bersama & Utilitas (*Shared Components*)

Dokumen ini mendefinisikan komponen antarmuka yang digunakan lintas halaman (*cross-page reusable components*), komponen layout, hooks kustom, dan manajemen PWA/IndexedDB.

---

## 1. Komponen Tata Letak (*Layout Components*)

### A. `FloatingNavbar`
* **Lokasi:** `src/components/layout/FloatingNavbar.tsx`
* **Peran:** Header navigasi global yang melayang di bagian atas halaman dengan efek *glassmorphism*.
* **Fitur:**
  * Logo SEHATI dengan animasi hover.
  * `ConnectionBadge`: Menunjukkan status online/offline secara dinamis (`navigator.onLine` + event listener `online`/`offline`).
  * Tombol instalasi PWA (*Add to Home Screen*) yang memicu event `beforeinstallprompt`.
  * Menu navigasi responsif (Desktop & Mobile Drawer).

---

### B. `FooterSection`
* **Lokasi:** `src/components/layout/FooterSection.tsx`
* **Peran:** Footer branding resmi dengan informasi kolaborasi kesehatan Kota Bontang, tautan penting, dan penafian medis (*medical disclaimer*).

---

### C. `OfflineBanner`
* **Lokasi:** `src/components/layout/OfflineBanner.tsx`
* **Peran:** Banner peringatan ramah di bagian atas layar ketika koneksi internet terputus.
* **Pesan:** *"Anda sedang dalam Mode Offline. Semua data skrining disimpan dengan aman di perangkat ini dan akan disinkronkan otomatis saat online."*

---

## 2. Komponen Antarmuka Primitif (*UI Primitives*)

| Nama Komponen | Lokasi File | Deskripsi & Kegunaan |
| :--- | :--- | :--- |
| `Button` | `src/components/common/Button.tsx` | Varian: `primary`, `secondary`, `outline`, `ghost`, `danger`. Dilengkapi state `isLoading`. |
| `Card` | `src/components/common/Card.tsx` | Container kartu bernuansa modern dengan border lembut, shadow halus, dan efek hover. |
| `Badge` | `src/components/common/Badge.tsx` | Label status (Normal [Hijau], Stunted [Merah], Warning [Amber], Info [Biru], AI [Ungu]). |
| `RadioCard` | `src/components/common/RadioCard.tsx` | Kartu pilihan interaktif untuk seleksi Persona, Gender, Posisi Ukur, dan Determinan. |
| `SelectDropdown` | `src/components/common/SelectDropdown.tsx` | Dropdown pencarian untuk memilih 15 Kelurahan di Kota Bontang. |
| `InputField` | `src/components/common/InputField.tsx` | Input teks & numerik dengan label, satuan unit (kg, cm, bln), dan pesan error Zod. |
| `Drawer` | `src/components/common/Drawer.tsx` | Container panel geser dari sisi bawah/kanan untuk Chatbot AI dan menu mobile. |
| `Modal` | `src/components/common/Modal.tsx` | Dialog pop-up untuk detail resep pangan lokal dan konfirmasi simpan draft. |
| `Tooltip` | `src/components/common/Tooltip.tsx` | Penjelasan istilah medis (Z-Score, LMS, BBLR, STBM) saat di-hover/tap. |

---

## 3. Hooks Kustom (*Custom React Hooks*)

### A. `useSessionToken`
* **Lokasi:** `src/hooks/useSessionToken.ts`
* **Tujuan:** Mengelola anonimitas pengguna dengan UUID token unik di `localStorage` (`sehati_client_token`).
* **Return:** `{ clientToken: string }`

---

### B. `useOfflineDraft`
* **Lokasi:** `src/hooks/useOfflineDraft.ts`
* **Tujuan:** Interaksi dengan IndexedDB untuk menyimpan (*auto-save/manual save*) dan memuat kembali draft kuesioner yang belum selesai.
* **Return:**
  ```typescript
  interface UseOfflineDraftReturn {
    draft: QuestionnaireFormData | null;
    saveDraft: (data: QuestionnaireFormData) => Promise<void>;
    clearDraft: () => Promise<void>;
    hasDraft: boolean;
    lastSaved: Date | null;
  }
  ```

---

### C. `usePWAInstall`
* **Lokasi:** `src/hooks/usePWAInstall.ts`
* **Tujuan:** Menangkap event browser `beforeinstallprompt` dan menyediakan fungsi trigger instalasi PWA.
* **Return:** `{ isInstallable: boolean, installPWA: () => Promise<void> }`

---

### D. `useChatStream`
* **Lokasi:** `src/hooks/useChatStream.ts`
* **Tujuan:** Mengelola koneksi Server-Sent Events (SSE) menggunakan `@microsoft/fetch-event-source` ke backend `/api/v1/chat/stream`.
* **Return:**
  ```typescript
  interface UseChatStreamReturn {
    messages: Array<{ role: 'user' | 'assistant'; content: string }>;
    isStreaming: boolean;
    sendMessage: (query: string) => Promise<void>;
    resetChat: () => void;
  }
  ```

---

## 4. Utilitas & Manajemen Data (*Services*)

### A. `idbStorage.ts` (IndexedDB Wrapper)
* Inisialisasi database `sehati_client_db` (versi 1) dengan dua object store:
  1. `questionnaire_drafts`: Menyimpan draft formulir aktif.
  2. `screening_history`: Menyimpan riwayat hasil skrining lokal saat offline.

### B. `zscoreCalculator.ts` (Client-side Fallback Engine)
* Berisi fungsi LMS lokal jika pengguna ingin melihat estimasi kurva Z-score saat offline tanpa koneksi backend ke ML microservice.
