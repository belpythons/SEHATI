# **FUNCTIONAL DESIGN DOCUMENT (FDD)**

## **Modul 1: Frontend Client Progressive Web App (SEHATI)**

| Key Meta | Detail Specification |
| :---- | :---- |
| **System Name** | SEHATI (Sistem Edukasi Holistik dan Deteksi Stunting Terintegrasi) |
| **Sub-System** | Client Layer PWA (Progressive Web App) |
| **Document Version** | 1.0.0-PROD |
| **Target Framework** | React 19, TypeScript, Vite, Tailwind CSS, Shadcn UI, Framer Motion |
| **Status** | Approved for Execution |

### **1\. Requirements & User Journey**

#### **1.1 Business Description**

Modul Frontend merupakan antarmuka publik yang dapat diakses melalui browser ponsel atau desktop tanpa hambatan login (*Zero-Login Friction*). Modul ini bertugas membimbing pengguna (Orang Tua, Kader Posyandu, Surveyor) dalam mengisi kuesioner parametrik berbasis panduan ramah pengguna, serta menyajikan dashboard analitik interaktif berbasis widget *drag-and-drop* dan konsultasi AI berbasis streaming.

#### **1.2 User Flow Overview**

\[Landing Page\] ──(Klik CTA)──► \[Questionnaire Page\] ──(Submit Data)──► \[Analytics Dashboard Page\]  
      │                                                                           │  
      └──► \[Offline Indicator\] (Cache IndexedDB jika tanpa koneksi)              └──► \[AI Chat Drawer (SSE Stream)\]

### **2\. Page Specifications & Component Breakdown**

#### **2.1 Page 1: Landing Page (/)**

* **Floating Header Navbar:** Logo SEHATI, indikator status koneksi (Online/Offline), tombol "Pasang Aplikasi" (Prompt Instalasi PWA), tombol "Mulai Skrining".  
* **Hero Section:** Tagline persuasif, ringkasan manfaat, dan CTA utama menuju kuesioner.  
* **Bontang Health Context Section:** Statistik singkat prevalensi stunting di Kota Bontang (27,4%) dan urgensi pencegahan dini.  
* **Feature Highlights Grid:** 3 Kartu fitur utama (Deteksi Otomatis Z-Score WHO, Prediksi Risiko Naïve Bayes, Asisten Konsultasi AI Gemini).

#### **2.2 Page 2: Questionnaire Form Page (/questionnaire)**

Terdiri dari 3 langkah terpandu (*Multi-step Form*) menggunakan Framer Motion untuk animasi transisi:

* **Step 1: Seleksi Persona & Domisili:**  
  * Radio Cards Persona: ORANG\_TUA, KADER\_POSYANDU, SURVEYOR.  
  * Dropdown Kelurahan (15 Kelurahan di Bontang).  
* **Step 2: Data Fisik & Antropometri Balita:**  
  * Jenis Kelamin (L / P).  
  * Usia Balita (0–59 Bulan).  
  * Posisi Pengukuran (Terlentang / Berdiri).  
  * Berat Badan (kg) & Tinggi Badan (cm).  
* **Step 3: Determinan Lingkungan & Pola Asuh:**  
  * Pertanyaan pilihan ganda parametrik (BBLR, ASI Eksklusif, MPASI, Air Bersih, Jamban Sehat, Paparan Asap Rokok, Kuintil Ekonomi, Pendidikan Ibu, Riwayat Diare).  
* **Control Actions:** Tombol "Sebelumnya", "Simpan Draft (Offline)", dan "Lihat Hasil Analisis".

#### **2.3 Page 3: Analytics & Consultation Dashboard (/analytics & /analytics/:shareHash)**

Layout widget berbasis grid interaktif yang dapat digeser (*drag-and-drop*) menggunakan @dnd-kit/core:

