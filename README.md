# BahasaKita — Ruang belajar adaptif

Aplikasi React + Vite dengan Supabase Auth dan API Express. Mendukung siswa SD, SMP, dan SMA, asesmen adaptif, materi belajar, kamus visual, profil/foto, progres, serta pengelolaan konten oleh admin.

## Menjalankan

1. Jalankan `npm install` dan `npm --prefix server install`.
2. Isi Project URL dan publishable key pada `.env.local`, lalu `npm run setup:supabase`. Secret/service-role key tidak diperlukan.
3. Siapkan Supabase mengikuti [SETUP-SUPABASE.md](SETUP-SUPABASE.md). Proyek yang sudah menjalankan migrasi 001–003 cukup menjalankan [DEPLOY-LEARNING.sql](supabase/DEPLOY-LEARNING.sql). Akun `kevinalmer@apps.ipb.ac.id` menjadi admin pertama. Untuk dashboard pendamping, lanjutkan dengan [migrasi 007](supabase/migrations/007_support_dashboards.sql).
4. Jalankan `npm run dev:api` dan `npm run dev` pada dua terminal. Frontend meneruskan `/api` ke port 3001.

`npm run build` menghasilkan frontend pada `dist`; `npm run preview` menyediakan pratinjau hasil build. Pada produksi, layani frontend dan API di origin HTTPS yang sama. Ngrok untuk preview harus menunjuk frontend yang meneruskan API.

Untuk membagikan preview lokal melalui HTTPS sementara, ikuti [TUNNELING.md](TUNNELING.md).

## Aplikasi dan PWA

Hasil build mendukung pemasangan **BahasaKita** dari Pengaturan atau menu browser, dengan favicon dan ikon layar utama dari logo BahasaKita. Saat koneksi terputus, navigasi menampilkan halaman bantuan offline. Asesmen, video, chat, dan penyimpanan progres tetap memerlukan internet; service worker hanya menyimpan aset publik, tanpa cache data akun atau antrean jawaban/pesan. Pembaruan diterapkan setelah tab ditutup atau melalui tombol pembaruan di Pengaturan.

Jalankan `npm run test:pwa` untuk memeriksa manifest, instalabilitas Chromium, offline, dan pembaruan. PWA aktif pada versi produksi melalui HTTPS/localhost, bukan server pengembangan Vite. Panduan pemasangan, hosting, batas offline, pengujian, dan daftar file ada di [PWA.md](PWA.md).

## Alur belajar

Login memakai Supabase Auth dengan konfirmasi email. Profil, foto privat, serta pengaturan akun tersimpan online. Sesi dipulihkan saat refresh; preferensi tampilan tamu tetap tersedia di perangkat.

Asesmen terdiri dari delapan soal untuk empat aspek: kosakata, kalimat, bacaan, dan akademik. Soal kedua pada setiap aspek menyesuaikan jawaban sebelumnya. Minimal nilai 80 membuka materi; nilai di bawahnya diarahkan ke kelas dasar dan asesmen ulang. Soal ditampilkan dari database dan dinilai server. Materi mempunyai pengantar, video/visual, latihan, dan lima soal evaluasi. Penguasaan memerlukan nilai minimal 80 tanpa mengulang kesalahan pada soal yang sama dari percobaan sebelumnya.

Jawaban dan tahap sesi tersimpan online, sehingga belajar bisa dijeda dan dilanjutkan. Pengiriman ulang memakai ID permintaan yang sama agar kegagalan koneksi tidak menggandakan jawaban. Riwayat tersedia pada Kemajuan. Progres antarjenjang dan antarversi materi dipisahkan. Progres lokal versi lama disimpan sebagai arsip yang belum terverifikasi, tanpa membuka akses berdasarkan nilai perangkat.

## Admin konten

Akun admin membuka **Kelola konten** (`/admin`) untuk membuat/mengedit materi, video/teks kelas dasar, serta soal dan kuncinya. Simpan sebagai draft, lalu terbitkan. Konten terbit memiliki versi tetap; sesi aktif mempertahankan versi yang digunakan saat mulai. Pengaturan admin berada pada tabel `user_roles` dan tidak bisa dinaikkan lewat metadata atau kiriman siswa.

