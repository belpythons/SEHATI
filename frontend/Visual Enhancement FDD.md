# FUNCTIONAL DESIGN DOCUMENT (FDD)

## Frontend Visual Enhancement — Gambar Kontekstual & Idle Motion

| Key Meta | Detail Spesifikasi |
| :---- | :---- |
| **Nama Sistem** | SEHATI (Sistem Edukasi Holistik dan Deteksi Stunting Terintegrasi) |
| **Sub-Sistem** | Frontend — Lapisan Visual (gambar/ilustrasi + animasi idle) |
| **Versi Dokumen** | 1.0.0-PLANNING |
| **Status** | **Riset & perencanaan selesai — BELUM dieksekusi.** Menunggu keputusan Anda di §7 sebelum implementasi dimulai. |
| **Cakupan** | Riset + dokumentasi rencana eksekusi saja (sesuai instruksi eksplisit). Tidak ada kode frontend yang diubah dalam penyusunan dokumen ini. |

---

## 1. Latar Belakang

Backend sudah dirombak & dinormalisasi (lihat `backend/Backend API Gateway FDD.md`), diverifikasi tidak memengaruhi frontend (kontrak API identik lewat VIEW `screening_record_flat`). Sekarang giliran frontend: Anda ingin menambahkan **gambar yang relevan dengan konteks aplikasi**, beberapa **animasi Motion (framer-motion) dan animasi *idle*** yang menarik mata, tapi tetap **mengedepankan whitespace** dan **UX persona orang tua**.

Dokumen ini adalah hasil riset kondisi frontend saat ini + rencana eksekusi. Tidak ada implementasi di tahap ini.

---

## 2. Audit Kondisi Visual Saat Ini

Frontend sudah dibangun mengikuti disiplin desain skill **Hallmark** (`frontend/.agents/skills/hallmark/`) — genre **editorial**, gaya tipografi-dulu (typography-first), whitespace lebar (`py-24`, `gap-12`, border-t sebagai pemisah section, bukan card berbayang). Temuan konkret:

- **Nol gambar/ilustrasi di seluruh aplikasi.** `frontend/public/` hanya berisi favicon & app-icon PWA. Tidak ada folder `assets/images`. Setiap section landing page (`EditorialHero`, `WhyEarlyScreening`, `NutritionEducation`, `ProductIntelligence`, `TrustProofSection`) 100% tipografi + satu ikon `hugeicons-react` dalam lingkaran aksen (`bg-sage/10 p-3 rounded-full`).
- **Ini keputusan sadar, bukan kelalaian** — `frontend/src/data/heroCarouselData.ts:8` punya komentar eksplisit: *"brand color identifier used to style the slide background — no images needed"*. Slide hero saat ini murni gradient OKLCH + teks.
- **Sistem token desain sudah matang** (`frontend/src/index.css`): palet OKLCH netral (`--color-paper` ~98% lightness) + 3 aksen (`--color-teal` hue 170, `--color-sage` hue 140, `--color-navy` hue 250), font `Instrument Serif` (display) + `Inter` (body) + `JetBrains Mono` (eyebrow/label).
- **Vokabuler motion sudah konsisten di semua komponen** — satu easing yang sama persis dipakai berulang: `ease: [0.16, 1, 0.3, 1]` (persis token `--ease-out` di Hallmark `motion.md`), pola `whileInView` + `staggerChildren` untuk reveal-on-scroll, durasi 0.6–1.0s. **Belum ada satupun animasi idle/ambient** (semua animasi saat ini adalah reveal sekali-jalan saat scroll, bukan loop berkelanjutan).
- **`HeroCarousel` sudah benar secara aksesibilitas** — `useCarouselAutoplay.ts` sudah pause-on-hover/focus/drag dan menghormati `prefers-reduced-motion` (autoplay mati total). Tidak ada temuan bug di sini, hanya dicatat sebagai fondasi yang aman untuk dikembangkan.
- **Slot "jangkar visual" sudah ada** di beberapa section (lingkaran ikon di `NutritionEducation`/`WhyEarlyScreening`) — ini titik yang paling murah untuk di-upgrade jadi ilustrasi kecil tanpa merombak layout.

