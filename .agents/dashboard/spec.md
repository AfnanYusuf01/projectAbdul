# Spesifikasi Dasbor - Dasbor Operasional & Telemetri Performa (SOC)

Dokumen spesifikasi ini mendefinisikan persyaratan, cerita pengguna (user stories), keputusan implementasi, dan rencana pengujian untuk Dasbor Operasional dan Metrik Performa Sistem pada Portal SOC Jatelindo.

---

## Masalah (Problem Statement)

Dalam pemantauan transaksi elektronik pembayaran, data tersebar secara terpisah mulai dari log transaksi, log enkripsi, status kegagalan fraud, hingga metrik utilisasi server. Tanpa adanya antarmuka terpadu, analis keamanan dan administrator sistem kesulitan memantau kondisi operasional secara real-time, mendeteksi lonjakan anomali traffic, dan mendiagnosis degradasi performa sistem.

---

## Solusi (Solution)

Membangun Dasbor Operasional terpusat bergaya *Security Operations Console* (SOC Dashboard) dan modul pemantauan telemetri performa real-time. Dasbor ini akan memvisualisasikan data KPI kunci (Total Transaksi, status enkripsi, alerts pending, rata-rata latensi), grafik data SVG untuk melacak Throughput (TPS), dan pengukur utilitas perangkat keras server (CPU, RAM, koneksi aktif) untuk membantu pengambilan keputusan secara cepat.

---

## Cerita Pengguna (User Stories)

1. **Sebagai Operator Keamanan (SystemOperator)**, saya ingin melihat ringkasan metrik utama (Total Transaksi, Latensi Kriptografi, Status Risiko) saat halaman pertama dimuat, sehingga saya dapat dengan cepat mengetahui status normal sistem.
2. **Sebagai Operator Keamanan (SystemOperator)**, saya ingin melihat grafik traffic transaksi real-time dalam bentuk chart dinamis, agar saya dapat mendeteksi lonjakan volume transaksi (spikes) atau indikasi serangan spam.
3. **Sebagai Administrator Sistem (SecurityAdmin)**, saya ingin memantau utilisasi CPU dan RAM server backend secara visual (gauge circular), sehingga saya dapat memantau jika beban enkripsi hybrid memakan memori berlebih.
4. **Sebagai Analis Fraud (FraudAnalyst)**, saya ingin melihat indikator tingkat risiko keamanan sistem (BERSIH/SEDANG/TINGGI) yang dihitung secara dinamis dari jumlah fraud alerts pending, sehingga saya dapat menentukan tingkat kesiagaan tim SOC.
5. **Sebagai Pengembang Sistem**, saya ingin memiliki tombol simulator beban transaksi di menu Performance, sehingga saya dapat menguji ketahanan server dan mengamati perubahan grafik performa secara langsung.

---

## Keputusan Implementasi (Implementation Decisions)

### 1. Struktur Komponen Dashboard
- **`Dashboard.tsx`**: Komponen utama yang menampung kartu ringkasan KPI, area visualisasi grafik tren transaksi kustom menggunakan tag `<svg>` untuk performa optimal, dan daftar ringkasan 5 transaksi terbaru.
- **`Performance.tsx`**: Komponen khusus untuk memantau waktu respons enkripsi/dekripsi, telemetri utilisasi hardware CPU/RAM menggunakan gauge animasi, dan kontrol Simulator Transaksi.

### 2. Mekanisme Telemetri di Backend
- **Endpoint `/api/performance/metrics`**: FastAPI menggunakan library `psutil` di Python untuk mengambil status nyata beban CPU (%) dan RAM (%) dari sistem hosting.
- **Latensi Kalkulator**: Menggunakan `time.perf_counter()` di controller enkripsi/dekripsi untuk mencatat rata-rata durasi pemrosesan dalam milidetik dan mengeksposnya ke API.

### 3. Polling Data Real-Time di Frontend
Frontend React menyetel polling asinkronus (`setInterval`) setiap 3 detik untuk mengambil data terbaru dari endpoint `/api/performance/metrics` dan memperbarui state grafik secara real-time tanpa mengganggu interaksi pengguna di menu lain.

---

## Keputusan Pengujian (Testing Decisions)

- **Unit Testing**:
  - Menguji fungsionalitas perhitungan statistik rata-rata latensi di backend (apakah durasi yang dimasukkan dihitung rata-rata per 50 operasi terakhir dengan benar).
  - Menguji performa endpoint `/api/performance/metrics` (harus merespons di bawah 10ms dan menghasilkan struktur data JSON yang valid).
- **Manual UI Testing**:
  - Memverifikasi animasi chart SVG berjalan lancar dan titik koordinat kurva ter-render dengan benar.
  - Menguji tombol simulator beban transaksi (ketika diklik, Throughput TPS dan baris transaksi di dasbor harus otomatis bertambah).
