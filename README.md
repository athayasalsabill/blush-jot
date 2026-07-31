# Blush Jot

Judul Proyek: Blush Diary - Aplikasi Diari Teks Minimalis

Konsep Utama: Buat aplikasi web progresif (PWA) seluler-pertama yang berfungsi sebagai diari teks pribadi. Estetikanya harus minimalis, bersih, dan didominasi warna pink pastel dan putih tulang. Aplikasi ini adalah gabungan organisasi Notion (menggunakan 'pembatas map') dan estetika penulisan Substack (font serif).

Spesifikasi Teknis:

Penyimpanan Data: Semua entri diari harus disimpan sebagai file teks individual dalam repositori GitHub pribadi yang terhubung.

Hemat Memori/Tanpa Gambar: Aplikasi tidak boleh mengizinkan unggahan atau tampilan gambar apa pun di dalam entri diari. Hanya teks yang diperbolehkan untuk menghemat memori. Ikon aplikasi dan elemen UI adalah pengecualian.

Keamanan: Layar pembuka aplikasi harus merupakan gerbang kata sandi (login) sederhana. Pengguna tidak dapat melihat konten apa pun tanpa memasukkan kata sandi yang benar.

Tipografi: Gunakan font serif bergaya Substack (misalnya, Georgia, Merriweather, atau font serif web kustom yang serupa) untuk semua judul diari dan teks isi. Judul UI dapat menggunakan sans-serif minimal yang serasi.

Panduan Desain Visual (Menggunakan Referensi):

Palet Warna: Pastel Pink lembut dan Bone White (Putih Tulang).

Latar Belakang Teks: Area teks utama untuk membaca/menulis harus tetap bone-white bersih untuk kejelasan.

Alur dan Struktur Layar:

1. Layar Login Keamanan (Gerbang)

Visualisasi awal yang bersih. Teks "Blush Diary" dan input kata sandi minimal.

Gunakan gaya minimalis dan palet warna yang terlihat pada gambar sebagai referensi estetika login yang bersih.

2. Layar Utama (Organisasi Map Divider)

Setelah login, tampilkan layar organisasi tingkat tinggi.

Terapkan konsep 'map divider' atau pembatas folder fisik yang tumpang tindih seperti yang diminta.

Visualisasikan serangkaian tab folder horizontal (misalnya: '2024 Diari', 'Refleksi Bulanan', 'Draf'). Gunakan font serif Substack pada label tab.

Gunakan gambar bagian pojok kiri atas sebagai panduan struktur visual untuk pembatas map ini.

3. Layar Daftar Entri (Gaya Substack)

Saat pengguna mengklik tab (misalnya, '2024 Diari'), tampilkan daftar entri teks bergaya Substack.

Setiap entri harus menampilkan judul diari (serif besar), tanggal, dan kutipan teks singkat (serif kecil). Tidak ada gambar.

Gunakan pembatas tipis. Palet tetap bone-white dan pink.

Tombol '+' pink besar di sudut bawah untuk entri baru.



4. Layar Penulisan/Tampilan (Kombinasi Tekstur Referensi)

Saat pengguna mengklik entri atau '+' baru.

Layar ini adalah editor/pembaca teks minimal.

Fitur Desain Kunci (Kombinasi):

Area teks utama editor adalah bone-white bersih.

Di luar area teks bersih ini (sebagai latar belakang margins atau lapisan dasar di bawah overlay area teks bersih), terapkan salah satu tekstur dari gambar (misalnya, pola titik-titik pink muda atau garis-garis pink muda). Tekstur harus lembut dan tidak mengganggu teks.

Teks di dalamnya hanya teks serif.

Ikon minimal untuk 'Simpan ke GitHub' (ikon gembok kecil dengan logo 'GH').

Instruksi Tambahan:

Prioritaskan integritas penyimpanan GitHub dan keamanan kata sandi.

Pastikan fungsionalitas 'tanpa gambar' ditegakkan secara ketat di editor.

Buat transisi UI yang lembut antara layar dengan skema warna pink pastel.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/448918bc-3f2a-4c6f-8149-feca85de2fe9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
