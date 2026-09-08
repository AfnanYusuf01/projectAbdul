# Spesifikasi Teknis - Redesain Dashboard Admin (Desain Willow)

Spesifikasi ini mendokumentasikan desain antarmuka baru untuk Dashboard Portal SOC Jatelindo yang mengadopsi bahasa desain modern SaaS "Willow".

---

## Pernyataan Masalah (Problem Statement)

Tampilan dashboard SOC saat ini menggunakan gaya *dark glassmorphism* dengan kontras tinggi yang kurang nyaman digunakan untuk pemantauan jangka panjang oleh operator dan analis keamanan. Tata letak elemen data belum terstruktur dalam hierarki visual modern kelas enterprise: metrik kunci belum menonjol, visualisasi grafik volume dan distribusi saluran pembayaran belum tersedia, serta ringkasan aktivitas nasabah belum tersaji dengan estetika yang bersih dan intuitif.

---

## Solusi (Solution)

Meredesain antarmuka dashboard admin secara menyeluruh dengan mengadopsi bahasa desain modern **"Willow"**:
1. Menjadikan **Clean Light Mode** sebagai tema bawaan (*default*) dengan palet latar `#F4F6FA`, kartu putih murni `#FFFFFF` berbayangan halus, dan aksen *Royal Blue* `#2563EB`.
2. Menyediakan tombol switch interaktif **Sun/Moon** di header kanan atas untuk beralih antara Mode Terang dan Mode Gelap secara mulus.
3. Menghadirkan navigasi sidebar minimalis dengan logo geometris modern Jatelindo, menu aktif berbentuk *pill rounded* biru solid dengan teks putih, dan badge alarm dinamis.
4. Menyusun hierarki dashboard dalam 3 baris utama:
   - **Baris 1 (Kartu Metrik)**: 4 kartu ringkasan, dengan kartu pertama berlatar *Royal Blue* solid dan tiga kartu lainnya putih beraksen warna lembut (ungu, oranye, biru muda).
   - **Baris 2 (Visualisasi)**: Grafik batang ganda (*dual-bar chart*) dengan filter rentang waktu (*Daily, Weekly, Monthly*) berdampingan dengan diagram donat (*donut chart*) distribusi saluran transaksi.
   - **Baris 3 (Data Riil)**: Tabel *Latest Transaction* bersih dengan tautan kode ID biru dan panel daftar *Nasabah Aktif* lengkap dengan avatar dan stempel waktu relatif.
5. Mempertahankan 100% integrasi fungsional backend dan model domain keamanan transaksi Jatelindo.

---

## Cerita Pengguna (User Stories)

