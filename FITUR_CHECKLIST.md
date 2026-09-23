# Checklist Fitur: Panduan Ketoko.co.id vs Implementasi CV IndoMurah

Dokumen ini membandingkan **semua fitur** yang dijelaskan di `panduan_v2/`
(180 halaman dokumentasi bawaan Ketoko.co.id) dengan apa yang **sudah**
diimplementasikan di aplikasi POS/ERP CV IndoMurah (`web/` + `api/`).

**Legenda status:**
- ✅ **Sudah** — fitur berfungsi dan sudah diverifikasi (browser/curl)
- 🟡 **Sebagian** — backend/frontend ada tapi tidak lengkap, atau versi sederhana
- ❌ **Belum** — belum ada sama sekali, masih dalam rencana (checkpoint panduan_v2)
- 🚫 **Di luar cakupan** — sengaja tidak dikerjakan (keputusan Anda sebelumnya), lihat alasan di tiap baris

**Ringkasan cepat:**

| Kategori | Sudah | Sebagian | Belum | Di luar cakupan |
|---|---|---|---|---|
| Panduan/Billing Ketoko.co.id | 0 | 0 | 0 | 9 |
| Pengenalan Program (dok UI) | 0 | 0 | 0 | 10 |
| Input Master & Saldo Awal | 6 | 4 | 8 | 0 |
| Import Data | 0 | 0 | 6 | 0 |
| Persediaan | 4 | 0 | 2 | 1 |
| Pembelian | 2 | 2 | 1 | 2 |
| Penjualan | 3 | 2 | 5 | 3 |
| Akuntansi | 3 | 5 | 4 | 0 |
| Laporan | 8 | 6 | ~35 | 4 |
| Disain Bukti & Laporan | 0 | 0 | 0 | 11 |
| Pengaturan | 3 | 0 | 8 | 2 |
| Share Info / E-commerce | 0 | 0 | 0 | 3 |

*(Angka "Belum" untuk Laporan besar karena mayoritas breakdown laporan —
per-item, per-wilayah, umur piutang/hutang, grafik, dll — direncanakan
dibangun sekaligus sebagai parameter query OData di atas 7 endpoint laporan
yang sudah ada, bukan sebagai halaman terpisah satu-satu.)*

---

## 1. Panduan Ketoko.co.id & Billing — 🚫 Di luar cakupan

Seluruh bagian ini menjelaskan produk SaaS Ketoko.co.id sendiri (signup,
paket langganan, billing), bukan logika bisnis toko. Disepakati untuk
di-skip sepenuhnya.

- [ ] 🚫 Panduan Ketoko.co.id
- [ ] 🚫 Membuka Program Pertama Kali
- [ ] 🚫 Melakukan Registrasi Ketoko.co.id
- [ ] 🚫 Setup Website Ketoko.co.id untuk pertama kali
- [ ] 🚫 Panduan Penggunaan Billing
- [ ] 🚫 Melakukan Order Paket
- [ ] 🚫 Melakukan Konfirmasi Pembayaran
- [ ] 🚫 Melihat Layanan
- [ ] 🚫 Perpanjang Layanan
- [ ] 🚫 Upgrade Layanan
- [ ] 🚫 Mengelola Data Perusahaan (Password & Data Perusahaan) — *ini versi billing Ketoko, beda dengan Data Perusahaan toko yang sudah ada di Pengaturan*
- [ ] 🚫 Mengelola Data Pribadi
- [ ] 🚫 Mengganti Password Billing

## 2. Pengenalan Bagian-bagian Program — 🚫 Dokumentasi UI, bukan fitur

Ini adalah tur UI Ketoko.co.id (penjelasan menu & tampilan), bukan fitur
bisnis yang perlu di-porting satu-satu — tampilan aplikasi ini sudah
mengikuti pola serupa (sidebar, tabel data, filter).

- [ ] 🚫 Menu Master Data / Pembelian / Penjualan / Persediaan / Akuntansi / Laporan / Pengaturan (dokumentasi navigasi)
- [ ] 🚫 Tampilan Daftar Pencarian
- [ ] 🚫 Tampilan Daftar Item
- [ ] 🚫 Tampilan Daftar Transaksi

---

## 3. Input Master & Saldo Awal

