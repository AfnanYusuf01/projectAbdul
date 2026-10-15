# Glosarium Domain - Keamanan Transaksi Elektronik (PT Jatelindo)

Glosarium ini mendefinisikan istilah-istilah bisnis utama yang digunakan di dalam sistem pemantauan keamanan transaksi elektronik PT Jatelindo.

### Kriptografi & Keamanan Data (Cryptography & Data Security)

* **Hybrid Cryptosystem (Sistem Kriptografi Hibrida)**
  Metode pengamanan data yang menggabungkan efisiensi enkripsi kunci simetris (AES-256) untuk mengamankan payload transaksi yang besar, dengan kenyamanan enkripsi kunci asimetris (RSA) untuk mendistribusikan kunci simetris tersebut secara aman tanpa perlu berbagi kunci rahasia terlebih dahulu.

* **Session Key (Kunci Sesi)**
  Kunci enkripsi simetris sekali pakai (ephemeral) yang dihasilkan secara acak untuk mengamankan satu transaksi tertentu. Kunci ini didekripsi oleh penerima menggunakan kunci privat asimetris.

* **Plaintext (Teks Terang)**
  Data transaksi asli yang belum disandikan (belum dienkripsi) dan dapat dibaca secara langsung, seperti nomor kartu, nama pemilik, dan nominal transaksi.

* **Ciphertext (Teks Sandi)**
  Data transaksi yang telah diubah menjadi format tidak terbaca melalui proses enkripsi menggunakan kunci sesi AES-256.

* **Encrypted Session Key (Kunci Sesi Terenkripsi)**
  Kunci sesi AES-256 yang telah dienkripsi menggunakan kunci publik RSA milik penerima, sehingga hanya pemegang kunci privat RSA yang dapat mendekripsinya.

* **Cryptographic Benchmark (Tolok Ukur Kriptografi)**
  Pengujian empiris terukur untuk membandingkan kinerja algoritma kriptografi (AES-256 simetris murni, RSA-2048 asimetris murni, dan Hybrid AES-RSA) berdasarkan parameter waktu pemrosesan (latensi), konsumsi memori, dan ukuran ciphertext.

* **Authentication Tag (Tag Otentikasi)**
  Blok data kriptografis 16-byte yang dihasilkan oleh algoritma AES-256-GCM untuk menjamin keaslian (authenticity) dan keutuhan (integrity) data. Jika satu bit saja dari ciphertext berubah, proses validasi tag akan gagal dan transaksi ditolak.

* **Data Tampering (Manipulasi Data)**
  Bentuk serangan siber di mana penyerang secara ilegal mengubah isi pesan atau ciphertext selama transmisi di jaringan komunikasi (serangan Man-in-the-Middle). Mekanisme AES-GCM dirancang khusus untuk menggagalkan upaya ini.

* **Key Rotation (Rotasi Kunci)**
  Mekanisme tata kelola keamanan untuk memperbarui dan mengganti pasangan kunci kriptografis (RSA-2048) secara periodik guna memitigasi risiko kompromi kunci jangka panjang sesuai kepatuhan standar industri ISO 27001 dan PCI-DSS.

---

### Deteksi Fraud (Fraud Detection)

* **Rule-Based Fraud Detection (Deteksi Fraud Berbasis Aturan)**
  Mekanisme evaluasi transaksi real-time dengan mencocokkan data transaksi terhadap sekumpulan aturan bisnis terstruktur (kriteria batas) untuk mendeteksi indikasi aktivitas mencurigakan.

* **Fraud Rule (Aturan Fraud)**
  Kriteria logika spesifik yang digunakan untuk mengidentifikasi perilaku tidak wajar pada transaksi. Contoh aturan mencakup batas maksimum nominal sekali transaksi atau batasan jumlah transaksi per menit (velocity).

* **Fraud Alert (Peringatan Fraud)**
  Notifikasi atau catatan alarm yang dipicu ketika suatu transaksi memenuhi satu atau lebih kriteria Aturan Fraud. Alert ini memerlukan tinjauan manual oleh analis keamanan.


* **Confusion Matrix**
  Tabel evaluasi kinerja mesin deteksi fraud yang memetakan hasil keputusan sistem terhadap kondisi riil transaksi ke dalam empat kuadran: True Positive (TP), True Negative (TN), False Positive (FP), dan False Negative (FN), sebagai dasar perhitungan metrik Akurasi, Presisi, Recall, dan F1-Score.

* **Ground Truth (Kebenaran Dasar)**
  Label kondisi riil dari setiap data transaksi uji (apakah transaksi tersebut benar-benar normal atau terindikasi kecurangan) yang digunakan sebagai tolok ukur obyektif untuk menghitung akurasi prediksi mesin fraud.

* **Evaluation Suite (Paket Evaluasi Pengujian)**
  Modul otomasi pengujian empiris yang mengeksekusi kumpulan dataset uji transaksi terstruktur secara simultan untuk menghasilkan matriks evaluasi, latensi, dan statistik deteksi fraud secara instan.
---

### Kepatuhan & Performa (Compliance & Performance)

* **Audit Log (Log Audit)**
  Catatan kronologis permanen (tidak dapat diubah/dihapus) yang merekam setiap aktivitas penting dalam sistem, seperti perubahan aturan fraud, aktivitas kunci kriptografi, login pengguna, dan dismiss alert keamanan.

* **Throughput**
  Volume transaksi elektronik yang diproses dan dievaluasi oleh sistem per detik, dinyatakan dalam satuan *Transactions Per Second* (TPS).

* **Latency (Latensi Pemrosesan)**
  Waktu yang dibutuhkan sistem untuk memproses suatu operasi (misalnya, total waktu enkripsi data, dekripsi data, atau pemrosesan respons API) dari awal hingga selesai, diukur dalam milidetik (ms) atau mikrodetik (μs).

* **Defense-in-Depth (Pertahanan Berlapis)**
  Prinsip arsitektur keamanan siber yang menerapkan beberapa lapisan mekanisme perlindungan independen secara bertingkat, menggabungkan lapisan kriptografi (kerahasiaan & integritas) dengan lapisan deteksi fraud (analisis anomali proses bisnis).
