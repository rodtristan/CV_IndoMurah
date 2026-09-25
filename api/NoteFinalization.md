#1
A. Halaman sudah ada, tapi logikanya belum jalan

Halaman ini tampil seperti Ketoko, tetapi tidak menyimpan atau memproses apa pun di server.

Fitur panduan	Kondisi sekarang
Proses Tutup Tahun	Simulasi. Tidak ada endpoint, tidak ada jurnal penutup.
Proses Perbaikan Saldo	Simulasi (setTimeout lalu pesan "selesai").
Setting Perkiraan	Hanya di localStorage browser. Jurnal otomatis tidak memakainya.
Saldo Awal Perkiraan / Hutang / Piutang	Hanya di browser ("belum ada API").
List Backup & Pengaturan Database	Ditandai "belum tersedia di server".
Import Item (3 varian: Satuan, Level, Jumlah)	Ditandai "belum tersedia di server". Yang jalan: Supplier, Pelanggan, dan Item 1 Harga.
Pengaturan Umum (opsi bertanda *)	Disimpan di browser saja, tidak di server.
B. Belum ada halamannya
Daftar Pembayaran Pembelian dan Penjualan. Backend purchase-payment dan sale-payment ada, tetapi tidak ada satu pun halaman frontend yang memakainya.
Status Lunas Bg/Cek (pembelian, penjualan, dan sales).
Daftar Pembayaran Sales beserta Pembayaran Komisi Sales.
Buku Besar. Logikanya ada di business-logic/accounting, tetapi belum ada halaman dan belum ada laporan.
Auto Patch.
Export CSV Faktur Penjualan.
C. Laporan: panduan punya ~75, website baru ~20

Yang sudah ada: Master (5), Pembelian (3), Penjualan (4), Laba Jual (2), Persediaan (3), Neraca Saldo, Daftar Jurnal, dan Daftar Perkiraan.

Yang belum ada:

Pembelian: Pesanan Pembelian, Retur Pembelian, Pembelian Per Item.
Penjualan: Pesanan Penjualan, Retur Penjualan, Retur Per Item, Per Supplier, Per Wilayah Pelanggan, Komisi Sales, Pembayaran Komisi, Pembayaran Kartu Bayar, Pembayaran E-Money, Point Pelanggan.
Grafik: Item Terbaik, Harian, Bulanan, Kedatangan Pelanggan, Laba Jual Per Item.
Hutang (7): Beredar, Umur, Buku Bantu, Mutasi, Per Transaksi, Pembayaran. Halaman reports/debt hanya versi ringkas.
Piutang (8): Beredar, Per Sales, Per Wilayah, Umur, Buku Bantu, Mutasi, Per Transaksi, Pembayaran.
Persediaan: Item Masuk, Item Keluar, Item Transfer, Item Tidak Laku. Laporan Opname dan Mutasi sudah ada.
Kas: Kas Masuk, Kas Keluar, Kas Transfer.
Laba Jual: Analisa Laba Jual Detail.
Jurnal: Analisa Jurnal Tidak Seimbang.
Buku Besar dan Neraca Lajur.
Keuangan: Neraca, Laba Rugi, Laba Rugi YTD. Halaman reports/financial memakai endpoint profit-loss versi lama, bukan laporan Ketoko.
D. Fitur yang sengaja dinonaktifkan (sesuai arahan Anda)
Pesanan Penjualan dan Pesanan Pembelian.
Stock Minimum.
Riwayat Serial.
Komisi Sales.
Faktur Pajak.
History Harga Beli.
Kas Transfer (menu sidebar dimatikan, padahal halamannya ada).
E. Di luar cakupan
Semua yang berkaitan dengan Ketoko.co.id sebagai layanan SaaS: registrasi, billing, order paket.
Design Report (editor desain bukti dan laporan).
Share Info dan Verifikasi Member e-commerce.
Saran urutan
Daftar Pembayaran + Status Lunas Bg/Cek, karena backend-nya sudah ada dan ini inti transaksi.
Laporan Hutang dan Piutang (umur, buku bantu, mutasi). Data sudah ada di debt.ts, tinggal dikembangkan.
Laporan Kas, Persediaan (masuk/keluar/transfer), Retur, dan Grafik. Semuanya tinggal tambah provider di report-engine.
Saldo Awal Perkiraan/Hutang/Piutang dan Setting Perkiraan. Butuh endpoint dan migrasi baru.
Neraca, Laba Rugi, Buku Besar, Tutup Tahun. Ini terakhir karena bergantung pada nomor 4.