- [x] ✅ Input Data Jenis (Kategori) — `master/categories`
- [x] ✅ Input Data Satuan (Unit) — `master/units`
- [x] ✅ Input Data Merek (Brand) — `master/brands`
- [x] ✅ Input Data Supplier — `master/suppliers`
- [x] ✅ Input Data Pelanggan — `master/customers`
- [x] ✅ Input Data Sales — `master/sales-persons`
- [x] ✅ Input Data Item / Barang — `master/items`
- [ ] 🟡 Input Data Item Mode Mudah — hanya ada satu form input, tidak ada pemisahan mode "mudah" vs "sedang" seperti Ketoko
- [ ] 🟡 Input Data Item Mode Sedang — sama seperti di atas
- [ ] ❌ Item dengan Harga Jual berdasarkan Satuan — harga jual bertingkat per satuan (pcs/dus/lusin) belum ada
- [ ] ❌ Item dengan Harga Jual berdasarkan Jumlah — harga grosir bertingkat berdasarkan qty belum ada
- [ ] ❌ Item dengan Harga Jual berdasarkan Level — harga per level pelanggan (retail/grosir/VIP) belum ada — *catatan: `customerGroup` sudah ada di model Customer tapi belum dipakai untuk penentuan harga*
- [x] ✅ Edit dan Hapus Data Item — CRUD penuh di `master/items`
- [ ] ❌ Saldo Awal Item Barang — *direncanakan Checkpoint 2*
- [ ] ❌ Saldo Awal Hutang — *sengaja ditunda, terikat ke kedalaman ledger yang di-skip*
- [ ] ❌ Saldo Awal Piutang — *sama, ditunda*
- [ ] ❌ Saldo Awal Perkiraan — *sama, ditunda*
- [ ] 🟡 Departemen / Gudang — Gudang (`master/warehouses`) sudah ada; konsep "Departemen" terpisah tidak ada (ada model `Department` di skema tapi itu untuk modul HR/kepegawaian yang tidak terkait fitur ini)
- [ ] ❌ Bank — tidak ada modul/master data Bank
- [ ] ❌ Ongkir — tidak ada master data ongkos kirim
- [ ] 🟡 Point Pelanggan — backend `PointSetting`/`PointRedemption` sudah ada dan berfungsi (diverifikasi via curl), tapi belum ada halaman pengaturan point di frontend

## 4. Import Data — ❌ Belum ada sama sekali

*Direncanakan Checkpoint 7 — upload CSV + reuse endpoint `createBulk` yang sudah ada di supplier/customer/product.*

- [ ] ❌ Import Data Supplier
- [ ] ❌ Import Data Pelanggan
- [ ] ❌ Import Item Berdasarkan 1 Harga
- [ ] ❌ Import Item Berdasarkan Satuan
- [ ] ❌ Import Item Berdasarkan Level
- [ ] ❌ Import Item Berdasarkan Jumlah

## 5. Persediaan (Inventory)

- [x] ✅ Daftar Item Masuk — `inventory/stock-in`
- [x] ✅ Daftar Item Keluar — `inventory/stock-out`
- [x] ✅ Stock Opname — `inventory/stock-opname`
- [ ] ❌ Proses Perbaikan Saldo — tidak ada fitur koreksi/perbaikan saldo stok manual di luar stock opname
- [x] ✅ Transfer Item — `inventory/transfers`
- [ ] 🚫 Stock Minimum — *sengaja dinonaktifkan (menu di-disable), sesuai keputusan Anda*
- [ ] ❌ (Saldo Awal — lihat di bagian Input Master, sama)

## 6. Pembelian (Purchase)

- [ ] 🟡 Pesanan Pembelian — halaman ada dan berfungsi (`purchase/order`) tapi menu sidebar-nya sengaja **dinonaktifkan**; *sesuai keputusan Anda: stop dikembangkan lebih lanjut*
- [x] ✅ Daftar Pembelian — `purchase/list`
- [ ] 🚫 History Harga Beli — *sengaja diskip sesuai keputusan Anda*
- [x] ✅ Retur Pembelian — `purchase/returns` *(baru dibangun sesi ini — sebelumnya link sidebar 404, backend-nya sudah lama ada)*
- [ ] 🟡 Daftar Pembayaran (Pembelian) — modul backend `PurchasePayment` ada dan terdaftar, tapi belum ada halaman daftar pembayaran khusus di frontend (pembayaran saat ini terikat ke transaksi pembelian)
- [ ] ❌ Status Lunas Bg/Cek — tracking status giro/cek untuk pembayaran ke supplier belum ada

## 7. Penjualan (Sales)

