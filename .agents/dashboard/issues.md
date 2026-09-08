# Daftar Masalah & Tiket Pengerjaan - Dasbor & Performa Telemetri

Dokumen ini mendefinisikan tiket pengerjaan teknis untuk mengimplementasikan spesifikasi Dasbor Operasional dan Metrik Performa.

---

## Masalah Backend (FastAPI)

### 🎫 Issue #1 - Implementasi API Telemetri Performa Server
* **Tujuan**: Menyediakan endpoint API untuk mengumpulkan latensi kriptografi dan konsumsi sumber daya hardware server.
* **Langkah Kerja**:
  1. Pasang library `psutil` di `backend/requirements.txt` jika belum ada.
  2. Implementasikan kalkulator performa di `backend/main.py`:
     - Ambil data CPU (`psutil.cpu_percent()`) dan RAM (`psutil.virtual_memory().percent`).
     - Hitung rata-rata waktu enkripsi dan dekripsi dari antrean pemrosesan transaksi.
  3. Buat endpoint GET `/api/performance/metrics` yang mereturn objek `PerformanceMetrics`.

---

## Masalah Frontend (React)

### 🎫 Issue #2 - Pembuatan Komponen Dashboard & Chart SVG Real-time
* **Tujuan**: Membangun tampilan utama dasbor operasional dengan metrik status dan grafik volume transaksi.
* **Langkah Kerja**:
  1. Buat berkas komponen `frontend/src/components/Dashboard.tsx`.
  2. Susun 4 kartu metrik utama (Total Transaksi, Status Enkripsi, Alerts Pending, Latensi Enkripsi).
  3. Gambar kurva grafik volume transaksi real-time menggunakan tag SVG (`<path>` dan gradien warna cyan elektrik) untuk meminimalisir ketergantungan library charting berat.
  4. Integrasikan tabel ringkasan 5 transaksi terbaru.

---

### 🎫 Issue #3 - Pembuatan Komponen Performance & Telemetri Hardware
* **Tujuan**: Membuat halaman statistik performa server, circular resource gauges, dan kontrol simulator transaksi.
* **Langkah Kerja**:
  1. Buat berkas komponen `frontend/src/components/Performance.tsx`.
  2. Buat widget pengukur utilitas CPU dan RAM dalam bentuk lingkaran SVG (circular gauges) dengan animasi persentase load.
  3. Buat widget horizontal bar untuk membandingkan latensi enkripsi (AES-256) vs dekripsi (RSA).
  4. Implementasikan input angka dan tombol **Kirim Transaksi Burst** untuk mensimulasikan beban kerja di backend.
