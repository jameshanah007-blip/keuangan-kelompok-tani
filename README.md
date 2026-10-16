# Laporan Keuangan Kelompok Tani

Aplikasi statis HTML, CSS, JavaScript dengan Supabase sebagai database dan GitHub Pages sebagai hosting.

## Fitur yang dibangun
- Login pengguna melalui Supabase Auth.
- Peran bendahara untuk mengelola transaksi dan anggota untuk melihat laporan.
- Input pemasukan dan pengeluaran.
- Daftar transaksi, edit, dan hapus.
- Laporan saldo awal, pemasukan, pengeluaran, dan saldo akhir.
- Lampiran laba usaha dan alokasi 40% pengurus, 40% pengembangan, 20% operasional.

## Data awal
Saldo awal dan transaksi harus tetap kosong. Jangan memasukkan data contoh.

## Supabase
Gunakan proyek `portal-betesda` dan tabel khusus berawalan `tani_`. Jangan gunakan database RuangKita AI. Frontend hanya boleh menggunakan Project URL dan publishable/anon key. Jangan pernah menyimpan service-role atau secret key dalam repository publik.

## Catatan
Sebelum penggunaan resmi, audit kebijakan RLS, uji seluruh alur login, otorisasi bendahara/anggota, transaksi, dan laporan. Aktifkan GitHub Pages setelah konfigurasi siap.