**Kesimpulan audit**: frontend TIDAK kosong secara desain — ia sengaja minimalis. Tugas ini bukan "menambah gambar ke halaman kosong", tapi **menyisipkan visual & idle motion ke sistem yang sudah punya disiplin ketat**, tanpa merusak disiplin itu.

---

## 3. Prinsip yang HARUS Dipertahankan

Ditarik langsung dari `hallmark/references/motion.md` dan `hero-enrichment.md` yang sudah dipakai membangun app ini — bukan aturan baru, tapi konsistensi dengan apa yang sudah ada:

1. **Animasi idle itu langka dan disiplin, bukan hiasan di mana-mana.** Aturan Hallmark eksplisit: *"Infinite loops (other than functional loaders) — they pull the eye and never let go."* dan arketipe idle-loop (E6) hanya untuk **satu elemen kecil per halaman**, durasi loop ≤ 4 detik. Permintaan Anda ("animasi idle yang memukau mata") **dipenuhi lewat 1 momen idle yang benar-benar disengaja per layar kunci** (mis. hero landing), bukan idle motion tersebar di banyak tempat — itu justru akan melawan prinsip whitespace yang Anda minta dipertahankan.
2. **Animate hanya `transform` dan `opacity`.** Tidak animasi `width/height/top/left` (memicu layout reflow).
3. **Easing & durasi ikuti token yang sudah ada** — `[0.16, 1, 0.3, 1]` untuk masuk, jangan perkenalkan bounce/elastic (dilarang eksplisit di kanon, "reads as 2016 Framer demo").
4. **`prefers-reduced-motion` wajib** di setiap animasi baru — koleksi state statis sebagai fallback, bukan sekadar `animation: none`.
5. **Dilarang keras** (sudah jadi anti-pattern eksplisit di kanon desain yang dipakai app ini): *aurora blob*, *mesh gradient* ungu-cyan, partikel/starfield, parallax-on-mouse di seluruh halaman, Lottie sebagai jalan pintas pertama.
6. **Hierarki "pakai tier setinggi mungkin yang bisa dikerjakan"**: Tipografi saja → CSS Art murni → SVG buatan tangan → Ilustrasi generated (dengan post-processing) → Ilustrasi library (Storyset/Humaaans, wajib dikustom warna) → Lottie (paling terakhir). **Jangan lompat ke Lottie/generated image duluan.**

---

## 4. Riset Sumber Visual — Rekomendasi

### 4.1 Konteks yang perlu direpresentasikan
Stunting/gizi anak, standar kurva WHO, pengukuran antropometri, Kota Bontang (pesisir, ikan laut, Kalimantan Timur), 4 persona (Orang Tua, Kader Posyandu, Nakes, Surveyor) — dengan **persona Orang Tua sebagai prioritas UX** (nada hangat, meyakinkan, tidak klinis/menakutkan).

### 4.2 Rute yang direkomendasikan: **ilustrasi berkarakter manusia, bukan foto stok**

**Kenapa bukan fotografi sebagai rute utama:**
- Risiko representasi — mayoritas foto stok gratis (Unsplash/Pexels) berwajah Barat/generik; foto yang benar-benar terasa "keluarga Bontang/Indonesia" susah dicari tanpa kurasi manual ekstensif.
- Clash nada — memasukkan foto raster ke sistem yang 100% vektor/tipografi (ikon monoline, gradient OKLCH datar) adalah lompatan visual besar; foto butuh perlakuan tone-match yang berat (desaturate, color-wash) supaya tidak terasa asing.
- Kanon desain (`assets.md`) sendiri merekomendasikan rute ilustrasi untuk kasus persis ini: *"Hero sections that need humans without stock-photo territory"* → **Humaaans** / **Open Peeps**.