- [ ] 🚫 Pesanan Penjualan (Sales Order) — *sengaja diskip sesuai keputusan Anda, tidak pernah dibangun*
- [x] ✅ Penjualan (transaksi POS) — `sale/pos`, `sale/list` — **flow paling kritis**, sempat rusak total sebelum diperbaiki sesi lalu, sekarang terverifikasi end-to-end
- [ ] ❌ History Harga Jual — *direncanakan Checkpoint 4 (query read-only dari data Sale/SaleItem yang ada)*
- [ ] 🟡 Daftar Pembayaran (Penjualan) — modul backend `SalePayment` ada, belum ada halaman daftar khusus di frontend
- [ ] ❌ Status Lunas Cek/Bg — belum ada
- [x] ✅ Retur Penjualan — `sale/returns`
- [ ] ❌ Point Penjualan — *direncanakan Checkpoint 4; backend `PointSetting`/`PointRedemption` sudah siap dan teruji, tinggal UI di alur POS*
- [ ] ❌ Daftar Pembayaran Sales (komisi) — belum ada
- [ ] ❌ Status Lunas Cek/Bg Sales — belum ada
- [ ] ❌ Data Pengiriman — *direncanakan Checkpoint 4 (status pengiriman di Sale)*
- [ ] 🚫 Export CSV Faktur Penjualan — *sengaja diskip sesuai keputusan Anda*

## 8. Akuntansi

- [ ] 🟡 Daftar Perkiraan (Chart of Accounts) — modul `account` ada dan berfungsi minimal, tapi *sengaja tidak dikembangkan lebih jauh* sesuai keputusan Anda
- [x] ✅ Kas Masuk — `accounting/cash-in`
- [x] ✅ Kas Keluar — `accounting/cash-out`
- [ ] 🟡 Kas Transfer — halaman ada dan berfungsi tapi *sengaja tidak dikembangkan lebih jauh*
- [x] ✅ Deposit Pelanggan — `accounting/customer-deposits`
- [x] ✅ Deposit Supplier — `accounting/supplier-deposits`
- [ ] ❌ Deposit Saldo (top-up saldo umum) — tidak ada fitur terpisah dari deposit pelanggan/supplier
- [ ] 🟡 Daftar Jurnal — modul `journal`/`journal-entry` ada, halaman ada tapi *sengaja tidak dikembangkan lebih jauh*
- [ ] ❌ Buku Besar (General Ledger) — *sengaja ditunda, butuh kedalaman ledger yang di luar cakupan saat ini*
- [ ] ❌ Saldo Awal Perkiraan/Hutang/Piutang — *ditunda* (duplikat dari bagian Input Master)
- [ ] ❌ Setting Perkiraan — pengaturan lanjutan akun (mapping otomatis, dsb.) belum ada
- [ ] ❌ Proses Tutup Tahun (year-end closing) — belum ada

## 9. Laporan (Reports)

Arsitektur laporan di aplikasi ini beda dari Ketoko: bukan 1 halaman per
jenis laporan, tapi **7 endpoint dasar** (`reports/sales`, `purchase`,
`inventory`, `cash`, `profit-loss`, `debt`, `receivable`) yang akan
diperluas dengan parameter query bergaya OData (`$where`, `$groupBy`,
rentang tanggal) untuk mencakup breakdown yang di Ketoko jadi halaman
terpisah. Status di bawah ini mencerminkan **breakdown spesifik**, bukan
endpoint dasarnya.

**Laporan Master**
- [x] ✅ Daftar Item / Supplier / Pelanggan / Sales — tersedia lewat masing-masing halaman master (bukan laporan cetak terpisah, tapi datanya identik)

**Laporan Pembelian**
- [ ] 🚫 Laporan Pesanan Pembelian — *terikat ke fitur Pesanan Pembelian yang diskip*
- [x] ✅ Laporan Pembelian — `reports/purchase`
- [ ] ❌ Laporan Retur Pembelian — belum ada breakdown khusus
- [ ] ❌ Laporan Pembelian Per Item — *direncanakan Checkpoint 5*