* **Widget 1: Growth Chart WHO (Standar Deviasi):** Plotting posisi titik balita pada kurva baku ![][image1], ![][image2], dan ![][image3] menggunakan Chart.js / Recharts.  
* **Widget 2: Risk Gauge Meter:** Visualisasi derajat kerentanan stunting (LOW, MODERATE, HIGH) menggunakan react-gauge-component.  
* **Widget 3: Determinant Radar/Pie Chart:** Diagram faktor pemicu utama hasil olahan Naïve Bayes.  
* **Widget 4: Actionable Local Nutrition Table:** Tabel rekomendasi intervensi makanan tambahan berbasis pangan lokal Kota Bontang (ikan laut segar, dll).  
* **Widget 5: Shareable Link Box:** Tombol penyalin tautan publik hasil analitik (/analytics/:shareHash).  
* **Widget 6: Floating AI Chatbot Drawer:** Drawer interaktif untuk berdiskusi dengan Gemini AI yang menggunakan protokol SSE (@microsoft/fetch-event-source).

### **3\. Field Validation & Parameters Matrix (Frontend)**

| Component Name | Field Name | Validation Rules | Error Message |
| :---- | :---- | :---- | :---- |
| PersonaStep | personaType | Required Enum | "Pilih peran Anda terlebih dahulu." |
| PersonaStep | kelurahan | Required Dropdown | "Pilih kelurahan domisili di Kota Bontang." |
| AntroStep | childAgeMonths | Min: 0, Max: 59, Integer | "Usia balita harus antara 0 hingga 59 bulan." |
| AntroStep | weightKg | Min: 1.0, Max: 30.0, Float | "Berat badan tidak valid (1.0 \- 30.0 kg)." |
| AntroStep | heightCm | Min: 30.0, Max: 130.0, Float | "Tinggi badan tidak valid (30.0 \- 130.0 cm)." |
| DeterminanStep | All Boolean Fields | Required Selection | "Mohon pilih salah satu opsi yang tersedia." |

### **4\. Non-Functional Requirements (Frontend)**

