# Sumber tabel WHO LMS

`extract.py` mengubah 8 file Excel resmi WHO Child Growth Standards 2006
(length/height-for-age, weight-for-age, weight-for-length, weight-for-height —
masing-masing boys & girls) menjadi `who-lms-data.json` yang dipakai
`backend/src/domain/zscore/whoLmsTables.ts`.

File Excel sumbernya sengaja tidak disimpan di repo (besar, bukan kode).
Untuk meregenerasi bila WHO merilis update tabel:

1. Unduh ulang 8 file dari cdn.who.int (URL lengkap ada di komentar
   `backend/src/domain/zscore/whoLmsTables.ts`) ke folder ini dengan nama
   `lhfa-boys.xlsx`, `lhfa-girls.xlsx`, `wfa-boys.xlsx`, `wfa-girls.xlsx`,
   `wfl-boys.xlsx`, `wfl-girls.xlsx`, `wfh-boys.xlsx`, `wfh-girls.xlsx`.
2. `python extract.py` (butuh `openpyxl`) → menghasilkan `who_lms_extracted.json`.
3. Salin ke `backend/src/domain/zscore/who-lms-data.json`.
