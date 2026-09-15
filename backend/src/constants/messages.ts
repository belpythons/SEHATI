export const commonMessages = {
  validationFailed: "Validasi gagal. Periksa kembali data yang dikirim.",
  badRequest: "Permintaan tidak valid.",
  unauthorized: "Anda tidak memiliki akses.",
  forbidden: "Akses ditolak.",
  notFound: "Data yang diminta tidak ditemukan.",
  conflict: "Data sudah ada.",
  rateLimitExceeded: "Terlalu banyak permintaan. Silakan coba lagi nanti.",
  internalServerError: "Terjadi kesalahan internal server.",
  serviceUnavailable: "Layanan sedang tidak tersedia. Silakan coba lagi nanti.",
};

export const screeningMessages = {
  clientTokenUuid: "Format token klien tidak valid. Harus berupa UUID versi 4.",

  personaRequired: "Persona wajib diisi.",
  personaInvalid: "Persona harus salah satu dari: 'Orang Tua / Anggota Keluarga Balita', 'Kader Posyandu', 'Tenaga Kesehatan / Bidan', atau 'Surveyor / Peneliti Lapangan'.",

  kelurahanRequired: "Nama kelurahan wajib diisi.",
  kelurahanMin: "Nama kelurahan minimal 2 karakter.",
  kelurahanInvalid: "Nama kelurahan tidak valid. Harus salah satu dari daftar kelurahan di Bontang.",

  ageMonthsRequired: "Usia balita (bulan) wajib diisi.",
  ageMonthsInteger: "Usia balita harus berupa bilangan bulat.",
  ageMonthsRange: "Usia balita harus antara 0 dan 59 bulan.",

  genderRequired: "Jenis kelamin wajib diisi.",
  genderInvalid: "Jenis kelamin harus Laki-Laki atau Perempuan.",

  weightKgRequired: "Berat badan (kg) wajib diisi.",
  weightKgPositive: "Berat badan harus diisi dengan angka positif antara 0.1 hingga 30 kg.",

  heightCmRequired: "Tinggi badan (cm) wajib diisi.",
  heightCmPositive: "Tinggi badan harus angka positif antara 30.0 hingga 130 cm.",

  bblrOptionRequired: "Pilihan BBLR wajib diisi.",
  bblrOptionInvalid: "Pilihan BBLR tidak valid. Pilih 1 (Normal), 2 (BBLR), atau 3 (Tidak Tahu).",

  exclusiveAsiRequired: "Pemberian ASI Eksklusif wajib diisi.",
  exclusiveAsiInvalid: "Pilihan ASI Eksklusif tidak valid. Pilih 1 (ASI Eksklusif), 2 (Tidak Eksklusif/Formula), atau 3 (Belum 6 Bulan).",

  mpasiAgeRequired: "Usia pemberian MPASI wajib diisi.",
  mpasiAgeInvalid: "Usia pemberian MPASI tidak valid. Pilih 1 (<6 Bln), 2 (Tepat 6 Bln), 3 (>6 Bln), atau 4 (Belum MPASI).",

  animalProteinRequired: "Pilihan protein hewani wajib diisi.",
  animalProteinInvalid: "Pilihan protein hewani tidak valid. Pilih dari opsi yang tersedia (1-5).",

  cleanWaterAccessRequired: "Akses air bersih wajib diisi.",
  cleanWaterAccessRange: "Pilihan akses air bersih tidak valid (pilih angka 1 sampai 4).",

  sanitationAccessRequired: "Akses sanitasi wajib diisi.",
  sanitationAccessRange: "Pilihan akses sanitasi tidak valid (pilih angka 1 sampai 4).",

  smokeExposureRequired: "Riwayat paparan asap rokok wajib diisi.",
  smokeExposureRange: "Pilihan paparan asap rokok tidak valid (pilih 1 atau 2).",

  motherEducationRequired: "Pendidikan ibu wajib diisi.",
  motherEducationInvalid: "Pendidikan ibu tidak valid. Pilih 1 (Tidak Tamat/Tamat SD), 2 (SMP), 3 (SMA/SMK), atau 4 (Diploma/Sarjana).",

  economicQuintileRequired: "Kuintil ekonomi wajib diisi.",
  economicQuintileRange: "Kuintil ekonomi tidak valid (pilih angka 1 sampai 5).",

  diarrheaHistoryRequired: "Riwayat diare wajib diisi.",
  diarrheaHistoryRange: "Riwayat diare tidak valid (pilih 1 atau 2).",

  posyanduKiaRequired: "Kunjungan Posyandu/KIA wajib diisi.",
  posyanduKiaInvalid: "Kunjungan Posyandu/KIA tidak valid. Pilih 1 (Rutin + Ada KIA), 2 (Kadang-kadang), atau 3 (Tidak Pernah/Jarang).",

  sourceTypeInvalid: "sourceType harus salah satu dari: 'PWA_DIRECT_USER', 'RISKESDAS_KEMENKES', 'SURVEY_CSV_UPLOAD', atau 'EXTERNAL_HEALTH_API'.",

  shareHashNotFound: "Hasil skrining tidak ditemukan berdasarkan share hash.",

  screeningFailed: "Gagal memproses skrining. Silakan coba lagi.",

  zScoreInvalid: "Nilai Z-Score dari layanan ML tidak valid.",

  riskTierInvalid: "riskTier harus salah satu dari: LOW, MODERATE, atau HIGH.",
  riskScoreRange: "riskScore harus antara 0.0 dan 1.0.",

  attributeRequired: (field: string) => `Atribut '${field}' wajib diisi dan tidak boleh kosong.`,
};

