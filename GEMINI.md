# Aturan Agen AI (Sushi Hiro POS)

Aturan-aturan di bawah ini berlaku untuk proyek ini saja (lokal) dan wajib ditaati:

## 1. Aturan Umum & Batasan
1. **Panjang Maksimal File Kode**:
   * Setiap file program (C#, TypeScript, TSX, CSS, dll.) **maksimal hanya boleh berisi 800 baris kode**. Jika melebihi batas ini, pisahkan kodenya menjadi komponen/file terpisah yang lebih kecil.
2. **Panjang Maksimal Stored Procedure (SP)**:
   * Setiap Stored Procedure (SP) baru maupun hasil modifikasi **maksimal hanya boleh berisi 500 baris kode**. Jika logika terlalu kompleks, wajib dipecah ke sub-SP atau fungsi database pembantu.
3. **Bahasa Penulisan Spesifikasi & Tiket**:
   * Setiap dokumen spesifikasi (`spec.md`), tiket masalah (*issue/ticket*), rencana implementasi (`implementation_plan.md`), walkthrough (`walkthrough.md`), dan daftar tugas (`task.md`) yang dibuat **wajib ditulis dalam Bahasa Indonesia**.
4. **Bahasa Komunikasi & Penjelasan**:
   * Berikan penjelasan alur program dan lakukan komunikasi dengan pengguna menggunakan Bahasa Indonesia yang ringkas, terstruktur, dan jelas.
5. **akses database**:
   * akses databse hanya diberikan read only.

## 2. Struktur Alur Data Standar (Standard CRUD Data Flow)
Setiap kali Anda membuat atau memodifikasi fitur CRUD (Create, Read, Update, Delete) pada proyek ini, **wajib** mengikuti struktur file dan aliran data berikut:

