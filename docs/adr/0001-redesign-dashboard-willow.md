# Redesain Antarmuka Dashboard Admin Mengadopsi Desain Willow

## Konteks & Keputusan
Dashboard pemantauan transaksi elektronik Jatelindo diredesain secara visual mengikuti tata letak dan estetika modern SaaS "Willow" (latar `#F4F6FA`, kartu putih bersih `#FFFFFF`, aksen *Royal Blue* `#2563EB`, navigasi pill aktif, dual-bar chart, donut chart, tabel transaksi, dan daftar pelanggan). Kita memutuskan untuk tetap mempertahankan domain model keamanan transaksi Jatelindo (bukan dummy e-commerce), menu navigasi operasional SOC, tema bawaan Light Mode dengan toggle switch Dark Mode, serta profil pengguna dinamis sesuai sesi otentikasi JWT/RBAC.

## Pilihan yang Dipertimbangkan
- **Replika Dummy E-Commerce**: Ditolak karena akan memutus integrasi riil ke backend pemantauan keamanan transaksi Jatelindo yang sudah aktif.
- **Penyelarasan Desain Visual Willow dengan Domain Jatelindo**: Diterima karena menyajikan pengalaman visual kelas premium yang identik dengan gambar mockup tanpa mengorbankan integritas data backend.
