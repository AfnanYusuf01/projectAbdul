# Integrasi Modul Evaluasi Akademik Skripsi Berbasis Prinsip Defense-in-Depth

## Konteks & Keputusan
Untuk memenuhi kriteria pembuktian ilmiah pada naskah Bab IV (Hasil dan Pembahasan) dan Lampiran Skripsi di PT Jatelindo, diputuskan untuk menambahkan modul pengujian empiris terpadu yang memverifikasi dua pilar utama penelitian:
1. **Pilar Kriptografi (Kerahasiaan & Integritas)**: Menyediakan *Cryptographic Benchmarking Suite* (komparasi latensi ms & throughput TPS antara AES-256 vs RSA-2048 vs Hybrid AES-RSA), simulator interaktif *Anti-Tampering Integrity Test* (verifikasi kegagalan otentikasi tag AES-GCM saat data dimanipulasi), dan tombol *Rotasi Kunci RSA (Key Lifecycle)* dengan pencatatan jejak audit ISO 27001.
2. **Pilar Deteksi Fraud**: Menyediakan *Batch Evaluation Suite* otomatis dengan 100 dataset transaksi uji (Ground Truth) yang langsung menghasilkan tabel 4-Kuadran *Confusion Matrix* (TP, TN, FP, FN) serta metrik *Accuracy*, *Precision*, *Recall*, dan *F1-Score*.
3. **Pelaporan & Ekspor Data**: Menyediakan tombol unduh file CSV dataset lengkap untuk lampiran skripsi sekaligus tombol salin format tabel ringkas untuk disalin langsung ke naskah Word/LaTeX Bab IV.
4. **Arsitektur Penempatan**: Seluruh modul diintegrasikan secara modular ke dalam menu domain yang sudah ada (*Enkripsi & Sekuritas*, *Performance*, dan *Deteksi Fraud*) guna menjaga kebersihan arsitektur sistem.

## Pilihan yang Dipertimbangkan
- **Pengujian Manual di Luar Aplikasi (Excel/Terminal Script)**: Ditolak karena pengujian tidak dapat didemonstrasikan secara transparan, interaktif, dan langsung di depan dosen penguji saat sidang skripsi.
- **Menu Terpisah "Evaluasi Skripsi"**: Ditolak karena memecah domain model modular sistem SOC enterprise.
- **Integrasi Modular Sesuai Domain Domain-Driven Design (Diterima)**: Menempatkan pengujian integritas di menu Kriptografi, latensi di Performance, dan Confusion Matrix di Deteksi Fraud, membuktikan arsitektur sistem yang matang dan siap industri.