**Laporan Penjualan**
- [ ] 🚫 Laporan Pesanan Penjualan — *terikat fitur yang diskip*
- [x] ✅ Laporan Penjualan — `reports/sales`
- [ ] ❌ Laporan Retur Penjualan — belum ada breakdown khusus
- [ ] 🟡 Laporan Penjualan Per Item — data `byProduct` sudah ada di `reports/sales`, tapi belum jadi laporan breakdown mandiri dengan filter sendiri
- [ ] ❌ Laporan Retur Penjualan Per Item — belum ada
- [ ] ❌ Laporan Penjualan Per Supplier — belum ada
- [ ] ❌ Laporan Penjualan Per Wilayah Pelanggan — belum ada (butuh field wilayah di master pelanggan)
- [ ] 🚫 Laporan Komisi Sales — *terikat fitur Komisi Sales yang diskip*
- [ ] 🚫 Laporan Pembayaran Komisi Sales — *sama*
- [ ] ❌ Laporan Pembayaran dengan Kartu Bayar — belum ada (tidak ada tracking metode kartu terpisah)
- [ ] ❌ Laporan Pembayaran dengan E-Money — belum ada
- [ ] ❌ Laporan Grafik Penjualan Item Terbaik/Harian/Bulanan — *terkait gap `reports/sales/summary` yang ditemukan sesi ini (dashboard & halaman laporan penjualan memanggil endpoint yang belum ada — chart-nya kosong tapi tidak error)*
- [ ] ❌ Laporan Grafik Kedatangan Pelanggan — belum ada
- [ ] ❌ Laporan Point Pelanggan — belum ada (terkait fitur Point Penjualan yang juga belum ada UI-nya)

**Laporan Hutang** *(endpoint dasar `reports/debt` ✅ ada, breakdown di bawah ❌ belum)*
- [x] ✅ Laporan Hutang (dasar) — `reports/debt`
- [ ] ❌ Laporan Hutang Beredar (outstanding)
- [ ] ❌ Laporan Umur Hutang (aging)
- [ ] ❌ Laporan Buku Bantu Hutang
- [ ] ❌ Laporan Mutasi Hutang
- [ ] ❌ Laporan Buku Hutang Per Transaksi
- [ ] ❌ Laporan Pembayaran Hutang

**Laporan Piutang** *(endpoint dasar `reports/receivable` ✅ ada, breakdown di bawah ❌ belum)*
- [x] ✅ Laporan Piutang (dasar) — `reports/receivable`
- [ ] ❌ Laporan Piutang Beredar
- [ ] ❌ Laporan Piutang Per Sales
- [ ] ❌ Laporan Piutang Per Wilayah
- [ ] ❌ Laporan Umur Piutang (aging)
- [ ] ❌ Laporan Buku Bantu Piutang
- [ ] ❌ Laporan Mutasi Piutang
- [ ] ❌ Laporan Buku Piutang Per Transaksi
- [ ] ❌ Laporan Pembayaran Piutang

**Laporan Persediaan** *(endpoint dasar `reports/inventory` ✅ ada, breakdown di bawah ❌ belum)*
- [x] ✅ Laporan Persediaan (dasar) — `reports/inventory`
- [ ] ❌ Laporan Item Masuk (breakdown laporan, bukan halaman transaksi — sudah ada di Persediaan)
- [ ] ❌ Laporan Item Keluar (breakdown laporan)
- [ ] ❌ Laporan Item Opname (breakdown laporan)
- [ ] ❌ Laporan Item Transfer (breakdown laporan)
- [ ] ❌ Laporan Mutasi Item
- [ ] ❌ Laporan Item Tidak Laku (slow-moving stock)

**Laporan Kas** *(endpoint dasar `reports/cash` ✅ ada)*
- [x] ✅ Laporan Kas (dasar) — `reports/cash`
- [ ] ❌ Laporan Kas Masuk (breakdown laporan)
- [ ] ❌ Laporan Kas Keluar (breakdown laporan)
- [ ] ❌ Laporan Kas Transfer (breakdown laporan)

**Laba Jual**
- [x] ✅ Laba Jual (dasar, gross/net profit) — `reports/profit`, `reports/profit-loss`
- [ ] ❌ Analisa Laba Jual Detail (per transaksi/item) — belum ada
- [ ] ❌ Grafik Laba Jual Per Item — belum ada

**Data Jurnal & Buku Besar** *(ditunda — ledger depth di luar cakupan)*
- [ ] ❌ Daftar Jurnal (laporan)
- [ ] ❌ Analisa Jurnal Tidak Seimbang
- [ ] ❌ Buku Besar (laporan)
- [ ] ❌ Neraca Saldo
- [ ] ❌ Neraca Lajur

**Keuangan**
- [x] ✅ Laba Rugi — `reports/profit`, `reports/financial` (keduanya sudah dibetulkan sesi ini agar sesuai bentuk data backend yang sebenarnya)
- [ ] ❌ Neraca (Balance Sheet) — belum ada
- [ ] ❌ Laba Rugi YTD (year-to-date) — belum ada

## 10. Disain Bukti dan Laporan — 🚫 Di luar cakupan