#2
Laporan QC: CV IndoMurah (POS/ERP)
Aplikasi ini belum siap produksi. Tampilan dan wiring-nya sudah sehat: kedua sisi lolos type-check, semua 119 halaman terbuka tanpa error, dan semua 170 panggilan API di frontend cocok dengan route backend. Masalahnya ada di keamanan dan integritas data. Contohnya, stok tidak bertambah saat pembelian dan laporan keuangan tidak memuat penjualan.

Semua pengujian live hanya membaca data atau memakai data fiktif yang dibatalkan database. Tidak ada data yang saya ubah. Saya juga tidak mengubah kode sama sekali.

Cara pengujian
Metode	Cakupan	Hasil
Type-check tsc --noEmit	api + web	✅ 0 error di keduanya
Pencocokan route frontend ↔ backend (skrip)	170 panggilan statis + 33 endpoint dari konfigurasi komponen	✅ tidak ada 404 atau salah method
Crawl otomatis semua halaman (Playwright headless)	119 halaman	✅ 0 halaman crash, 0 request API gagal; ada 2 error konsol ringan
Uji API live (curl)	auth, query engine, validasi DTO	❌ 4 celah terbukti
Review kode	auth, guard, base service, penjualan, pembelian, retur, stok, jurnal, laporan, Kasir POS	❌ lihat tabel temuan
Test otomatis / lint	jest, eslint	❌ 0 test; npm run lint di API rusak (ESLint 9 tapi config masih .eslintrc.js); web tidak punya config ESLint
Temuan bug (urut dari yang paling parah)
"Terbukti live" = sudah saya reproduksi langsung ke API yang berjalan. "Kode" = terlihat pasti dari source.

