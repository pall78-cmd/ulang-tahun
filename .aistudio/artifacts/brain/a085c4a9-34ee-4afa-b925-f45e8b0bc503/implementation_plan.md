# Rencana Implementasi: Perbaikan Render Halaman 5-7, Navigasi Buku 3D Ditarik, Minimalisasi Tombol & Foto Polaroid Baru

Berdasarkan preferensi yang Anda pilih:
1. **Efek Lembar Buku 3D Ditarik**: Mengganti sistem navigasi klik tap-to-slide dengan gesture tarik/geser lembar buku fisik 3D (drag & curl page-turn) yang mulus dan interaktif mengikuti sentuhan atau kursor.
2. **Minimalisasi Tombol Header**: Mengonsolidasikan tombol petunjuk dan kapsul waktu menjadi kluster ikon minimalis yang elegan di sudut kanan atas agar tampilan tidak ramai.
3. **Penyisipan 5 Foto Baru**: Mengganti gambar-gambar awal pada polaroid dan galeri dengan 5 foto baru autentik yang Anda berikan.
4. **Debugging Render Halaman 5-7**: Memperbaiki konflik kelas tampilan CSS (`flex` vs `.page-module`) dan stacking context yang menghalangi rendering halaman 5 (Lentera Refleksi), 6 (Carte Postale), dan 7 (Terminal Transmisi).

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Konfirmasi keputusan interaktif yang telah dipilih:
> - **Interaksi Buku**: Lembar buku 3D interaktif yang dapat ditarik/digeser dari sisi layar atau sudut lipatan (dog-ear), dengan physics rotasi perspektif 3D dan bayangan alami.
> - **Penataan Header**: Tombol petunjuk dan kapsul waktu disatukan menjadi deretan ikon elegan di sudut kanan atas dengan badge halaman yang ringkas.
> - **Foto Baru**: 5 foto baru ditempatkan menggantikan foto-foto awal di polaroid Halaman 2, galeri clipping Halaman 3, polaroid Halaman 4, dan kartu pos Halaman 6. (Video tetap dipertahankan dan siap disusulkan nantinya).

---

### 1. Overview & Core Concept

- **Apa yang Dibangun**: Sebuah pengalaman membaca berkas memori (*dossier retrospective*) yang terasa seperti membuka lembaran buku sungguhan. Lembaran kertas dapat ditarik dan dibalik dengan gerakan jari (mobile) atau mouse drag (desktop).
- **Target Persona & Suasana**: Pengalaman privat, romantis, dan bernuansa arsip vintage untuk Jeva Muafida & Naufal.
- **Nilai Utama**: Menghilangkan kekacauan visual (*clutter*) pada bilah navigasi atas, memulihkan keterbacaan penuh Halaman 5 hingga 7, dan memperindah album dengan foto-foto kenangan asli.

---

### 2. User Experience & Visual Design

#### A. Alur Interaksi Menarik Lembar Buku 3D
- **Tarikan Fleksibel**: Pengguna dapat menyentuh/mengklik tepi kanan atau sudut bawah lembaran, lalu menariknya ke kiri untuk membalik ke halaman berikutnya. Begitu pula sebaliknya dari tepi kiri untuk kembali.
- **Feedback Visual Real-time**: Sudut lembaran melipat dan melengkung secara 3D mengikuti posisi kursor/jari (`transform: perspective(1200px) rotateY(...)`) dengan bayangan lipatan dinamis.
- **Threshold Balik Halaman**: Jika ditarik melewati 20% lebar layar, lembar buku akan membalik secara otomatis dengan kurva pegas (*spring physics*). Jika dilepas sebelum itu, lembar buku kembali ke posisi semula.
- **Petunjuk Lipatan Sudut (Dog-Ear Curl)**: Terdapat aksen lipatan kertas halus di sudut bawah halaman yang bergoyang lembut, memberi tahu pengguna secara intuitif bahwa buku dapat ditarik.

#### B. Header Minimalis yang Bersih
- **Sisi Kiri**: Judul dokumen rapi `DOSSIER // JEVA MUAFIDA` dengan indikator titik merah tenang.
- **Sisi Kanan (Icon Cluster)**:
  - ⏳ Tombol Kapsul Waktu (ikon kapsul/jam pasir minimalis dengan tooltip elegan).
  - 📖 Tombol Panduan (ikon buku arsip minimalis).
  - 🏷️ Nomor Halaman `1 / 7` berbentuk monokrom ringkas.
  - Menghilangkan tombol-tombol tebal yang bertumpuk dan mendominasi layar.