* **PWA Reliability:** Menggunakan vite-plugin-pwa dengan Service Worker strategi *Cache First* untuk static app shell.  
* **Offline Questionnaire Buffer:** Menggunakan IndexedDB untuk menyimpan draft kuesioner saat internet mati, dan sinkronisasi otomatis saat online kembali.  
* **Performance Metric:** Lighthouse Performance Score ![][image4], First Contentful Paint (FCP) ![][image5].

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADcAAAAaCAYAAAAT6cSuAAADaUlEQVR4Xu1WS2gUQRCdJTn4F9G4mN1s725Wl4DgQTwoEUFEzEEFUeLnrhBQ8CSoqIgieNIQPcRPEDEQFW/BIDkIHgM5GXIKRFkUERVEhfhJfI/pjpVKz2RjDrphHxQzXa+6urq7qruDoIoq5oJEMplcrJXzAg0NDeuNMRfxm9DcnAHH2yEjmUzmdZmyA/Zb+I/vhJAvkDf2/xekN5/Pr9PjacDuTDab3cX/+vr6RWh32/7OL//7U6nUSmt/WPHfGdNUryESIDvgvAeSZZtK6G5Dxt2gQA3+t0E3ipXe5Dqj3Q75JnVEOp1eC/0IZBhBpSUngckvh81dTGqV1OdyuQ3Qf0bQffC1UHJEsVhcCv4pYtobRO04nCRh8LCxsXG108HhCnQc4ETgOOX0dXV1S6C774K17eeQIR0cAb/3wE3A327NOXDFYXdB69HvCPtCTmuOYAzgnjBWzU3COj8pdW7VII/RrHV6O+l2rppt59F+i29XoFZPTHwMsllyAsyaqz6e40DGo9LNlkZnELVrBIwO6LowdtXAnZJ65jx0RwPrEKm4h3ZYnGPSjoCu1YR10RGIBZJg1nBhmJpSb1PuhVGZI8HYGKfWzwgT1tsPOGjWnARsLptwZ1ogaygI2KDfefy/wwQPwaxG93MAfxB2bVoPXRPkA6QXNgs0Tx24boyzUXOxsKk3rd40RNq95+rj22nlDmQIcqlQKCzT/QRqYXOD14AmoN9nPJnjwLh4TjBWzcWCqwHHX42qN41MTL1h4KwJT8pBeVBJ2P63fDtjZq63ZvA3g7h688FE1JtGXL0RWXtSQlo0R7Afx9J6UW+lqCvkb+stYVOsnHrz3m8E7yX074taffImrOuc5kxYu68g/b4nmfXdhdouai4WzGEzu3rz3m+Y8FZwY9idZ7TVPFMf3PXAk1Y8QU2Y0g98PPq1ov85HxcLDmrKqDfz5zTTAdSY8OT8BHnJk1NwkzDiueVBAtw12AxzolLPUgDXo6+OSPCOg6NByEcz/Z04zAk7W7sjTBlnw3uslAnfmCXIT8go2sd9TyaCgdm0koFPgX2SPeJYsD2BbxtkgJP2pep/A9YyAj2r9R4kuPCw34+F2Fn2bv1LINgrxvPcqngwFZmSFbELswUPkah7seJhwgdCk9ZXUUUV8wO/AcATFUyKzb+CAAAAAElFTkSuQmCC>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADsAAAAaCAYAAAAJ1SQgAAADnUlEQVR4Xu1WTUhUURR+okXRH/3Y0Mz47sw4JTZtYmhhFBFEKGELCzKkZQRimzZCLZIoqHZpQaTSD1QQUW0G+tlE7gqEIKlNZCFFSUUQgZbV9/XuwzOn955BEjLNBx8z73z3nHveuffcdx2njDL+GXK53Ox8Pj9L20sRFcaYIzU1NWu0MK3AJOtd132F3x+Cn8HX9v8EWMhkMqukXzKZXAK/O1b3/fh/BBy3z8/AHRheIX01MCYN9iHmXPu8GRwVcckPmG8Pdc6N5wGl34jFYvOKI4cAg7vBL6juOmlH4JWwPwefJhKJpNQIJLAF2nfwoLQzcWgXYJ9AzO1S00ilUq0Yu1fb4dvH2NAbtUZAawEL2Wx2odZCUV1dPR9O98GheDy+TOuY7CKrh4SatQZbJxPiSwdozfSjv9Z8QJuDMb0Ym5F2PC+G/RE4ElRkggUG27Q9EpwITm/we95RW04UYgxskBpQBdt1cBgrmVCaXwi+bJfWfLBPMeYM/lZJO2z14HuwwIJIjbBFuoI58lqLBLeZTWqf1mDbZbxePO2ohPiCfNGghPCcMt72fxy2MgT0dgxtDbBzi3I3dWqN4Nzwu8YdoLVIIOgx461cE7iCTKfTBoEO4/9bBN2NYZXaD/oG6F+hn/D9LJnoC7Anqp9w6C3ibsJcMa0Z7wwJbA+CdujnnCkOvyKIbTrKiRnAsh8cAo+GJWy3KQ+nm8KPHIB2C1ytfSQwrgE86aiE6+rqFjCGCWkPws49ff0qtuJgbW3tcqk5Ef3Ky4Et3HjYyhAI3xWkmyn61fHm7nens1+JlD2JwSZpj+pXwrUnMdinNYKnPmO7AT1nbL8a9Tnz8Tf9Gvh9Jey38rYJ6B0+0x6WEOwdNuFurRFIthHaIW0n7Balb1GBfdAXPK7tkZjq+4oCbIQ2hsB3OVZqNqHfikDg9F0Kn4fQP4JrtQ5UQD8Vtg3hc8CELAAPNWhXsRBZrUXCTPbGZae4XytZVZvsE57MQmNl+Y0rmIAPPmxp6A+Md2VskZoPjjHieqiBIuSMd13skHZ7TbwUFjcQdsVemsl75a87revdkXm3/QYO43m/TIgrBvs9M3n3Jd/Rz/ryTk326iJIoBitGNOu7RLQt4GfjPdybYh/Fr+D8N2kx85k8CTtcdX1MAi82GNXbcXYnfCpdwK+9TMaTJov66jbWEmC25fbWNtLDux/nsJB18OSAw7GuD2Y/vw+W0YZZfxX+AmkUS6QoNosawAAAABJRU5ErkJggg==>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEcAAAAaCAYAAADloEE2AAADoUlEQVR4Xu1YPWtUQRR9IVEURfEjLu5u3uxuoqBrI4tFRLFRMEVEYmH8AUEIWlmIWhjEFFoEzCqCiaiFnaBNwC9C0M5CEAzaiFGCoiI2IiR+xHPyZuTmvv0ib0Ex78Bh38y5d96dNzN3ZtbzYsT4b5DP5xcXCoVFuj6G5zUYY860tLRs0cJfBYLa7vv+W/zOCH4F39nnn+BILpfbKP3S6fRq+N2zuvPj8yQ4bcsvwQMwb5C+GrDJgsNocynLra2t61AeZVy1ELYD9YwnBDgNgt8wettkPV66AfWvwBepVCotNQIB7Yb2Czwp69lRaNcZINrcJzWNTCbTDdseUd7L9+F3l1tqKHfYDl70bOfQbhLlUfnuesQzB83NzcvhNAaOJ5PJtVpHkDcYGBrv1BrqjjMYBlVC66Qf/bXmAG0JbIZgm7NVXGIDKO+RdqjrZ1u6Y/b9Xao873hCYGBweo/fa56acuLDTYHtUgOaUHcLnMDIpJTmAmUwfVpzYJ6BzSU8NrHMwYHfZb7X2SQSiWWweWhjdB9xFmj7hJjtkeMJgaNhnQ5rDXUHTbB2OZ1nO+DAABgIOMIZIDWUMyZYjs9KLUcH6L0w7XZldGAzyvuljRs8cEx+NKv1MEfxuR7xhGCCKcuZwXW9nsxmswYvPo3nD2j3EMwatR/0HdC/Qz/n/Cy7wNdgsa2tbYX2c0CSX8nZincltCZh45oB+7UmETWeEMSy+cRA8XvF8io4Dp4t16Cdpkx+t4Uf+RjaHc4C7SMBu3bwvFdl9zBl8o1G1HhCcFOWH8ZTQYqp+NRNXYGy65s7jP3Q036JxOiA5vsq6YQYvFC+UYgcTwiV8g2RsTsV2CHrK61vwrc7AzisNYKJl23DbpXWJNzg8QPpfCMRNZ6SMGXON4Q9G9w1JbZGlllv1HnCAfVHbDCDWiMywVnmlK7XcINnquebSPGEUO18g8B2QptCR+7rUfMrnCewG6yBzxPoX8CtWgcaoF+Ab0ELGvwo7FSt+Wae8YQBw03gZ/CmNzffNJpgh2Bjz7lzCY2jzoPbCDipt0XUZaE/MsGR/c/hTII2RlwXyqHWfBM1njmwM+KNCaYZOXsH8YN7Cu8iP8AJlI/KDnAEUP/Avsj5fqSf9eWdjBzSQUog2G7Y9Op6gh31g2O+u9s5unvSMWdbr3j+JXBXKVaaCQsWJljKRU+dtmN44etCDAvmL+5S1a4LCxL2/xcm4orXhRgxYsRYKPgNd6eMdD9liBAAAAAASUVORK5CYII=>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAZCAYAAABHLbxYAAACfElEQVR4Xu2VTYiNURzG39sQIvJxXe7XuV+RDVOXlKLIRvkKCxkLsVKKHWmymWxGNlJqNqJkbSFl1PWxmSLZDDU78rGymdhYGL/HPec6Hfe9c91rFvI+9XTe9zn/83+fc87/nDeKEiT4j1Eul9cbY0bhGDyMNBDG5PP5RfQdszGjGhPGtEDATjhRKpWO1uv1+WF/D0iR6wScKhQK2/k46c0deFvGXFClUlmGNg5H0un0EuIHeX5tJ9UedmYn4St4KpPJLA5jukWxWKyT4ys842kV3j9qMTztPNpz2uVO430IvmFyGae1hVZUyQh+AYdrtdrSMGY2MO4anMHAPqdpxdAew/vkXyhzMsnzLX8sO7AF/Qvtfl/vhAEG7ILP4JVcLrcyDIiDPt7B6Fu4Fm6An0Oj3m5c9vVuoHrbysAGvK6PhAEhZjE6zbZucobijIZ616AEFpDkEkneU8+1sN+HLZ0ZeMhptkY/yYTMaBKKCQ31bNQ/ZCQ5280hs6f5EfE37S2iXbmA9t0Zpd3zV4zKkIwx6KVW6E+vLSa4wjSvpA+Mn4Kn4VNjazTOUJz+G3TKCRw2zXv1QNTmku4F2Wx2FTknza9T/7MUQkPOKLzo6y1olqZ5WBpwW9SHQW6IPB98golzvKakWQPT2h29h9eVG0vcbrRvap3WAuJegu9xGjdGNnE/8FblLq/zVDY8j/GNhzLoxR2H7+grWynF8wicUJ27uDmDXa0HMgeHZJB2nHaNH6cJYPQGfQ36DlqTkzwP+nFzCpng77IZI0dYnXVR/E6l1K84dnRHx0OrTv1bTbNOO7Jara6O+qjfvqClttvUDa/KcJgjQYIE/wh+AI2oxwG/Z/59AAAAAElFTkSuQmCC>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAAZCAYAAABkdu2NAAACtklEQVR4Xu2WTahMYRjHZxpCXIqZJvN15kvTTaTGx8YCsbiLG1GSURaS200pi6ukLGRD1JUoJVFcpZSFZnNr5C6IsrORBcpVlLJwsxG/v3NezrxmzNw5E6Xzr39znuf9v8/7PO/nRCIhQoT43xHL5XK788BuaIdMJrPAcZy98Aq8QP+tuGO27p9BCZLUMDWNk+Bb+Bm7autaoVgsLkF/F/3BbDZb4vck9ldYV5ut7zuSyeTCarU61/b74a3AEAVu8hLsukC0h+GNcrm82HNFsU/Bb8Q41iTuJwqFQoVB7sBbDJ6w29tBSc2mQCbluoqBR42PlVyHPQMnNcF+fVBEGXADgRvwYqlUytqCTuihwB3on6PfZnzqqxjwQSKRWCSfckG7Hx5ix6xCsxH3nJ+BOiBGsC1wCp5Np9PLbEG3mG2BrUD/muOu6jnZOp98T7CrHBFcgg1T/J8QY0a2I34MT/jOQc8IWqAuFnJ6CF+oGG1R4k3CnUaTSqXixL/ctkBdGgTYQ6dnCI/0c58HLDBKvzH6v4SDcpDnfL7vw3dwlO25goWYV6lUBqS3+rtAuBm+ovOIbkC7PQiCFEi/XXCKvPJ+P+Ya4r1x3G0rfoJDfs1vsFZxrB/bU+i1QK+4OhO+VLa2H3ZNKyhb+XK7rsV3HL6GHxhjZXOU1jDn8KkT8IIROhSosYQfSRtw1tbT56b/YcceRDcej8cHiHWNwtOmje8y7dP4h42vGzQ9EXC5LegGXoEzesvsNvwHHHeLTUS8K16FOO6Ze69taIj9EZ72VrKBb5+Jw4Qk8T1qM4kdESXAagLU4VVYsAU2dEkx2G0vKRVgOA3PG51mHPuLjkTEuyDyvx76VqypQDT34BP9Ou7/Vd36oyZGzyCIHp0z2hJ2219E1NzyKlar1+mvY4gQIUKECNEG3wEVM8NIDy4HigAAAABJRU5ErkJggg==>