Bank awal berisi 12 materi, 4 kelas dasar, 36 soal asesmen, 12 latihan, serta 60 soal evaluasi. Sumber seed ada di `content/legacy-*.js`; jalankan `npm run seed:learning` untuk menyusun SQL awal dan skrip deploy gabungan. Berkas seed tidak dimuat oleh frontend. Kunci disimpan di schema privat, sementara katalog publik hanya berisi materi, pertanyaan, serta pilihan.

Admin langsung masuk ke `/admin` setelah izin akun terverifikasi. Navigasi belajar disembunyikan pada mode admin. Tombol **Lihat sebagai siswa** membuka sesi pratinjau dengan penilaian server, pilihan jenjang, dan progres uji tersendiri. Jawaban, nilai, penguasaan, serta perubahan profil/pengaturan pratinjau disimpan sementara pada server; foto dan video uji tetap lokal di browser. **Kembali ke admin** mengakhiri sesi tersebut. Sesi dapat dilanjutkan setelah refresh pada tab yang sama selama server masih aktif, dan berakhir setelah 60 menit tanpa aktivitas. Login siswa tetap memakai alur belajar biasa.

Kamus Visual dan katalog video referensi masih dikelola dalam `src/gradeDictionary.js` dan `src/youtubeMaterials.js`. Aturan penilaian/rekomendasi (ambang 80, empat aspek, jumlah soal) tetap aturan aplikasi. Konten contoh belum menjadi instrumen asesmen atau kurikulum yang tervalidasi; materi/video instruksi perlu tinjauan pendidik dan komunitas Tuli. Video lokal pada Pengaturan hanya pratinjau sesi. Fitur unduh luring, reset password, dan penghapusan akun belum tersedia.

## Guru dan orang tua

Setelah migrasi 007, registrasi mendukung siswa, guru, dan orang tua. Akun lama dapat diatur oleh admin melalui **Akun pendamping**. Guru/orang tua langsung masuk dashboard di `/support`, tanpa asesmen atau menu belajar siswa.

Siswa membuat kode undangan sekali pakai (24 jam) di **Pendamping**. Hanya akun yang menerima undangan sesuai perannya yang dapat melihat progres siswa. Guru melihat empat aspek, riwayat dan ringkasan kesulitan, memberi tugas dari materi terbit sesuai jenjang, serta catatan. Orang tua melihat perkembangan anak, tugas/catatan guru, dan saran kegiatan di rumah. Status tugas ditentukan oleh penguasaan evaluasi yang dinilai server sejak tugas diberikan. Siswa tetap dapat belajar mandiri. Kedua pihak dapat memutuskan hubungan dan akses langsung dihentikan. Panduan aktivasi dan pengujian akun tersedia di [SETUP-SUPABASE.md](SETUP-SUPABASE.md).

## Verifikasi

Jalankan `npm test` untuk unit/komponen, API, dan database lokal. `npm run test:all` menambahkan laporan coverage frontend, build produksi, dan seluruh alur browser. Untuk fokus unit saja gunakan `npm run test:unit`; laporan coverage terpisah dibuat dengan `npm run test:coverage`.

Panduan setup, perintah, matriks fitur, CI, dan batas verifikasi ada di [TESTING.md](TESTING.md). Tes berjalan dengan data uji tanpa menulis ke Supabase asli. Pemeriksaan layanan cloud mengikuti [SETUP-SUPABASE.md](SETUP-SUPABASE.md).

## Akun
siswa
usn : kevinalmer4@gmail.com
pass : password

admin
usn : kevinalmer@apps.ipb.ac.id
pass : password

guru/pendamping
usn: farisdff94@gmail.com
pass: 12345678

## Struktur

- `src/learning.jsx`: store online, katalog, rekomendasi, dan API sesi.
- `src/OnlineLearning.jsx`: asesmen dan sesi belajar tanpa kunci jawaban klien.
- `src/Admin.jsx`: editor materi/soal, draft, dan publikasi.
- `src/LearningApp.jsx`: kerangka aplikasi, beranda, jalur, profil, progres, kamus, dan pengaturan.
- `src/BasicClass.jsx`: kelas dasar dari katalog database.
- `server/src/learning-routes.ts`: validasi dan rute belajar/admin.
- `supabase/migrations/004*.sql`: skema, RLS, RPC penilaian, serta editor admin.
- `supabase/migrations/005_learning_seed.sql`: isi awal.
- `supabase/migrations/006_first_admin.sql`: bootstrap admin.