🔴 KRITIS
#	Temuan	Bukti	Dampak
K1	Hash password semua user bocor. GET /users?$select=Username,Password mengembalikan hash argon2. Parameter $select tidak dibatasi (whitelist) dan menimpa pengaturan yang menyembunyikan Password.	Terbukti live	Siapa pun yang login bisa mengambil hash admin lalu mencoba memecahkannya secara offline
K2	Siapa saja bisa menjadi admin. POST /auth/register terbuka tanpa login, cukup dengan kode perusahaan ("INDOMURAH" mudah ditebak). Saat login, roleId otomatis menjadi 1 (Administrator) kalau user belum punya role (auth-service.ts:65). Selain itu MenuAccessGuard tidak dipakai di endpoint mana pun, jadi semua user yang login punya akses penuh. User biasa juga bisa memberi dirinya role admin lewat POST /users/:id/roles.	Register tanpa login terbukti live; sisanya dari kode	Orang tanpa akun → buat akun sendiri → akses penuh ke semua data
K3	Pembelian tidak menambah stok. Retur penjualan dan retur pembelian juga tidak mengubah stok. Hanya penjualan, barang masuk, dan barang keluar yang mengubah stok. Ironisnya, logika yang benar sudah ada di business-logic/purchase (menambah stok global + stok per gudang + hutang supplier), tapi frontend memanggil modul lama.	Kode (grep semua service)	Stok terus menyusut dan akhirnya minus; stok di kasir salah
K4	Transaksi tidak pernah memposting jurnal. Penjualan, pembelian, pembayaran, kas masuk/keluar, dan retur tidak menulis ke JournalEntryLine. Padahal Neraca, Laba-Rugi, dan Buku Besar dibangun dari tabel itu (finance.ts:64).	Kode	Laporan keuangan hanya berisi jurnal manual; pendapatan dan HPP tidak muncul
K5	Total di Kasir POS berbeda dengan total yang disimpan backend. Kasir menerapkan diskon % per item (dari Product.DiscountPercent) dan diskon % nota. Backend mengabaikan keduanya dan hanya memakai DiscountAmount. Contoh: harga 10.000, diskon 10%, qty 2 → layar menampilkan 18.000, backend mencatat 20.000, pelanggan bayar 18.000 → status PARTIAL dan muncul piutang palsu 2.000. Metode bayar juga selalu tercatat CASH (pos/page.tsx:525). Error hanya masuk console.error, jadi kasir tidak diberi tahu kalau gagal.	Kode (kedua rumus dibandingkan)	Piutang palsu, setoran kas tidak cocok, kasir bisa input ulang dan terjadi transaksi ganda
🟠 TINGGI
#	Temuan	Bukti
T1	DTO penjualan tidak punya @Min/@IsPositive/@ArrayMinSize. Qty −50, harga −1000, dan daftar item kosong lolos validasi sampai ke database. Qty negatif = stok bertambah gratis.	Terbukti live (tertolak hanya karena FK fiktif → 500; tipe data salah ditolak 400, jadi validator memang aktif)
T2	Tidak ada pengecekan stok cukup di modul transaksi mana pun, sehingga stok bisa minus.	Kode
T3	Membatalkan penjualan (sale.service.ts:343) hanya mengganti status. Stok, poin, dan pembayaran tidak dikembalikan, padahal penjualan PARTIAL yang sudah ada pembayaran tetap bisa dibatalkan. Edit diskon/pajak juga tidak menghitung ulang Total.	Kode
T4	Endpoint generik warisan BaseController melewati logika bisnis. POST/DELETE /journal/bulk dan PUT /journal melewati validasi debit = kredit dan proteksi jurnal sistem. Baris jurnal (journal-entry) bisa diedit bebas. Edit atau hapus dokumen stok masuk/keluar/transfer/opname tidak mengoreksi stok, karena hanya create yang punya logika.	Kode
T5	Stock opname satu gudang men-set stok global produk ke hasil hitung, sehingga stok gudang lain terhapus. SystemStock dan Difference diambil dari klien, bukan dihitung server. Product.Stock (global) dan ProductStock (per gudang) tidak pernah disinkronkan.	Kode
T6	POST /sales/:id/payment tidak mengecek kelebihan bayar dan tetap menerima pembayaran untuk nota yang sudah PAID (/SalePayments mengecek). Pengecekan sisa bayar dilakukan di luar transaksi database, jadi dua pembayaran bersamaan bisa lolos (race condition).	Kode
T7	Hak akses role, data tambahan perusahaan, pengaturan website, dan data tambahan user hanya disimpan di localStorage browser (roles/page.tsx:90). Data hilang saat pindah perangkat dan tidak berlaku di server.	Kode
T8	Form Item punya ±40 field tapi hanya ±12 yang dikirim (ItemForm.tsx:288). Multi-satuan, harga bertingkat, pajak, diskon grup, gambar, rak, supplier, dan mapping akun hilang tanpa pemberitahuan saat disimpan.	Kode
T9	Retur penjualan tidak membatasi qty retur ≤ qty terjual, tidak mengecek bahwa produk memang ada di nota, dan harga retur dikirim dari klien. Satu nota bisa diretur berkali-kali.	Kode
🟡 SEDANG
#	Temuan
S1	SanitizePipe merusak data sah: menghapus --, data: (misalnya "metadata:" menjadi "meta"), /*, dan melakukan trim. Filter XSS-nya juga bisa ditembus dengan event handler tanpa tanda kutip (<img onerror=...>). Padahal KRichText merender HTML mentah dan token login disimpan di localStorage, jadi ada risiko stored XSS yang bisa mencuri token.
S2	Query engine menerima nama field dan operator Prisma apa pun. Filter $where[Code]=00123 → 500 (nilai diubah jadi angka). /brand/by/FieldTakAda/x → 500. (Keduanya terbukti live.)
S3	Tidak ada exception filter global, jadi semua error Prisma (FK, unique) muncul sebagai 500 tanpa pesan yang berguna.
S4	Nomor dokumen (SA-, OP-, dll.) dibuat di luar transaksi, sehingga transaksi bersamaan bentrok di constraint unique dan menghasilkan 500. Timezone memakai waktu server.
S5	Secret JWT punya nilai cadangan 'fallback-secret'. Token tetap berlaku 8 jam setelah user dinonaktifkan. Frontend tidak redirect ke login saat token kedaluwarsa di tengah sesi.
S6	Setiap request (termasuk semua GET) ditulis ke tabel logs (sudah 4.783 baris) dan response lengkapnya, termasuk JWT dari login, dicetak ke konsol. Endpoint /log bisa dibaca semua user. Invalidasi cache memakai perintah Redis KEYS, yang memblokir Redis.
S7	Batas request 10 per detik per IP. Semua kasir di belakang satu IP kantor (NAT) berbagi kuota ini, jadi rawan kena 429 saat ramai.
S8	Swagger /docs terbuka publik. 54 controller business-logic ter-mount tapi tidak dipakai frontend, sehingga menambah permukaan serangan.
S9	Operasi bulk (bulk create/update/delete) tidak memakai transaksi database, jadi bisa gagal sebagian. Pesan error Prisma mentah dikembalikan ke klien.
🟢 RENDAH
Warning React: key duplikat di /purchase/order.
Ada resource 404 di halaman /.
OpeningDebtPage.tsx adalah dead code.
15 blok catch hanya console.error, tanpa pesan ke user.
Halaman /sale/shipping lambat (9,2 detik saat dibuka pertama kali di mode dev).
✅ Yang sudah baik
Password di-hash dengan argon2id.
Login dibatasi 5 percobaan per menit.
Log DB meredaksi password.
Jurnal manual divalidasi seimbang.
Pembayaran pembelian dan /SalePayments menolak kelebihan bayar.
151/152 controller memakai JWT guard (yang tidak hanya /health).
Tabel rekomendasi pengecekan seluruh fitur
Prioritas: P0 = blokir rilis, P1 = sebelum go-live, P2 = setelahnya. Kolom "Status saat ini" adalah hasil audit ini.

Modul	Fitur	Skenario uji utama	Hasil yang diharapkan	Prio	Status saat ini
Keamanan	Login / Register	Register tanpa login; login user tanpa role; token user yang sudah dinonaktifkan	Register hanya oleh admin; tidak ada role default admin; token dicabut	P0	❌ K2, S5
Hak akses (RBAC)	Kasir mengakses /users, /journal, /log, dan menambah role ke dirinya sendiri	403	P0	❌ tidak ada RBAC
Kebocoran data	$select=Password, $include relasi sensitif, filter relasi	Field sensitif tidak pernah dikembalikan	P0	❌ K1
XSS / sanitasi	Simpan <img src=x onerror=…> di deskripsi item; simpan teks berisi --	Tag berbahaya ter-escape; teks sah tidak berubah	P1	❌ S1
Master	Item	Isi semua tab (multi-satuan, harga bertingkat, pajak, gambar) → simpan → buka lagi	Semua field kembali utuh	P0	❌ T8
Supplier / Pelanggan / Gudang / Satuan / Merek / Kategori	CRUD, kode kembar, hapus data yang masih dipakai transaksi	409/400 yang jelas, bukan 500	P1	⚠️ S3
Filter / cari di grid	Cari kode numerik "00123", kombinasi filter, sort	Hasil benar, tanpa 500	P1	❌ S2
Kasir POS	Transaksi	Item berdiskon %, diskon nota %, pajak 11%, pembulatan	Total di layar = total tersimpan	P0	❌ K5
Pembayaran	Tunai/kartu/QRIS; uang kurang; kembalian	Metode bayar tersimpan benar, status sesuai	P0	❌ K5
Stok	Jual melebihi stok; qty 0 atau negatif	Ditolak	P0	❌ T1, T2
Error / jaringan	API mati saat bayar; klik bayar dua kali	Pesan error muncul, tidak ada transaksi ganda	P1	❌ hanya console
Penjualan	Buat / Edit	Ubah diskon/pajak setelah dibuat	Total dihitung ulang	P1	❌ T3
Batal	Batal nota PARTIAL	Stok, poin, dan pembayaran kembali	P0	❌ T3
Pembayaran / piutang	Bayar melebihi sisa; 2 pembayaran bersamaan	Ditolak / terkunci	P1	⚠️ T6
Retur	Retur melebihi qty terjual; retur dua kali; konfirmasi retur	Ditolak; stok bertambah	P0	❌ T9, K3
Pembelian	Pembelian	Terima barang	Stok global + per gudang bertambah, hutang tercatat	P0	❌ K3
PO	PO → pembelian, status berubah	Konsisten	P1	🔍 belum dicek mendalam
Bayar / Giro / Retur	Bayar lebih; giro dicairkan; retur	Status dan stok benar	P1	✅ bayar / ❌ retur
Persediaan	Masuk / Keluar	Buat → edit qty → hapus	Stok ikut terkoreksi	P0	❌ T4
Transfer	Transfer A→B	Stok A berkurang, B bertambah	P1	❌ tidak mengubah stok
Opname	Opname di gudang A ketika ada gudang B	Hanya stok gudang A yang berubah	P0	❌ T5
Kartu stok / minimum	Bandingkan mutasi dengan saldo akhir	Cocok	P1	🔍 bergantung pada K3
Akuntansi	Posting otomatis	Jual / beli / kas → cek buku besar	Jurnal terbentuk otomatis	P0	❌ K4
Jurnal umum	Tidak seimbang via /bulk; hapus jurnal sistem	Ditolak	P0	❌ T4
Kas masuk/keluar/transfer, deposit	Buat → cek saldo akun	Saldo berubah	P1	❌ CRUD saja
Saldo awal / hutang-piutang awal	Simpan → buka dari browser lain	Data ada di server	P1	❌ localStorage
Tutup buku	Posting transaksi bertanggal tahun yang sudah ditutup	Ditolak	P1	❌ tidak ada penguncian
Laporan	Neraca / Laba-Rugi	Rekonsiliasi dengan total penjualan & pembelian	Cocok	P0	❌ K4
Penjualan / stok / hutang-piutang	Cocokkan dengan data transaksi; filter tanggal (timezone)	Cocok	P1	🔍
Designer / print	Cetak dengan data berisi karakter khusus	Aman & rapi	P2	✅ print sudah di-escape
Pengaturan	Role & hak akses	Atur hak → login di perangkat lain	Berlaku	P0	❌ T7
Perusahaan / Website / User	Simpan → buka dari browser lain	Tersimpan di server	P1	❌ sebagian localStorage
Penomoran	2 transaksi pada detik yang sama	Nomor unik, tidak 500	P1	❌ S4
Import / Backup	File besar & file rusak	Validasi per baris, transaksional	P2	🔍
Non-fungsional	Performa	5 kasir di balik satu IP; 10k produk	Tanpa 429, respons < 1 detik	P1	⚠️ S6, S7
Test otomatis	Unit test untuk kalkulasi & stok; e2e alur kasir	Tersedia di CI	P1	❌ 0 test
Urutan perbaikan yang saya rekomendasikan
Keamanan (1–2 hari): tutup /auth/register atau batasi ke admin, hapus default roleId ?? 1, whitelist $select/$where (blokir Password), aktifkan MenuAccessGuard, hapus secret cadangan JWT.
Stok (3–5 hari): arahkan pembelian dan retur ke logika di business-logic (atau porting logikanya), sinkronkan stok global dengan stok per gudang, pasang validasi stok dan @Min di semua DTO, balikkan stok saat batal/edit/hapus, dan nonaktifkan endpoint bulk/upsert generik untuk modul transaksi.
Kasir POS & Akuntansi (3–5 hari): satukan rumus diskon di backend (backend yang menghitung, frontend hanya menampilkan), kirim PaymentMethodID, lalu posting jurnal otomatis untuk setiap transaksi.
Fondasi: tambahkan exception filter Prisma, nomor dokumen via sequence DB, perbaiki config ESLint, dan tulis test untuk kalkulasi total & mutasi stok. Ini yang mencegah bug kelas K3/K5 kembali.
Catatan: ada user qa_tmp_user di DB yang bukan saya buat. Kemungkinan sisa sesi QA sebelumnya; perlu dicek apakah masih dibutuhkan.

Mau saya jadikan laporan ini halaman web yang bisa dibagikan ke tim, atau langsung mulai perbaikan dari langkah 1 (keamanan)?