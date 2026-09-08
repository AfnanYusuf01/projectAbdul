# Spesifikasi Keamanan - Autentikasi Pengguna & Pembatasan Akses (RBAC)

Dokumen spesifikasi ini mendefinisikan persyaratan, cerita pengguna (user stories), keputusan implementasi, dan rencana pengujian untuk fitur login dan keamanan berbasis peran (RBAC) pada Portal SOC Jatelindo.

---

## Masalah (Problem Statement)

Saat ini, prototipe Portal SOC Jatelindo dapat diakses secara bebas tanpa adanya otentikasi. Siapa pun dapat melihat transaksi, memicu simulasi, mengaktifkan/menonaktifkan aturan fraud, bahkan mendekripsi payload transaksi sensitif yang tersimpan di database. Hal ini melanggar prinsip kepatuhan keamanan data pembayaran (PCI-DSS) dan dapat menyebabkan kebocoran data transaksi nasabah jika diakses oleh pihak yang tidak berwenang.

---

## Solusi (Solution)

Membangun sistem autentikasi pengguna (Login) terpusat menggunakan hybrid cryptosystem pendukung dan pembatasan akses berbasis peran (Role-Based Access Control - RBAC). Pengamanan kredensial menggunakan hashing Bcrypt di database, otentikasi sesi menggunakan JSON Web Token (JWT) di FastAPI backend, dan integrasi halaman login terproteksi di frontend React.

---

## Cerita Pengguna (User Stories)

1. **Sebagai Operator Keamanan (SystemOperator)**, saya ingin masuk ke sistem dengan kredensial saya, sehingga saya dapat menguji playground enkripsi dan mengirimkan transaksi simulasi untuk menguji keandalan sistem.
2. **Sebagai Operator Keamanan (SystemOperator)**, saya ingin sistem memblokir akses saya ke fitur dekripsi data transaksi asli dan konfigurasi aturan fraud, sehingga saya tidak secara tidak sengaja mengubah kepatuhan sistem atau melihat data kartu kredit nasabah yang sensitif.
3. **Sebagai Analis Fraud (FraudAnalyst)**, saya ingin masuk ke sistem dengan kredensial saya, sehingga saya dapat meninjau alert fraud, menulis catatan investigasi, dan mendekripsi payload transaksi untuk memverifikasi keabsahan transaksi mencurigakan.
4. **Sebagai Admin Keamanan (SecurityAdmin)**, saya ingin masuk ke sistem dengan kredensial saya, sehingga saya dapat membuat aturan fraud baru serta mengaktifkan atau menonaktifkan aturan fraud yang ada secara dinamis.
5. **Sebagai Pengguna Tidak Terautentikasi**, saya ingin sistem mengarahkan saya kembali ke halaman Login jika saya mencoba mengakses URL dashboard secara langsung tanpa token yang valid, agar data transaksi tetap rahasia.
6. **Sebagai Auditor Kepatuhan (Compliance Auditor)**, saya ingin setiap upaya login yang berhasil maupun gagal dicatat ke dalam log audit beserta alamat IP asal, sehingga kami dapat mendeteksi percobaan serangan brute-force dan memelihara kepatuhan audit.
7. **Sebagai Pengguna Terautentikasi**, saya ingin dapat keluar (Logout) dari sistem kapan saja, sehingga sesi aktif saya berakhir dan token dihapus dari browser demi keamanan.

---

## Keputusan Implementasi (Implementation Decisions)

### 1. Model Data Pengguna (Database Schema)
Menambahkan model `User` ke dalam database (`backend/models/user.py`) dengan kolom:
- `id` (Integer, Primary Key)
- `username` (String, Unique, Index)
- `password_hash` (String, menyimpan hash Bcrypt)
- `role` (String, berisi peran: `'SecurityAdmin'`, `'FraudAnalyst'`, `'SystemOperator'`)

### 2. Kredensial & Autentikasi Backend
- **Keamanan Sandi**: Menggunakan pustaka `passlib[bcrypt]` untuk melakukan hashing password sebelum disimpan di database dan melakukan verifikasi saat login.
- **Token JWT**: Menggunakan pustaka `pyjwt` untuk menerbitkan JSON Web Token (JWT) pada login sukses. Token berisi payload:
  - `sub`: username
  - `role`: user role
  - `exp`: waktu kedaluwarsa token (disetel 1 jam setelah diterbitkan)
- **Token Signature**: Ditandatangani menggunakan algoritma HMAC-SHA256 dengan Secret Key rahasia yang disimpan di variabel lingkungan.

### 3. Middleware Otorisasi (RBAC) di Backend
Menerapkan dependency FastAPI untuk memverifikasi token JWT di header request `Authorization: Bearer <JWT_TOKEN>` dan membatasi endpoint berdasarkan peran (Role):
- `/api/transactions/{id}/decrypt` (POST): Hanya dapat diakses oleh role `FraudAnalyst`.
- `/api/rules` (POST, PUT): Hanya dapat diakses oleh role `SecurityAdmin`.
- `/api/alerts/{id}` (PUT): Hanya dapat diakses oleh role `FraudAnalyst`.
- `/api/transactions/simulate` (POST): Dapat diakses oleh semua pengguna terautentikasi.
- `/api/crypto/*`: Dapat diakses oleh semua pengguna terautentikasi.

### 4. Integrasi View Frontend (React)
- **Komponen Login**: Membuat halaman login modern bertema gelap. Kredensial dikirim via REST API ke `/api/auth/login`. Jika sukses, token JWT disimpan di `sessionStorage`.
- **Interseptor API & Guard Route**:
  - Menyisipkan token JWT secara otomatis pada header `Authorization` di setiap pemanggilan API.
  - Memproteksi komponen `App.tsx` agar mengarahkan pengguna ke halaman Login apabila token tidak ditemukan atau telah kedaluwarsa.
  - Menyembunyikan elemen UI (seperti tombol "Dekripsi" atau sakelar edit aturan) apabila role user tidak berhak untuk menggunakannya.

---

## Keputusan Pengujian (Testing Decisions)

- **Unit Testing**:
  - Menguji fungsionalitas hash password (apakah password polos ter-hash dengan benar dan verifikasi hash berfungsi).
  - Menguji generator JWT (apakah token yang dihasilkan memuat klaim role yang tepat dan memicu error jika kedaluwarsa).
- **Integration Testing**:
  - Menguji endpoint `/api/auth/login` dengan kredensial salah (menghasilkan status HTTP 401 Unauthorized) dan kredensial benar (menghasilkan JWT token).
  - Menguji akses endpoint RBAC (contoh: request dekripsi oleh role `SystemOperator` harus mengembalikan status HTTP 403 Forbidden).
- **Manual UI Testing**:
  - Memverifikasi halaman Login dapat dibuka dan memblokir akses ke dashboard sebelum login.
  - Menguji tombol Logout menghapus sesi browser dan melakukan redirect ke halaman Login.

---

## Batasan Ruang Lingkup (Out of Scope)

- Mekanisme Reset Password (lupa kata sandi) atau integrasi email.
- Multi-Factor Authentication (MFA).
- Manajemen pembuatan User baru dari antarmuka UI (registrasi mandiri). User hanya disiapkan melalui inisialisasi awal database (seeding).
- Integrasi Active Directory atau OAuth2 eksternal (Google, Azure, dll).