#### C. Distribusi 5 Foto Polaroid Baru
1. **Foto 1** (`IMG-20260607-WA0021.jpg`): Disematkan pada Polaroid utama Halaman 2 (*Confidential Evidence File*).
2. **Foto 2** (`IMG-20260921-WA0022(1).jpg`): Disematkan pada Scrapbook Clipping Halaman 3 (Foto Kiri).
3. **Foto 3** (`IMG-20261010-WA0002.jpg`): Disematkan pada Scrapbook Clipping Halaman 3 (Foto Kanan).
4. **Foto 4** (`IMG-20261002-WA0020(1).jpg`): Disematkan pada Polaroid Logbook Monumental Halaman 4 di atas kalender.
5. **Foto 5** (`IMG-20260402-WA0027(1).jpg`): Disematkan pada Carte Postale Halaman 6 (*Memory Keepsake*).

---

### 3. Key Product Decisions & Trade-Offs

- **Keputusan 1: Mengganti Tap Nav Zone dengan Book Drag Gesture Controller**
  - *Pendekatan*: Menerapkan touch & pointer gesture listener pada container buku dengan perhitungan drag delta (`dx`, `progress`, `rotateY`), sekaligus mempertahankan tombol navigasi footer `[ < KEMBALI ]` sebagai opsi aksesibilitas sekunder.
  - *Alasan*: Menghilangkan dua div invisible 20% di sisi kiri dan kanan (`#nav-l`, `#nav-r`) yang selama ini sering menghalangi klik pada tombol kalender dan foto.
- **Keputusan 2: Pembenahan Stacking Context & Kelas Display pada CSS**
  - *Pendekatan*: Menghapus kelas inline Tailwind `flex` pada tag `<section id="mod-3">` yang bertabrakan dengan `.page-module:not(.active)` (`display: none`), serta memastikan `#candle-stage` pada Halaman 5 memiliki kontrol z-index yang teratur dan transparan setelah dinyalakan.
  - *Alasan*: Ini adalah akar masalah mengapa halaman 5 sampai 7 sebelumnya tidak ter-render atau tertutup oleh modul halaman 4.

---

### 4. Technical Architecture & Data Strategy

```
┌───────────────────────────────────────────────────────────┐
│                    HEADER HUD (Minimalis)                 │
│  [DOSSIER // JEVA MUAFIDA]             [ ⏳ ] [ 📖 ] [1/7]│
└───────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────▼───────────────────────────────┐
│              BOOK FLIP CONTAINER (3D Viewport)            │
│                                                           │
│  ┌───────────────────────┐     ┌───────────────────────┐  │
│  │ Current Page (Rotates)│────▶│ Next Page (Underneath)│  │
│  │  - Pointer / Touch    │     │  - Renders Active View│  │
│  │  - 3D rotateY & Shadow│     │  - Pre-warmed DOM     │  │
│  └───────────────────────┘     └───────────────────────┘  │
│                                                           │
│  [Halaman 1: Cover Monograph]                             │
│  [Halaman 2: Evidence Dossier - Foto Baru #1]             │
│  [Halaman 3: Digital Clipping - Foto Baru #2 & #3]        │
│  [Halaman 4: Kalender Multi-Momen - Foto Baru #4]         │
│  [Halaman 5: Lentera Refleksi (Fix Render)]               │
│  [Halaman 6: Carte Postale - Foto Baru #5 & Video Modal]  │
│  [Halaman 7: Terminal Transmisi (Fix Render)]             │
└───────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────▼───────────────────────────────┐
│                    FOOTER STATUS HUD                      │
│  [ < KEMBALI ]            [ AUTHORIZED ]            [ 1/7 ]│
└───────────────────────────────────────────────────────────┘
```

#### Alur State & Gesture:
1. **PointerDown / TouchStart**: Catat koordinat `startX` dan tentukan apakah tarikan mengarah ke halaman berikutnya (`dx < 0`) atau sebelumnya (`dx > 0`).
2. **PointerMove / TouchMove**: Hitung `progress = clamp(Math.abs(dx) / width, 0, 1)`. Terapkan transformasi 3D `rotateY(± progress * 75deg)` dan gradien bayangan lembar kertas.
3. **PointerUp / TouchEnd**: Jika `progress > 0.2` atau `velocity > 0.5`, jalankan animasi flip tuntas ke halaman tujuan (`next()` / `prev()`), lalu setel halaman baru sebagai aktif. Jika kurang, kembalikan ke `0deg`.

---

### 5. Rencana Pengujian & Verifikasi

- [ ] Verifikasi render Halaman 5 (Lentera dan surat mesin tik tampil sempurna).
- [ ] Verifikasi render Halaman 6 (Carte Postale dengan foto baru dan trigger video berfungsi).
- [ ] Verifikasi render Halaman 7 (Terminal Transmisi chat aktif dan dapat mengetik/mengirim pesan).
- [ ] Verifikasi interaksi tarik lembar buku 3D di desktop (mouse drag) dan mobile (touch swipe).
- [ ] Verifikasi kelima foto polaroid baru termuat secara jernih tanpa broken image.
- [ ] Verifikasi header bersih dan tidak ramai dengan modal petunjuk dan kapsul waktu yang tetap berfungsi saat diklik.
- [ ] Jalankan `compile_applet` dan `lint_applet` untuk memastikan kode bebas galat.