1. **Sebagai Operator Keamanan (SystemOperator)**, saya ingin melihat ringkasan total transaksi aman pada kartu metrik beraksen biru menonjol di baris teratas, sehingga saya dapat langsung memverifikasi status operasional sistem secara sekilas.
2. **Sebagai Operator Keamanan (SystemOperator)**, saya ingin melihat telemetri throughput (TPS) dan rata-rata latensi kriptografi pada kartu metrik, sehingga saya dapat memantau performa pemrosesan secara *real-time*.
3. **Sebagai Operator Keamanan (SystemOperator)**, saya ingin menggunakan bar pencarian di header atas, sehingga saya dapat mencari transaksi atau data nasabah dengan cepat.
4. **Sebagai Analis Fraud (FraudAnalyst)**, saya ingin melihat jumlah alert fraud aktif pada kartu metrik beraksen oranye, sehingga saya dapat segera mengetahui apakah ada ancaman baru yang memerlukan investigasi.
5. **Sebagai Analis Fraud (FraudAnalyst)**, saya ingin melihat grafik tren volume transaksi (dual-bar) dengan filter harian, mingguan, dan bulanan, sehingga saya dapat mengidentifikasi pola anomali lonjakan transaksi.
6. **Sebagai Analis Fraud (FraudAnalyst)**, saya ingin melihat diagram donat persentase distribusi saluran pembayaran (QRIS, Virtual Account, Kartu), sehingga saya mengetahui saluran mana yang memiliki aktivitas transaksi tertinggi.
7. **Sebagai Analis Fraud (FraudAnalyst)**, saya ingin melihat tabel transaksi terbaru yang bersih dengan informasi kode transaksi, nama nasabah, waktu, nominal, dan status kecurigaan, sehingga saya dapat meninjau alur transaksi terbaru secara cepat.
8. **Sebagai Analis Fraud (FraudAnalyst)**, saya ingin melihat panel daftar nasabah aktif dengan avatar dan ID akun di sisi kanan tabel transaksi, sehingga saya dapat memantau siapa saja pengguna yang sedang aktif bertransaksi.
9. **Sebagai Admin Keamanan (SecurityAdmin)**, saya ingin melihat jumlah aturan fraud yang aktif pada kartu metrik kedua beraksen ungu, sehingga saya dapat memastikan seluruh filter proteksi beroperasi.
10. **Sebagai Pengguna Terautentikasi**, saya ingin dashboard tampil dengan tema terang (*Light Mode*) yang bersih dan elegan secara otomatis saat pertama kali dibuka, agar mata tidak cepat lelah saat bekerja.
11. **Sebagai Pengguna Terautentikasi**, saya ingin dapat mengklik tombol Sun/Moon di header kapan saja untuk beralih antara Mode Terang dan Mode Gelap sesuai preferensi lingkungan kerja saya.
12. **Sebagai Pengguna Terautentikasi**, saya ingin melihat nama dan peran saya (misal: "Admin - Security Admin") serta foto avatar saya di pojok kanan atas, sehingga saya yakin sedang berada di akun dan hak akses yang benar.
13. **Sebagai Pengguna Terautentikasi**, saya ingin menu aktif di sidebar disorot dengan bentuk pill bulat warna biru terang bertuliskan warna putih, sehingga posisi navigasi saya selalu terlihat jelas.
14. **Sebagai Pengguna Terautentikasi**, saya ingin melihat badge indikator angka merah pada menu Alert Fraud jika terdapat tiket fraud yang belum diselesaikan.
15. **Sebagai Pengguna Terautentikasi**, saya ingin dapat keluar dari sistem dengan mengklik tombol Logout di bagian paling bawah sidebar, sehingga sesi keamanan saya segera ditutup.

---

## Keputusan Implementasi (Implementation Decisions)

### 1. Token Desain & Sistem Styling CSS
- Memperbarui sistem desain global pada stylesheet utama untuk mendukung palet Willow:
  - Latar aplikasi utama: `#F4F6FA` (Light) / `#0B0F19` (Dark).
  - Latar kartu kontainer: `#FFFFFF` dengan batas halus `#E2E8F0` dan bayangan lembut `0 4px 20px -2px rgba(0, 0, 0, 0.05)`.
  - Aksen primer (*Royal Blue*): `#2563EB` dengan varian hover `#1D4ED8`.
  - Tipografi modern sans-serif (Outfit / Inter) berpadu dengan angka berbobot tebal (*font-weight: 600 - 700*).
- Menambahkan kelas variabel CSS pengalih tema (`.theme-light` dan `.theme-dark`) yang dapat dikontrol melalui state di React.

### 2. Modul Sidebar Navigasi
- Memperbarui header sidebar dengan logo heksagram/bunga geometris biru khas Willow dan teks brand "JATELINDO" (*Transaction SOC*).
- Mengubah gaya item navigasi menjadi rounded pill:
  - State aktif: Latar belakang solid `#2563EB`, teks putih `#FFFFFF`, ikon putih.
  - State non-aktif: Teks abu-abu netral `#64748B`, efek hover lembut `#F1F5F9`.
- Menempatkan tombol Logout dengan ikon keluar di dasar sidebar dengan garis pemisah yang rapi.
- Mempertahankan menu fungsional yang sudah ada (*Dashboard, Transaksi, Deteksi Fraud, Alert Fraud, Enkripsi, Demo, Mobile, Audit Logs, Performance*).

