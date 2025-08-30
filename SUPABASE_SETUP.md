# Setup Supabase untuk E-Wallet

Panduan lengkap untuk mengatur database Supabase untuk aplikasi E-Wallet.

## 1. Buat Project Supabase

1. Kunjungi [https://supabase.com](https://supabase.com)
2. Daftar atau login ke akun Anda
3. Klik "New Project"
4. Pilih organisasi dan beri nama project (contoh: "e-wallet")
5. Buat password database yang kuat
6. Pilih region terdekat
7. Klik "Create new project"

## 2. Dapatkan Kredensial Project

Setelah project dibuat:

1. Buka project dashboard
2. Klik "Settings" di sidebar kiri
3. Klik "API" di menu settings
4. Salin informasi berikut:
   - **Project URL** (contoh: `https://xxxxx.supabase.co`)
   - **anon public key** (key yang panjang dimulai dengan `eyJ...`)

## 3. Konfigurasi Environment Variables

Buat file `.env.local` di root project dengan isi:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Ganti:**
- `your-project-id` dengan ID project Supabase Anda
- `your-anon-key-here` dengan anon key dari dashboard

## 4. Jalankan SQL Schema

1. Buka Supabase dashboard
2. Klik "SQL Editor" di sidebar kiri
3. Klik "New query"
4. Copy seluruh isi file `supabase_schema.sql`
5. Paste ke SQL editor
6. Klik "Run" untuk menjalankan script

## 5. Verifikasi Setup

Setelah menjalankan SQL schema, verifikasi bahwa tabel telah dibuat:

1. Klik "Table Editor" di sidebar
2. Pastikan tabel berikut ada:
   - `profiles`
   - `categories` (dengan data default)
   - `transactions`

## 6. Konfigurasi Authentication

1. Klik "Authentication" di sidebar
2. Klik "Settings"
3. Pastikan "Enable email confirmations" sesuai kebutuhan
4. Atur "Site URL" ke `http://localhost:3000` untuk development

## 7. Test Koneksi

1. Jalankan aplikasi: `npm run dev`
2. Buka `http://localhost:3000`
3. Coba registrasi user baru
4. Login dengan kredensial yang dibuat
5. Test fitur tambah transaksi

## Struktur Database

### Tabel `profiles`
- Menyimpan informasi profil user
- Otomatis dibuat saat user registrasi
- Terhubung dengan `auth.users`

### Tabel `categories`
- Kategori transaksi (income/expense)
- Sudah terisi data default
- Bisa ditambah sesuai kebutuhan

### Tabel `transactions`
- Menyimpan semua transaksi user
- Terhubung dengan `profiles` dan `categories`
- Dilindungi Row Level Security (RLS)

## Keamanan

- **Row Level Security (RLS)** aktif di semua tabel
- User hanya bisa akses data mereka sendiri
- Categories bisa dibaca semua user
- Profile otomatis dibuat saat registrasi

## Troubleshooting

### Error: "Invalid API key"
- Pastikan `NEXT_PUBLIC_SUPABASE_ANON_KEY` benar
- Restart development server setelah ubah `.env.local`

### Error: "relation does not exist"
- Pastikan SQL schema sudah dijalankan
- Cek di Table Editor apakah tabel sudah ada

### Error: "Row Level Security"
- Pastikan user sudah login
- Cek RLS policies di SQL Editor

### Error: "User not authenticated"
- Pastikan authentication flow berjalan
- Cek di Authentication > Users apakah user terdaftar

## Production Setup

Untuk production:

1. Ganti `Site URL` di Authentication Settings
2. Tambahkan domain production ke `Redirect URLs`
3. Update environment variables di hosting platform
4. Pastikan SSL/HTTPS aktif

## Backup Database

Untuk backup:

1. Klik "Settings" > "Database"
2. Scroll ke "Database backups"
3. Klik "Create backup" atau atur automatic backup

---

**Catatan:** Simpan kredensial Supabase dengan aman dan jangan commit file `.env.local` ke repository.