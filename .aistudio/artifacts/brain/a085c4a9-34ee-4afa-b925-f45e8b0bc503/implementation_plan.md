# Rencana Implementasi: Refaktor Menyeluruh UI/UX & Pembersihan Basecode

Pembaruan ini bertujuan untuk merestrukturisasi sistem interaksi secara menyeluruh, membersihkan kode usang (*dead/experimental code*), serta menstabilkan tata letak scrapbook agar nyaman, estetik, dan tidak berantakan.

---

## 1. Analisis Kebutuhan & Hasil Klarifikasi Pengguna
1. **Dekorasi Tetap (Fixed Layout)**: Menghapus fitur bebas menarik Polaroid, washi tape, dan perangko. Seluruh foto dan dekorasi kembali menjadi elemen estetika tetap dengan tata letak yang presisi dan rapi.
2. **Pembalikan Halaman Terfokus**: Interaksi membalik buku dibatasi murni pada area lipatan sudut (*corner dog-ear peel*). Seluruh permukaan halaman tidak lagi di-hijack oleh gesture dragging horizontal, sehingga pengguna dapat melihat dan membaca konten dengan nyaman.
3. **Lipatan Sudut Murni Tanpa Label/Tombol**: Menghapus teks petunjuk seperti `Tarik ❯` atau `❮ Balik` pada lipatan sudut buku. Tampilan menjadi murni lipatan kertas realistis yang dapat disentuh atau ditarik.
4. **Pembersihan Interaksi Washi Tape**: Menghapus listener klik dan pop-up pesan rahasia (*Easter egg*) pada washi tape, menjadikannya murni dekorasi visual.
5. **Debugging & Refaktor Basecode Total**:
   - Menghapus method `initScrapbookDrag()` dan seluruh tracking koordinat drag dekorasi di `src/main.ts`.
   - Menghapus kelas CSS usang seperti `.is-lifting`, `.is-settling`, dan `.scrapbook-draggable` di `styles.css`.
   - Memastikan Halaman 3 (3 perangko vintage, Instagram Reel, dan Polaroid Jeva) tampil seimbang, proporsional, dan tidak terpotong.

---

## 2. Perubahan Rinci per File

### A. `src/main.ts`
- **Hapus `initScrapbookDrag()`**: Menghapus implementasi drag-and-drop dekorasi beserta seluruh manipulasi `translate3d`, `classList.add('is-lifting')`, dan peredam event klik.
- **Sederhanakan `initBookGestures()`**:
  - Pasang pendeteksi sentuhan/tarikan murni pada elemen lipatan sudut (`#corner-peel-r` dan `#corner-peel-l`), bukan pada seluruh `#module-viewport`.
  - Dukung klik langsung atau tarikan sudut pendek untuk membalik lembaran dengan animasi lengkungan kertas 3D yang sudah terpasang.
- **Hapus Easter Egg Washi Tape**: Menghapus kode pembuatan `.hidden-note` saat pita washi diklik.
- **Perbarui Antarmuka `DossierSystemType`**: Sinkronkan definisi tipe dengan menghapus method yang sudah tidak digunakan.

### B. `styles.css`
- **Hapus Selektor Usang**: Bersihkan `.is-lifting`, `.scrapbook-draggable`, dan aturan kursor `grab`/`grabbing` dari dekorasi.
- **Perhalus `.corner-peel`**:
  - Hapus aturan kelas `.peel-hint` (teks label).
  - Berikan efek bayangan lipatan kertas organik (*soft book paper curl shadow*) yang elegan dan responsif terhadap *hover* dan *active*.
- **Optimasi Tata Letak Halaman 3**: Pastikan 3 perangko pos vintage (Kyoto 15¢, Paris 20¢, New York 25¢) berpadu harmonis dengan kliping Instagram Reel dan Polaroid Jeva tanpa *scrolling* yang mengganggu.

### C. `index.html`
- **Pembersihan Sudut Buku**: Hapus elemen teks `<span>Tarik ❯</span>` dan `<span>❮ Balik</span>` dari `#corner-peel-r` dan `#corner-peel-l`.
- **Hapus Atribut Drag**: Bersihkan kelas `scrapbook-draggable` dan tooltip `(Dapat ditarik)` dari seluruh Polaroid, perangko, kliping koran, dan washi tape di semua halaman (Modul 0 sampai 6).
- **Pertahankan Seluruh Konten & Media**:
  - Halaman 1: Kover kilas balik & Polaroid vinyet Jeva.
  - Halaman 2: Berkas rahasia, linimasa subjek, & tombol dekripsi video.
  - Halaman 3: Kliping Instagram Reel, Polaroid Jeva, dan 3 perangko pos vintage.
  - Halaman 4: Logbook kalender multi-momen & Kapsul Waktu.
  - Halaman 5: Lilin refleksi & surat mesin tik bertanda tangan.
  - Halaman 6: Carte Postale & pemutar video montase kenangan.
  - Halaman 7: Terminal transmisi pesan harapan.

---

## 3. Rencana Verifikasi
1. **Kompilasi & Linting**: Jalankan `compile_applet` dan `lint_applet` untuk menjamin tidak ada *type error* atau referensi hilang.
2. **Uji UI & UX Lembaran Buku**:
   - Tarik atau ketuk sudut lipatan buku di kanan bawah: halaman membalik mulus ke depan.
   - Tarik atau ketuk sudut lipatan buku di kiri bawah: halaman kembali ke belakang.
   - Tidak ada teks atau tombol yang merusak kesan estetik buku vintage.
3. **Uji Stabilitas Dekorasi**:
   - Sentuh/klik Polaroid, washi tape, dan perangko: posisi tetap terkunci rapi, tidak melayang atau bergeser.
   - Scroll vertikal di halaman yang memerlukan pembacaan (seperti Halaman 1, 4, dan 5) berjalan mulus tanpa terinterupsi pembalikan halaman tak sengaja.
