# Daftar Masalah & Tiket Pengerjaan - Autentikasi Pengguna & RBAC

Dokumen ini mendefinisikan tiket pengerjaan teknis untuk mengimplementasikan spesifikasi Login dan Hak Akses berbasis Peran (RBAC).

---

## Masalah Backend (FastAPI)

### 🎫 Issue #1 - Konfigurasi Dependensi Keamanan dan Skema Model User
* **Tujuan**: Menyiapkan model database user dan memperbarui pustaka dependensi.
* **Langkah Kerja**:
  1. Tambahkan `passlib[bcrypt]` dan `pyjwt` ke `backend/requirements.txt`.
  2. Buat file model `backend/models/user.py` yang mendefinisikan tabel `users` (username, password_hash, role).
  3. Hubungkan model user ke inisialisasi metadata database di `backend/models/database.py`.

---

### 🎫 Issue #2 - Implementasi Utilitas Kriptografi Keamanan (Hashing & JWT)
* **Tujuan**: Menyiapkan fungsi helper untuk pengamanan kata sandi dan pembungkusan sesi.
* **Langkah Kerja**:
  1. Buat utilitas hashing password (hash & verify) menggunakan Bcrypt.
  2. Buat fungsi pembuat token JWT (`create_access_token`) dengan waktu kedaluwarsa 1 jam dan algoritma HS256.
  3. Buat fungsi pembongkar token JWT (`decode_access_token`) untuk validasi request.

---

### 🎫 Issue #3 - Endpoint Auth & Pembuatan Kredensial Simulasi (User Seeding)
* **Tujuan**: Menyediakan endpoint login REST API dan data user bawaan untuk uji coba.
* **Langkah Kerja**:
  1. Buat Pydantic schemas untuk data Login di `backend/schemas/auth_schemas.py`.
  2. Buat endpoint POST `/api/auth/login` di `backend/controllers/auth_controller.py` yang mencocokkan password dan mengembalikan token JWT.
  3. Tambahkan fungsi seed data user di `backend/models/database.py` untuk mendaftarkan 3 user default:
     - `admin` (Role: `SecurityAdmin`, pass: `password123`)
     - `analyst` (Role: `FraudAnalyst`, pass: `password123`)
     - `operator` (Role: `SystemOperator`, pass: `password123`)
  4. Catat setiap login sukses/gagal ke log audit di database.

---

### 🎫 Issue #4 - Middleware Otorisasi Hak Akses (RBAC) pada API Controller
* **Tujuan**: Memproteksi endpoint sensitif agar hanya dapat diakses oleh peran yang sesuai.
* **Langkah Kerja**:
  1. Buat fungsi dependensi `get_current_user` di FastAPI yang mengambil token JWT dari header Authorization.
  2. Buat fungsi dependensi `require_role(allowed_roles: list)` untuk memvalidasi hak akses peran.
  3. Terapkan dependensi tersebut pada:
     - Dekripsi transaksi (Hanya `FraudAnalyst`)
     - Aturan Fraud (Hanya `SecurityAdmin`)
     - Mengubah status alert (Hanya `FraudAnalyst`)
     - Pemanggilan endpoint simulasi & playground (Semua user login)

---

## Masalah Frontend (React)

### 🎫 Issue #5 - Pembuatan Halaman Login (View)
* **Tujuan**: Membuat antarmuka login yang aman dan sesuai estetika Security Operations Console.
* **Langkah Kerja**:
  1. Buat berkas komponen `frontend/src/components/Login.tsx`.
  2. Desain form login dengan background hitam, visual input sandi berkarakter secure, pesan error merah terang, dan animasi pemrosesan autentikasi.
  3. Tambahkan dropdown/petunjuk kredensial bawaan (Admin, Analyst, Operator) untuk mempermudah simulator.

---

### 🎫 Issue #6 - Proteksi Sesi Route & Sinkronisasi Authorization Header
* **Tujuan**: Melindungi dashboard dari akses luar dan membatasi UI berdasarkan peran aktif.
* **Langkah Kerja**:
  1. Simpan token JWT yang diterima ke dalam `sessionStorage` pada login berhasil.
  2. Modifikasi `App.tsx` agar memeriksa token JWT saat dimuat. Jika kosong, arahkan tampilan utama hanya ke halaman `Login`.
  3. Perbarui seluruh pemanggilan fetch API agar selalu menambahkan header `Authorization: Bearer <token>`.
  4. Sembunyikan atau nonaktifkan elemen interaktif di UI (misalnya tombol edit rules, tombol dekripsi) yang tidak diizinkan untuk peran yang sedang aktif.
  5. Buat tombol "Logout" di sidebar untuk menghapus token JWT dan mengalihkan kembali ke halaman Login.
