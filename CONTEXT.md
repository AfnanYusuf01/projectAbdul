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

---

### Deteksi Fraud (Fraud Detection)

* **Rule-Based Fraud Detection (Deteksi Fraud Berbasis Aturan)**
  Mekanisme evaluasi transaksi real-time dengan mencocokkan data transaksi terhadap sekumpulan aturan bisnis terstruktur (kriteria batas) untuk mendeteksi indikasi aktivitas mencurigakan.

* **Fraud Rule (Aturan Fraud)**
  Kriteria logika spesifik yang digunakan untuk mengidentifikasi perilaku tidak wajar pada transaksi. Contoh aturan mencakup batas maksimum nominal sekali transaksi atau batasan jumlah transaksi per menit (velocity).

* **Fraud Alert (Peringatan Fraud)**
  Notifikasi atau catatan alarm yang dipicu ketika suatu transaksi memenuhi satu atau lebih kriteria Aturan Fraud. Alert ini memerlukan tinjauan manual oleh analis keamanan.

---

### Kepatuhan & Performa (Compliance & Performance)

* **Audit Log (Log Audit)**
  Catatan kronologis permanen (tidak dapat diubah/dihapus) yang merekam setiap aktivitas penting dalam sistem, seperti perubahan aturan fraud, aktivitas kunci kriptografi, login pengguna, dan dismiss alert keamanan.

* **Throughput**
  Volume transaksi elektronik yang diproses dan dievaluasi oleh sistem per detik, dinyatakan dalam satuan *Transactions Per Second* (TPS).

* **Latency (Latensi Pemrosesan)**
  Waktu yang dibutuhkan sistem untuk memproses suatu operasi (misalnya, total waktu enkripsi data, dekripsi data, atau pemrosesan respons API) dari awal hingga selesai, diukur dalam milidetik (ms) atau mikrodetik (μs).