Fitur WYSIWYG report/invoice designer bawaan Ketoko.co.id. Disepakati untuk
di-skip sepenuhnya (bukan logika bisnis toko).

- [ ] 🚫 Mengenal Design Report
- [ ] 🚫 Mengenal Area Disain
- [ ] 🚫 Mengubah Ukuran Kertas
- [ ] 🚫 Menambah Text / Tulisan
- [ ] 🚫 Menghapus Objek Text atau yang lain
- [ ] 🚫 Menambah Text dari Data Binding
- [ ] 🚫 Mengubah Format Text
- [ ] 🚫 Menambah Sub Total
- [ ] 🚫 Membuat Rumus Pada Desain Bukti atau Laporan
- [ ] 🚫 Membuat Summary/Total Pada Desain Bukti Atau Laporan
- [ ] 🚫 Setting Printer Untuk Faktur Jual

## 11. Pengaturan (Settings)

- [x] ✅ Data User — `settings/users` (diperbaiki sesi ini: form create sekarang kirim `username`/`companyId` sesuai DTO backend yang sudah benar)
- [ ] ❌ Kelompok Akses User (izin per menu) — *direncanakan Checkpoint 6; backend `Role`/`Menu`/`RoleMenu` sudah nyata dari merge sebelumnya, tinggal UI-nya*
- [x] ✅ Daftar User — sama seperti Data User di atas
- [ ] ❌ Pengaturan Umum — *direncanakan Checkpoint 3*
- [ ] ❌ Pengaturan Transaksi — *sama, Checkpoint 3*
- [ ] ❌ Pengaturan Desimal Digit — *sama, Checkpoint 3*
- [x] ✅ Data Perusahaan — `settings/company`
- [ ] ❌ Setting Nomor — *direncanakan Checkpoint 3; backend `NumberingModule` sudah ada & terdaftar, belum ada halaman frontend*
- [ ] ❌ No. Transaksi (bagian dari Setting Nomor) — sama
- [ ] ❌ No Supplier, Pelanggan, Sales (bagian dari Setting Nomor) — sama
- [ ] ❌ Log Aktivitas — *direncanakan Checkpoint 6; backend `Log` model + `LoggingInterceptor` sudah menangkap semua aktivitas, tinggal halaman viewer read-only*
- [ ] ❌ Log Aktivitas: Transaksi/Master/Akuntansi/Impor/Sistem/Auto Patch (kategori log) — sama, bagian dari viewer di atas
- [ ] 🚫 List Backup — kemungkinan di luar cakupan untuk instance Postgres self-hosted; perlu dikonfirmasi ke Anda dulu sebelum dikerjakan (bukan keputusan sepihak)
- [ ] 🚫 Pengaturan Database — sama, perlu konfirmasi

## 12. Share Info / Marketplace — 🚫 Di luar cakupan

Integrasi e-commerce/marketplace bawaan Ketoko.co.id. Disepakati untuk
di-skip sepenuhnya.

- [ ] 🚫 Share Info
- [ ] 🚫 Pesan Item Share
- [ ] 🚫 Verifikasi Member E-commerce

---

## Ringkasan Prioritas Berikutnya (sesuai rencana panduan_v2 yang sudah disetujui)

Checkpoint 0 (memastikan semua halaman yang ada berfungsi) **sudah selesai**
di sesi sebelumnya. Urutan checkpoint berikutnya yang diusulkan:

1. **Checkpoint 1** — Nonaktifkan tombol/menu untuk fitur yang di-skip (sebagian sudah: Pesanan Pembelian, Stock Minimum, Daftar Perkiraan, Kas Transfer, Jurnal sudah di-disable di Sidebar)
2. **Checkpoint 2** — Saldo Awal Item Barang
3. **Checkpoint 3** — Setting Nomor & Pengaturan Umum
4. **Checkpoint 4** — History Harga Jual, Point Penjualan, Data Pengiriman
5. **Checkpoint 5** — Breakdown laporan lewat parameter OData (mayoritas item ❌ di bagian Laporan di atas)
6. **Checkpoint 6** — Kelompok Akses User & Log Aktivitas
7. **Checkpoint 7** — Import Data

*Dokumen ini dibuat otomatis dari `panduan_v2/_toc.json` (180 halaman) dan
pengetahuan langsung atas kode `web/` & `api/` — bukan berdasarkan asumsi.
Beberapa status 🟡/❌ mungkin perlu dicek ulang jika ada perubahan kode di
luar sesi ini.*