export const sessionMessages = {
  clientTokenRequired: "clientToken wajib diisi.",
  clientTokenUuid: "Format token klien tidak valid. Harus berupa UUID versi 4.",
  sessionNotFound: "Sesi tidak ditemukan.",
  sessionCreationFailed: "Gagal membuat sesi. Silakan coba lagi.",
};

export const chatMessages = {
  sessionIdRequired: "Session ID wajib diisi.",
  sessionIdUuid: "sessionId harus berupa UUID versi 4.",
  queryRequired: "Pertanyaan (query) wajib diisi.",
  queryRange: "Pertanyaan (query) harus antara 1 dan 500 karakter.",
  noScreeningFound: "Tidak ada data skrining ditemukan untuk sesi ini.",
  noGuidelineFound: "Tidak ada panduan kesehatan yang cocok dengan data balita.",
  geminiUnavailable: "Layanan AI tidak dapat diakses. Silakan coba lagi nanti.",
  streamFailed: "Gagal mengirim respons chat. Silakan coba lagi.",
};

export const ingestMessages = {
  batchCompleted: "Unggah batch berhasil diproses.",
  sourceTypeInvalid: "sourceType harus salah satu dari: riskesdas atau csv-survey.",
  fileRequired: "File wajib diunggah.",
  fileInvalidExtension: "Ekstensi file tidak valid. Harus berupa file .csv atau .json.",
  apiKeyMissing: "API key wajib disertakan pada header X-API-KEY.",
  apiKeyInvalid: "API key tidak valid.",
  invalidJsonContent: "Isi file bukan format JSON yang valid.",
  emptyRecords: "File tidak mengandung data apa pun.",
  sessionMissing: "Tidak ada sesi aktif untuk mengimpor data.",
  ingestionFailed: "Gagal memproses impor data. Silakan coba lagi.",
  invalidNumericValues: "Terdapat data angka (usia, berat, atau tinggi badan) yang tidak valid pada baris data.",
  fileTooLarge: "Ukuran file terlalu besar. Maksimal ukuran file adalah 10 MB.",
  csvHeaderInvalid: "Header atau kolom pada file CSV tidak sesuai dengan format yang ditentukan.",
  rowValidationError: "Gagal memproses baris {row}: data tidak lengkap atau format salah.",
  partiallyCompleted: "Proses impor selesai dengan beberapa data gagal diproses.",
  persistenceFailed: "Gagal menyimpan data batch ke database.",
};

export const mlServiceMessages = {
  predictFailed: "Layanan ML gagal melakukan kalkulasi Z-Score.",
  connectionRefused: "Tidak dapat terhubung ke layanan ML.",
  invalidResponse: "Respons dari layanan ML tidak valid.",
  timeout: "Layanan ML melebihi batas waktu respons.",
  missingRequiredFields: "Respon dari layanan ML tidak lengkap (data Z-Score atau Risk Tier tidak ditemukan).",
  mlUnreachable: "Layanan analisis ML tidak dapat dijangkau. Pastikan service FastAPI telah berjalan.",
};

export const healthMessages = {
  ok: "Layanan berjalan normal.",
  dbConnected: "Koneksi database terhubung.",
  dbDisconnected: "Koneksi database tidak terhubung.",
};