### 3. Modul Topbar Header
- Memasang bar pencarian *rounded pill* di sebelah kiri dengan placeholder "Search here..." dan ikon kaca pembesar.
- Memasang kontrol sisi kanan:
  - Tombol pengalih tema Sun/Moon berdesain pill yang interaktif.
  - Ikon lonceng notifikasi dengan *badge dot* merah.
  - Komponen profil pengguna berisi avatar lingkaran, nama pengguna dinamis (misal: "Zoe Chauhan / Admin Jatelindo"), peran pengguna aktif, dan ikon panah ke bawah (*chevron-down*).

### 4. Modul Dashboard Utama
- **Baris 1**: Grid 4-kolom kartu metrik:
  - **Kartu 1**: Latar biru solid `#2563EB`, teks putih, ikon kotak putih bulat (*Total Transaksi Aman*).
  - **Kartu 2**: Latar putih, ikon kotak ungu muda `#F3E8FF`, nilai tebal (*Aturan Fraud Aktif*).
  - **Kartu 3**: Latar putih, ikon kotak oranye muda `#FFEDD5`, nilai tebal (*Alert Fraud Terdeteksi*).
  - **Kartu 4**: Latar putih, ikon kotak biru muda `#E0F2FE`, nilai tebal (*Throughput TPS & Latensi*).
- **Baris 2**: Tata letak grid (2/3 kiri dan 1/3 kanan):
  - **Kiri**: Komponen *Overall Transactions* dengan pill filter rentang waktu (*Daily, Weekly, Monthly*), total transaksi berwarna biru tebal, legenda dua warna, dan visual grafik batang ganda (*dual-bar chart*) Jan – Ags dengan sudut membulat.
  - **Kanan**: Komponen *Security & Channel Reports* dengan diagram donat interaktif (persentase di tengah "64% Transaksi Aman") dan legenda saluran transaksi di bagian bawah.
- **Baris 3**: Tata letak grid (2/3 kiri dan 1/3 kanan):
  - **Kiri**: Tabel *Latest Transaction* berisi kolom Kode (#ID biru), Pelanggan/Saluran, Tanggal, Nominal, Status, dan aksi rincian.
  - **Kanan**: Panel *Costumers / Nasabah Aktif* menampilkan daftar nasabah dengan foto avatar lingkaran, nama nasabah, cap waktu relatif (misal: "5 minutes ago"), dan nomor ID akun berwarna biru.

### 5. Kepatuhan Batas Kode & Backend Integrity
- Seluruh file program (TSX/CSS) tetap dipelihara di bawah batas maksimal **800 baris kode**.
- Tidak ada perubahan pada endpoint atau skema database backend; data riil dari `/api/transactions`, `/api/rules`, `/api/alerts`, `/api/performance/metrics` dialirkan langsung ke komponen dashboard baru.

---

## Keputusan Pengujian (Testing Decisions)

- **Kriteria Pengujian yang Baik**: Menguji perilaku antarmuka secara menyeluruh tanpa bergantung pada detail internal rendering (verifikasi bahwa seluruh data tampil akurat, navigasi bekerja, dan pengalihan tema mulus).
- **Modul yang Diuji**:
  - Komponen Dashboard Willow baru (`Dashboard.tsx`).
  - Navigasi Sidebar dan Topbar Header (`App.tsx`).
  - Sistem pengalihan tema Light/Dark (`index.css`).
  - Integrasi poller data riil dan mode fallback offline.
- **Verifikasi Build**: Memastikan kompilasi TypeScript (`tsc -b`) dan Vite build (`npm run build`) berjalan bersih tanpa galat linter maupun compiler.

---

## Batasan Ruang Lingkup (Out of Scope)

- Modifikasi struktur tabel database atau stored procedure backend.
- Fitur e-commerce keranjang belanja / katalog produk (hanya mengadopsi estetika antarmuka Willow).
- Ekspor grafik ke file format PDF atau Excel.

---

## Catatan Tambahan

Keputusan arsitektur redesain ini telah disetujui melalui interview dan dicatat pada ADR `docs/adr/0001-redesign-dashboard-willow.md`.