**Rekomendasi konkret (urutan prioritas):**
1. **Karakter ilustrasi (Tier D, wajib dikustom)** — [Humaaans](https://www.humaaans.com) (CC0, karakter mix-and-match pose/skin-tone) atau [Open Peeps](https://www.openpeeps.com) (CC0, gaya hand-drawn naif, lebih hangat) untuk figur "orang tua menggendong/mengukur balita". **Wajib**: warna dikustom ke token OKLCH aksen app (teal/sage/navy), bukan warna default library.
2. **SVG kustom buatan tangan (Tier B)** untuk motif yang benar-benar spesifik konteks Bontang & tidak ada di library manapun: ikan bawis, daun kelor, kurva pertumbuhan WHO yang "menggambar sendiri" (`stroke-dasharray` reveal — persis contoh "hand-built loaf breathing-loop" di kanon `hero-enrichment.md` §E5). Ini juga jadi kandidat terbaik untuk **momen idle tunggal** di §5.
3. **Fotografi (opsional, kalau Anda tetap menginginkannya untuk halaman "Tentang"/testimoni)** — [Nappy.co](https://www.nappy.co) dulu (kurasi representasi terbaik), baru Unsplash/Pexels dengan kata kunci spesifik ("Indonesian mother baby", "Southeast Asian toddler"), **selalu** di-tone-tweak (desaturate ~8%, color-wash ke `--color-paper`) supaya menyatu, tidak pernah dipakai mentah.
4. **Ilustrasi generated (Tier C, Nanobanana/Recraft)** — opsi cadangan kalau butuh adegan sangat spesifik (mis. "kader Posyandu mengukur balita di ruang Posyandu Bontang") yang tak ada di library manapun. Selalu post-process (grain, crop asimetris), jangan pernah pakai mentah dari model.

**Yang harus dihindari** (anti-pattern eksplisit dari riset): pose generik "orang di depan laptop", wajah AI simetris/mesh-smooth, logo/watermark stok yang kelihatan, foto yang belum di-tone-match.

---

## 5. Peta Penempatan per Halaman

| Halaman/Komponen | Kebutuhan Visual | Arketipe (Hallmark) | Prioritas |
| --- | --- | --- | --- |
| `EditorialHero` + `HeroCarousel` | Ilustrasi hero (orang tua & balita, atau kurva WHO animatif) menggantikan slide gradient-polos saat ini | **E5 Custom Illustration Centerpiece**, dengan animasi loop napas 4-6 detik = **momen idle utama satu-satunya di landing page** | Tinggi — ini "wow moment" paling terlihat |
| `NutritionEducation` (slot ikon Apple) | Upgrade lingkaran ikon jadi ilustrasi kecil (ikan bawis/daun kelor) | Tier B SVG kecil, statis (tanpa loop — jangan duplikasi idle motion hero) | Sedang |
| `WhyEarlyScreening` (slot ikon Shield) | Ilustrasi kecil "1000 HPK" (mis. garis waktu bayi→balita) | Tier B SVG kecil, statis | Sedang |
| `ProductIntelligence` (4 langkah alur) | 4 ikon langkah kecil bisa naik jadi mini-ilustrasi per langkah | Tier A/B kecil | Rendah |
| `QuestionnairePage` (4 langkah) | Ilustrasi kecil per langkah (persona, antropometri, dst.) di header step | Tier B SVG kecil, statis — form adalah "kerja", bukan panggung idle motion | Rendah |
| `AnalyticsPage` | **Tidak perlu** — dashboard sudah padat data (chart, gauge, radar); menambah ilustrasi di sini justru mengganggu pembacaan data | — | Diabaikan |
| Halaman statis (`AboutPage`, `MissionPage`, `BontangContextPage`) | Foto/ilustrasi konteks Kota Bontang (pesisir, peta kelurahan) cocok di sini — bukan halaman "kerja" seperti form/dashboard | E8 Fotografi (opsional) atau Tier B ilustrasi peta | Rendah |
| `FooterSection`, `FloatingNavbar` | Tidak perlu — chrome, bukan konten | — | Diabaikan |

**Prinsip pemilihan di atas**: gambar & idle motion ditempatkan di halaman yang bersifat *"read/persuade"* (landing, halaman statis) — **bukan** di halaman yang bersifat *"kerja"* (form kuesioner, dashboard analitik), supaya tidak mengganggu tugas persona Orang Tua yang sedang mengisi data atau membaca hasil medis.

---

## 6. Rencana Eksekusi Bertahap (untuk sesi berikutnya)

Ini rencana implementasi yang **belum dijalankan** — akan dieksekusi setelah Anda konfirmasi §7.

- **Stage 1 — Aset**: pilih & siapkan 1 ilustrasi hero (karakter Humaaans/Open Peeps dikustom warna, ATAU SVG kurva WHO buatan tangan), 2-3 ilustrasi kecil pendukung (ikan bawis, daun kelor, garis waktu 1000 HPK). Simpan di `frontend/src/assets/illustrations/`.
- **Stage 2 — Hero & landing**: ganti/tambah `HeroSlide` dengan slot ilustrasi (extend `HeroSlide` interface, bukan rombak total), pasang animasi idle napas 4-6s pakai `framer-motion` (`animate={{ y: [0, -6, 0] }}` loop, dibungkus `useReducedMotion()` check). Upgrade 2 slot ikon di `NutritionEducation`/`WhyEarlyScreening`.
- **Stage 3 — Halaman statis & kuesioner**: ilustrasi kecil per step kuesioner, banner kontekstual di `BontangContextPage`.
- **Stage 4 — QA**: cek `prefers-reduced-motion` (Chrome DevTools emulate), cek bobot gambar total (`hero-enrichment.md` batas 2MB), cek alt text tiap ilustrasi, cek tidak ada horizontal-scroll di 320/375/414/768px (standar Hallmark), cek kontras teks di atas ilustrasi ≥ WCAG AA.

---

## 7. Keputusan yang Perlu Dikonfirmasi Sebelum Eksekusi

1. **Gaya ilustrasi**: Humaaans (lebih modern/flat) vs Open Peeps (lebih hand-drawn/hangat) vs murni SVG kustom kurva WHO tanpa figur manusia sama sekali? *(Rekomendasi: Open Peeps untuk figur + SVG kustom kurva WHO sebagai pelengkap — kombinasi paling hangat + paling on-brand.)*
2. **Fotografi**: dipakai sama sekali (untuk halaman Tentang saja) atau full-ilustrasi tanpa foto sama sekali?
3. **Berapa banyak momen idle**: dokumen ini merekomendasikan **1 (satu)** di hero landing saja, sesuai disiplin "restraint" yang sudah dipakai app ini. Kalau Anda mau lebih dari 1, sebutkan di halaman mana saja.
4. **Budget tools**: kalau butuh Tier C (generated illustration, mis. adegan spesifik Posyandu Bontang), ada budget/API key Nanobanana atau Recraft, atau cukup Tier A/B/D (gratis)?

---

## 8. Referensi
- `frontend/.agents/skills/hallmark/references/hero-enrichment.md` — arketipe enrichment E1-E8, disiplin idle-loop.
- `frontend/.agents/skills/hallmark/references/motion.md` — bahasa motion (easing, durasi, larangan).
- `frontend/.agents/skills/hallmark/references/assets.md` — kanon sumber ilustrasi/foto/generated.
- `frontend/src/index.css`, `frontend/src/data/heroCarouselData.ts` — kondisi token & konten saat ini.
