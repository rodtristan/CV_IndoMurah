# Business Logic Modules - API Endpoint Documentation

Dokumentasi lengkap untuk semua endpoint di module `business-logic/`. Semua endpoint membutuhkan autentikasi JWT Bearer token kecuali dinyatakan lain.

---

## Table of Contents

1. [POS - Point of Sale](#1-pos---point-of-sale)
2. [Receivable - Piutang Pelanggan](#2-receivable---piutang-pelanggan)
3. [Stock Alert - Alert Stok](#3-stock-alert---alert-stok)
4. [Analytics - Laporan & Analisis](#4-analytics---laporan--analisis)
5. [Inventory - Manajemen Stok](#5-inventory---manajemen-stok)
6. [Purchase - Pembelian](#6-purchase---pembelian)
7. [Purchase Order](#7-purchase-order)
8. [Purchase Return - Retur Pembelian](#8-purchase-return---retur-pembelian)
9. [HRM - Human Resource Management](#9-hrm---human-resource-management)
10. [Production - Produksi](#10-production---produksi)
11. [Service - Servis/Reparasi](#11-service---servisreparasi)
12. [Service Package - Paket Layanan](#12-service-package---paket-layanan)
13. [Expense - Pengeluaran](#13-expense---pengeluaran)
14. [Voucher - Voucher/Promo](#14-voucher---voucherpromo)
15. [Loyalty - Loyalty & Poin](#15-loyalty---loyalty--poin)
16. [Sale Return - Retur Penjualan](#16-sale-return---retur-penjualan)
17. [Accounting - Akuntansi](#17-accounting---akuntansi)
18. [Journal - Jurnal Umum](#18-journal---jurnal-umum)
19. [Quality Control](#19-quality-control)
20. [Work Order](#20-work-order)
21. [Assembly - Rakitan](#21-assembly---rakitan)
22. [Asset - Manajemen Aset](#22-asset---manajemen-aset)
23. [Cash - Manajemen Kas](#23-cash---manajemen-kas)
24. [Cash Flow - Arus Kas](#24-cash-flow---arus-kas)
25. [Customer - Pelanggan](#25-customer---pelanggan)
26. [Customer Deposit - Deposit Pelanggan](#26-customer-deposit---deposit-pelanggan)
27. [Supplier Debt - Hutang Supplier](#27-supplier-debt---hutang-supplier)
28. [Price - Manajemen Harga](#28-price---manajemen-harga)
29. [Product Unit](#29-product-unit)
30. [Product Price](#30-product-price)
31. [Product Type](#31-product-type)
32. [Production Recipe](#32-production-recipe)
33. [Production Request](#33-production-request)
34. [Production Schedule](#34-production-schedule)
35. [Production Material - Bahan Produksi](#35-production-material---bahan-produksi)
36. [Member Card - Kartu Anggota](#36-member-card---kartu-anggota)
37. [Reports - Laporan](#37-reports---laporan)
38. [Attendance Integration - Integrasi Absensi](#38-attendance-integration---integrasi-absensi)
39. [Notification Gateway - SMS & WhatsApp](#39-notification-gateway---sms--whatsapp)
40. [Budgeting - Penganggaran](#40-budgeting---penganggaran)
41. [Category & Brand - Master Data](#41-category--brand---master-data)
42. [Transfer - Transfer Dana](#42-transfer---transfer-dana)
43. [Stock Transfer - Transfer Stok](#43-stock-transfer---transfer-stok)
44. [Stock Mutation - Mutasi Stok](#44-stock-mutation---mutasi-stok)
45. [Stock Opname - Stock Taking](#45-stock-opname---stock-taking)
46. [Payroll - Gaji](#46-payroll---gaji)
47. [Salesperson](#47-salesperson)
48. [Supplier](#48-supplier)
49. [Warehouse](#49-warehouse)
50. [Leave - Cuti](#50-leave---cuti)
51. [Loan - Pinjaman](#51-loan---pinjaman)
52. [Notification - Notifikasi](#52-notification---notifikasi)

---

## 1. POS - Point of Sale

**Base Path:** `/api/business-logic/pos`

**Description:** Modul Point of Sale untuk kasir/toko retail. Mengelola pencarian produk, keranjang belanja, transaksi hold/resume, voucher, dan finalisasi penjualan.

### 1.1 Product Lookup (Pencarian Produk)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products/search` | Pencarian produk untuk display POS |
| GET | `/products/barcode` | Pencarian produk berdasarkan barcode (scanner) |
| GET | `/products/price-check` | Cek harga cepat dengan kuantitas dan pricing pelanggan |

### 1.2 Cart Management (Manajemen Keranjang)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/cart/open` | Buka sesi keranjang POS baru |
| POST | `/cart/add` | Tambah produk ke keranjang |
| PUT | `/cart/item/:productId` | Update kuantitas/harga item keranjang |
| DELETE | `/cart/item/:productId` | Hapus item dari keranjang |
| GET | `/cart` | Lihat ringkasan keranjang saat ini |
| DELETE | `/cart` | Kosongkan keranjang |

### 1.3 Hold & Resume (Simpan & Lanjutkan Transaksi)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/cart/hold` | Simpan transaksi sementara (hold) |
| POST | `/cart/resume` | Lanjutkan transaksi yang di-hold |
| GET | `/holds` | Daftar semua transaksi yang di-hold |

### 1.4 Voucher & Discount

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/voucher/apply` | Terapkan kode voucher ke transaksi |

### 1.5 Complete Transaction

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/transaction/complete` | Finalisasi transaksi POS |

---

## 2. Receivable - Piutang Pelanggan

**Base Path:** `/api/business-logic/receivable`

**Description:** Mengelola piutang pelanggan, pembayaran, deposit, limit kredit, dan aging report.

### 2.1 Overview & Listing

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/overview` | Daftar semua pelanggan dengan piutang outstanding |
| GET | `/customer/:customerId` | Riwayat piutang detail untuk satu pelanggan |
| GET | `/aging-report` | Generate aging report piutang |

### 2.2 Payment Recording

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/sale/:saleId/payment` | Catat pembayaran untuk penjualan |
| POST | `/bulk-payment` | Catat pembayaran massal untuk beberapa penjualan |

### 2.3 Customer Deposit

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/customer/:customerId/deposit` | Tambah deposit pelanggan (uang muka) |
| POST | `/customer/:customerId/use-deposit/:saleId` | Gunakan deposit untuk pembayaran |

### 2.4 Credit Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customer/:customerId/credit-check` | Cek apakah pelanggan bisa beli kredit |
| PUT | `/customer/:customerId/credit-limit` | Update limit kredit pelanggan |

### 2.5 Reminder & Notification

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/reminder` | Kirim pengingat pembayaran ke pelanggan |

### 2.6 Write-Off

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/write-off` | Tulis off piutang yang tidak bisa ditagih |

---

## 3. Stock Alert - Alert Stok

**Base Path:** `/api/business-logic/stock-alert`

**Description:** Membuat dan mengelola alert stok, reorder suggestion, dan stock level report.

### 3.1 Stock Alerts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Daftar semua stock alerts dengan filter |
| GET | `/summary` | Ringkasan alert stok untuk dashboard |
| PUT | `/:alertId/read` | Tandai alert sudah dibaca |
| PUT | `/read-multiple` | Tandai beberapa alert dibaca |
| PUT | `/:alertId/resolve` | Resolve satu alert |
| PUT | `/resolve-multiple` | Resolve beberapa alert sekaligus |

### 3.2 Stock Level Report

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stock-level-report` | Generate stock level report |

### 3.3 Reorder Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reorder-suggestion/:productId` | Get saran reorder untuk produk |
| GET | `/products-needing-reorder` | Daftar produk yang butuh reorder |
| POST | `/create-purchase-order` | Buat purchase order dari saran reorder |

### 3.4 Auto Check (Scheduler)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/check-stock` | Cek semua produk dan buat alert (untuk scheduler) |

---

## 4. Analytics - Laporan & Analisis

**Base Path:** `/api/business-logic/analytics`

**Description:** Laporan dan analisis bisnis komprehensif - sales, profit, top performers, inventory, cash flow, tax, dan trend.

### 4.1 Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Ringkasan dashboard komprehensif |

### 4.2 Sales Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sales-report` | Laporan penjualan detail |
| GET | `/sales-by-category` | Breakdown penjualan per kategori |

### 4.3 Profit Report

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profit-report` | Laporan profit/loss |

### 4.4 Top Performers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/top-products` | Produk terlaris |
| GET | `/top-customers` | Pelanggan dengan revenue tertinggi |

### 4.5 Inventory Report

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/inventory-report` | Laporan inventory/stock |

### 4.6 Cash Flow & Tax

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cash-flow` | Laporan cash flow |
| GET | `/tax-report` | Laporan pajak |

### 4.7 Trend Analysis

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sales-trend` | Analisis trend penjualan dengan perbandingan |

---

## 5. Inventory - Manajemen Stok

**Base Path:** `/api/business-logic/inventory`

**Description:** Transfer stok antar gudang, penyesuaian stok, stock opname, dan laporan stok.

### 5.1 Stock Transfer

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/transfer` | Transfer stok antar gudang |

### 5.2 Stock Adjustment

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/adjustment` | Sesuaikan stok (STOCK_IN, STOCK_OUT, CORRECTION) |

### 5.3 Stock Opname

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/opname` | Lakukan stock opname (stock take) |

### 5.4 Stock Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stock-report` | Laporan movement stok |
| GET | `/valuation-report` | Laporan valuation stok |

---

## 6. Purchase - Pembelian

**Base Path:** `/api/business-logic/purchase`

**Description:** Purchase Order, Goods Receipt, pembayaran supplier, retur pembelian, dan supplier deposit.

### 6.1 Purchase Order Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders` | Buat Purchase Order baru |
| GET | `/orders` | Daftar Purchase Orders |
| GET | `/orders/:id` | Get Purchase Order by ID |
| PUT | `/orders/:id` | Update Purchase Order |
| PUT | `/orders/:id/status/:statusCode` | Update status PO (APPROVED/CANCELLED) |

### 6.2 Purchase (Goods Receipt) Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Buat Purchase (Goods Receipt) |
| GET | `/` | Daftar Purchases |
| GET | `/:id` | Get Purchase by ID |

### 6.3 Purchase Payment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/:id/payment` | Catat pembayaran purchase |
| POST | `/bulk-payment` | Catat pembayaran massal |

### 6.4 Purchase Return Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/returns` | Buat Purchase Return |
| PUT | `/returns/:id/approve` | Approve Purchase Return |

### 6.5 Supplier Debt Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/supplier/:supplierId/debt-summary` | Ringkasan hutang supplier |
| POST | `/supplier/:supplierId/deposit` | Tambah deposit supplier |
| POST | `/supplier/:supplierId/use-deposit/:purchaseId` | Gunakan deposit untuk pembayaran |

---

## 7. Purchase Order

**Base Path:** `/api/business-logic/purchase-order`

**Description:** Purchase Order management dengan approval dan delivery recording.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Buat purchase order |
| GET | `/` | Daftar purchase orders |
| GET | `/:id` | Get purchase order by ID |
| PUT | `/:id/approve` | Approve purchase order |
| PUT | `/:id/cancel` | Cancel purchase order |
| POST | `/:id/delivery` | Catat delivery untuk purchase order |

---

## 8. Purchase Return - Retur Pembelian

**Base Path:** `/api/business-logic/purchase-return`

**Description:** Retur pembelian dengan approval workflow dan credit note generation.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Buat purchase return baru |
| GET | `/` | Daftar semua purchase returns |
| GET | `/:id` | Get purchase return by ID |
| PATCH | `/:id` | Update purchase return |
| POST | `/:id/approve` | Approve purchase return (buat credit note) |
| POST | `/:id/cancel` | Cancel purchase return |
| DELETE | `/:id` | Hapus purchase return pending |

---

## 9. HRM - Human Resource Management

**Base Path:** `/api/business-logic/hrm`

**Description:** Karyawan, absensi, cuti, payroll, dan loan management.

### 9.1 Employee Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/employees` | Buat karyawan baru |
| GET | `/employees` | Daftar karyawan |
| GET | `/employees/:id` | Get employee by ID |
| PUT | `/employees/:id` | Update employee |

### 9.2 Attendance Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/attendance` | Catat absensi |
| POST | `/attendance/bulk` | Catat absensi massal |
| GET | `/attendance` | Daftar records absensi |
| GET | `/attendance/summary/:employeeId` | Ringkasan absensi employee |

### 9.3 Leave Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/leaves` | Buat request cuti |
| GET | `/leaves` | Daftar request cuti |
| PUT | `/leaves/:id/approve` | Approve request cuti |
| PUT | `/leaves/:id/reject` | Reject request cuti |

### 9.4 Leave Balance Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/leave-balances` | Initialize leave balance |
| GET | `/leave-balances` | Daftar leave balances |

### 9.5 Payroll Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payroll` | Buat payroll |
| GET | `/payroll` | Daftar payroll records |
| GET | `/payroll/summary/:period` | Ringkasan payroll untuk period |
| PUT | `/payroll/:id/mark-paid` | Tandai payroll sebagai lunas |

### 9.6 Loan Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/loans` | Buat employee loan |
| GET | `/loans` | Daftar employee loans |
| GET | `/loans/:id` | Get loan details dengan cicilan |
| POST | `/loans/installment-payment` | Catat pembayaran cicilan loan |

---

## 10. Production - Produksi

**Base Path:** `/api/business-logic/production`

**Description:** Manajemen produksi dan Bill of Materials (BOM).

### 10.1 Production Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Buat produksi baru |
| GET | `/` | Daftar produksi |
| GET | `/:id` | Get produksi by ID |
| GET | `/reports/cost` | Laporan biaya produksi |

### 10.2 BOM Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bom/:productId` | Get Bill of Materials untuk produk |
| GET | `/bom/:productId/calculate` | Hitung biaya produksi dari BOM |

---

## 11. Service - Servis/Reparasi

**Base Path:** `/api/business-logic/service`

**Description:** Service order management untuk jasa servis/reparasi.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Buat service order baru (intake) |
| GET | `/` | Daftar service orders |
| GET | `/stats` | Statistik service |
| GET | `/:id` | Get service by ID |
| PUT | `/:id/status` | Update status service |
| POST | `/:id/items` | Tambah item ke service |
| PUT | `/:id/complete` | Complete service |
| POST | `/:id/payment` | Catat pembayaran service |

---

## 12. Service Package - Paket Layanan

**Base Path:** `/api/business-logic/service-package`

**Description:** Paket layanan, quotation, dan comparison.

### 12.1 Service Category

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/categories` | Buat service category |
| GET | `/categories` | Daftar service categories |
| GET | `/categories/:id` | Get category by ID |
| PATCH | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Delete category |

### 12.2 Service Package

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Buat service package |
| GET | `/` | Daftar service packages |
| GET | `/:id` | Get package by ID |
| PATCH | `/:id` | Update package |
| DELETE | `/:id` | Delete package |
| POST | `/:id/clone` | Clone/duplicate package |

### 12.3 Quote & Calculation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/quote` | Hitung quotation paket |
| POST | `/compare` | Bandingkan beberapa paket |
| GET | `/category/:categoryId/packages` | Get packages by category |

---

## 13. Expense - Pengeluaran

**Base Path:** `/api/business-logic/expense`

**Description:** Manajemen pengeluaran dengan approval workflow.

### 13.1 Category Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/categories` | Buat expense category |
| GET | `/categories` | Daftar expense categories |

### 13.2 Expense Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Buat expense |
| POST | `/bulk` | Buat expenses massal |
| GET | `/` | Daftar expenses |
| GET | `/summary` | Ringkasan expense per kategori |
| GET | `/:id` | Get expense by ID |
| PUT | `/:id/approve` | Approve expense |
| PUT | `/approve-multiple` | Approve expenses massal |

---

## 14. Voucher - Voucher/Promo

**Base Path:** `/api/business-logic/voucher`

**Description:** Manajemen voucher dan promo.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Buat voucher baru |
| GET | `/` | Daftar vouchers |
| GET | `/:id` | Get voucher by ID |
| PATCH | `/:id` | Update voucher |
| POST | `/validate` | Validasi kode voucher |
| POST | `/:id/use` | Tandai voucher sudah digunakan |
| DELETE | `/:id` | Delete (deactivate) voucher |

---

## 15. Loyalty - Loyalty & Poin

**Base Path:** `/api/business-logic/loyalty`

**Description:** Program loyalty dan point management.

### 15.1 Settings Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/settings` | Get point settings |
| PATCH | `/settings` | Update point settings |

### 15.2 Point Calculation Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/calculate` | Hitung poin untuk transaksi |
| POST | `/award` | Berikan poin ke pelanggan |

### 15.3 Customer Points Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customer/:customerId` | Get ringkasan poin pelanggan |
| POST | `/customer/:customerId/redeem` | Tukar poin pelanggan |

### 15.4 Redemption List Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/redemptions` | Daftar penukaran poin |
| GET | `/stats` | Statistik program loyalty |

---

## 16. Sale Return - Retur Penjualan

**Base Path:** `/api/business-logic/sale-return`

**Description:** Retur penjualan dengan lookup dan approval workflow.

### 16.1 Lookup Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/lookup` | Cari penjualan yang bisa diretur |
| GET | `/sale/:saleId/items` | Get items penjualan untuk pemilihan retur |

### 16.2 Sale Return Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Buat sale return baru |
| GET | `/` | Daftar sale returns |
| GET | `/summary` | Ringkasan laporan retur penjualan |
| GET | `/:id` | Get sale return by ID |
| PUT | `/:id/approve` | Approve sale return |
| PUT | `/:id/reject` | Reject sale return |

---

## 17. Accounting - Akuntansi

**Base Path:** `/api/business-logic/accounting`

**Description:** Modul akuntansi lengkap - chart of accounts, journal, general ledger, financial reports, depreciation, dan period closing.

### 17.1 Account Master Data

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/accounts` | Buat account baru |
| GET | `/accounts/:id` | Get account by ID |
| GET | `/accounts` | Daftar semua accounts |
| PUT | `/accounts/:id` | Update account |
| GET | `/accounts/tree` | Get struktur tree account |

### 17.2 Journal Entries

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/journal` | Buat journal entry |
| GET | `/journal/:id` | Get journal entry by ID |
| GET | `/journal` | Daftar journal entries |
| POST | `/journal/:id/reverse` | Reverse journal entry |

### 17.3 General Ledger

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/general-ledger` | Laporan general ledger |
| GET | `/trial-balance` | Trial balance |

### 17.4 Financial Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/balance-sheet` | Balance sheet |
| GET | `/profit-loss` | Laporan profit and loss |
| GET | `/cash-flow` | Cash flow statement |
| GET | `/equity-changes` | Laporan perubahan equity |
| GET | `/cogs` | Cost of goods sold report |

### 17.5 Depreciation

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/depreciation` | Calculate depreciation |

### 17.6 Period Closing

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/closing` | Buat closing entries |
| POST | `/opening` | Buat opening entries |

---

## 18. Journal - Jurnal Umum

**Base Path:** `/api/business-logic/journal`

**Description:** Jurnal umum dengan post/unpost workflow.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Buat journal entry baru |
| GET | `/` | Daftar journal entries |
| GET | `/:id` | Get entry by ID |
| PATCH | `/:id` | Update entry (unposted only) |
| POST | `/:id/post` | Post journal entry (kunci transaksi) |
| POST | `/:id/unpost` | Unpost entry (buka transaksi) |
| POST | `/:id/cancel` | Cancel journal entry |
| GET | `/reports/account-balance` | Account balance as of date |
| GET | `/reports/trial-balance` | Trial balance report (Neraca Saldo) |

---

## 19. Quality Control

**Base Path:** `/api/business-logic/quality-control`

**Description:** QC inspection, defect tracking, standards, dan calibration.

### 19.1 QC Inspection

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/inspection` | Buat QC inspection |
| GET | `/inspection/:id` | Get inspection by ID |
| GET | `/inspection` | Daftar inspections |
| POST | `/inspection/:id/results` | Record hasil QC |
| GET | `/performance` | QC performance report |

### 19.2 Defect Tracking

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/defect` | Buat defect report |
| GET | `/defect/:id` | Get defect by ID |
| GET | `/defect` | Daftar defect reports |
| PUT | `/defect/:id/status` | Update defect status |
| GET | `/defect/analytics` | Defect analytics |

### 19.3 QC Standards

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/standard` | Buat QC standard |
| GET | `/standard` | Get QC standard untuk produk |

### 19.4 Calibration

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/calibration` | Buat calibration record |
| GET | `/calibration` | Daftar calibrations |
| POST | `/calibration/:id/result` | Record hasil calibration |

---

## 20. Work Order

**Base Path:** `/api/business-logic/work-order`

**Description:** Work order management dengan scheduling, progress tracking, dan material allocation.

### 20.1 Work Order Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Buat work order |
| GET | `/:id` | Get work order by ID |
| GET | `/` | Daftar work orders |
| PATCH | `/:id` | Update work order |
| POST | `/:id/cancel` | Cancel work order |

### 20.2 Scheduling

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/schedule` | Schedule work order |
| GET | `/schedule/calendar` | Calendar view schedules |

### 20.3 Progress Tracking

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/progress` | Record progress |

### 20.4 Material Allocation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/materials` | Allocate materials |
| POST | `/:id/release-materials` | Release materials |

### 20.5 Work Stations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/workstation` | Buat work station |
| GET | `/workstation/list` | Daftar work stations |
| GET | `/workstation/utilization` | Work station utilization |

### 20.6 Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics` | Work order analytics |

---

## 21. Assembly - Rakitan

**Base Path:** `/api/business-logic/assembly`

**Description:** Assembly management dan Bill of Materials (BOM) dengan costing.

### 21.1 Assembly / Rakitan

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Buat assembly baru |
| GET | `/:id` | Get assembly by ID |
| GET | `/` | Daftar assemblies |
| PATCH | `/:id` | Update assembly |
| POST | `/:id/cancel` | Cancel assembly |

### 21.2 Bill of Materials / Komposisi

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/bom` | Buat BOM |
| GET | `/bom/:id` | Get BOM by ID |
| GET | `/bom/list` | Daftar BOMs |
| PUT | `/bom/:id` | Update BOM |
| DELETE | `/bom/:id` | Delete BOM |
| POST | `/bom/:id/clone` | Clone/Copy BOM |

### 21.3 Assembly from BOM

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/from-bom` | Assemble dari BOM |

### 21.4 BOM Costing

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cost/bom` | Calculate BOM cost |
| GET | `/bom/compare` | Compare dua BOMs |

### 21.5 Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics` | Assembly analytics |

---

## 22. Asset - Manajemen Aset

**Base Path:** `/api/business-logic/asset`

**Description:** Asset management dengan depreciation dan disposal.

### 22.1 Asset CRUD

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Buat asset baru |
| GET | `/` | Daftar assets |
| GET | `/:id` | Get asset by ID |
| PATCH | `/:id` | Update asset |
| DELETE | `/:id` | Delete asset (soft delete) |

### 22.2 Depreciation

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/depreciation/calculate` | Calculate depreciation |
| GET | `/reports/depreciation` | Depreciation report |
| GET | `/reports/valuation` | Asset valuation report |

### 22.3 Asset Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/:id/dispose` | Dispose/jual asset |
| POST | `/:id/transfer` | Transfer asset |

### 22.4 Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/categories` | Buat asset category |
| GET | `/categories/list` | Daftar categories |

---

## 23. Cash - Manajemen Kas

**Base Path:** `/api/business-logic/cash`

**Description:** Cash management - cash in, cash out, transfer, dan balance.

### 23.1 Cash In

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/in` | Catat cash masuk |
| GET | `/in/list` | Daftar cash in records |

### 23.2 Cash Out

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/out` | Catat cash keluar |
| GET | `/out/list` | Daftar cash out records |

### 23.3 Cash Transfer

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/transfer` | Transfer cash antar accounts |
| GET | `/transfer/list` | Daftar transfers |

### 23.4 Cash Flow & Balance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/balance` | Get cash balance |
| GET | `/report/flow` | Cash flow report |

---

## 24. Cash Flow - Arus Kas

**Base Path:** `/api/business-logic/cash-flow`

**Description:** Kategori cash flow, transaksi, dan laporan.

### 24.1 Cash Flow Category

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/categories` | Buat category |
| GET | `/categories` | Daftar categories |
| GET | `/categories/:id` | Get category by ID |
| PATCH | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Delete category |

### 24.2 Cash Flow Transaction

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Buat transaksi |
| GET | `/` | Daftar transaksi |
| GET | `/:id` | Get transaksi by ID |
| PATCH | `/:id` | Update transaksi |
| DELETE | `/:id` | Delete transaksi |

### 24.3 Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/report/summary` | Cash flow summary |
| GET | `/report/detail` | Cash flow detail report |
| GET | `/report/projection` | Cash flow projection |
| GET | `/account/:accountId/detail` | Cash flow by account |

---

## 25. Customer - Pelanggan

**Base Path:** `/api/business-logic/customers`

**Description:** Customer management dengan receivable dan loyalty.

### 25.1 Customer Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Buat customer |
| GET | `/` | Daftar customers |
| GET | `/summary` | Ringkasan customer |
| GET | `/top-revenue` | Top customers by revenue |
| GET | `/:id` | Get customer by ID |
| PATCH | `/:id` | Update customer |
| DELETE | `/:id` | Delete customer |

### 25.2 Receivable Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/receivable/add` | Tambah receivable |
| POST | `/receivable/payment` | Bayar receivable |
| GET | `/:id/receivable` | Get customer receivable |
| GET | `/:id/statement` | Customer statement |

### 25.3 Loyalty Points Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/points/adjust` | Adjust points |
| GET | `/:id/loyalty` | Customer loyalty history |

### 25.4 Customer Group Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/groups` | Buat customer group |
| GET | `/groups` | Daftar groups |
| PUT | `/groups/:id` | Update group |
| DELETE | `/groups/:id` | Delete group |

---

## 26. Customer Deposit - Deposit Pelanggan

**Base Path:** `/api/business-logic/customer-deposit`

**Description:** Deposit/titipan pelanggan dengan penggunaan dan refund.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Buat deposit baru |
| GET | `/` | Daftar deposits |
| GET | `/summary/:customerId` | Ringkasan deposit customer |
| GET | `/:id` | Get deposit by ID |
| POST | `/use` | Gunakan deposit untuk payment |
| POST | `/:id/refund` | Refund deposit |
| PATCH | `/:id` | Update deposit notes |

---

## 27. Supplier Debt - Hutang Supplier

**Base Path:** `/api/business-logic/supplier-debt`

**Description:** Supplier debt management dengan payment dan deposit.

### 27.1 Debt Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/overview` | Supplier debt overview |
| GET | `/supplier/:supplierId` | Supplier debt details |

### 27.2 Payment

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payment` | Catat pembayaran hutang |
| POST | `/bulk-payment` | Pembayaran massal |

### 27.3 Deposit

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/deposit` | Tambah supplier deposit |
| POST | `/deposit/use` | Gunakan deposit |
| GET | `/deposit/:supplierId` | Get deposits |

### 27.4 Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/aging` | Debt aging report |
| GET | `/reports/debt` | Supplier debt report |

---

## 28. Price - Manajemen Harga

**Base Path:** `/api/business-logic/price`

**Description:** Update harga produk, bulk update, dan laporan perubahan harga.

### 28.1 Price Update

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/:productId/selling` | Update harga jual |
| PUT | `/:productId/purchase` | Update harga beli |
| POST | `/bulk-update` | Bulk update harga |
| POST | `/adjust-by-percent` | Adjust harga dengan persentase |

### 28.2 Price History

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/history` | Get price history |
| GET | `/history/:productId` | Product price history |

### 28.3 Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/change` | Price change report |
| GET | `/reports/analysis` | Price analysis |

---

## 29. Product Unit

**Base Path:** `/api/business-logic/product-unit`

**Description:** Konfigurasi unit produk dan konversi antar unit.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Set product unit configurations |
| GET | `/product/:productId` | Get product units |
| GET | `/` | Daftar product units |
| POST | `/convert` | Convert quantity antar units |
| GET | `/options/:productId` | Get unit options untuk dropdown |

---

## 30. Product Price

**Base Path:** `/api/business-logic/product-price`

**Description:** Harga produk dengan applicable price.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Set product price |
| GET | `/product/:productId` | Get all prices untuk produk |
| GET | `/applicable` | Get applicable price |
| GET | `/` | Daftar prices dengan filter |
| DELETE | `/:id` | Delete price |

---

## 31. Product Type

**Base Path:** `/api/business-logic/product-type`

**Description:** Product type management dan statistics.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Buat product type |
| PATCH | `/:id` | Update product type |
| GET | `/:id` | Get product type by ID |
| GET | `/` | Daftar product types |
| GET | `/stats/overview` | Product type statistics |
| DELETE | `/:id` | Delete product type |

---

## 32. Production Recipe

**Base Path:** `/api/business-logic/production-recipe`

**Description:** Resep produksi dengan calculation.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Buat/update recipe |
| GET | `/product/:productId` | Get recipe by product ID |
| GET | `/` | Daftar recipes |
| POST | `/calculate` | Calculate recipe cost |
| DELETE | `/:id` | Delete recipe |

---

## 33. Production Request

**Base Path:** `/api/business-logic/production-request`

**Description:** Production request dengan approval workflow.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Buat production request |
| GET | `/` | Daftar requests |
| GET | `/:id` | Get request by ID |
| PUT | `/:id/approve` | Approve request |
| PUT | `/:id/reject` | Reject request |

---

## 34. Production Schedule

**Base Path:** `/api/business-logic/production-schedule`

**Description:** Production schedule dengan calendar view.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Buat schedule |
| GET | `/` | Daftar schedules |
| GET | `/calendar` | Calendar view schedules |
| GET | `/:id` | Get schedule by ID |
| PATCH | `/:id` | Update schedule |

---

## 35. Production Material - Bahan Produksi

**Base Path:** `/api/business-logic/production-material`

**Description:** Kategori dan material produksi.

### 35.1 Production Category

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/categories` | Buat category |
| GET | `/categories` | Daftar categories |
| GET | `/categories/:id` | Get category by ID |
| PATCH | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Delete category |

### 35.2 Production Material

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Buat material |
| GET | `/` | Daftar materials |
| GET | `/low-stock` | Low stock materials |
| GET | `/:id` | Get material by ID |
| PATCH | `/:id` | Update material |
| DELETE | `/:id` | Delete material |

---

## 36. Member Card - Kartu Anggota

**Base Path:** `/api/business-logic/member-card`

**Description:** Kartu anggota dengan top-up, withdraw, dan transfer saldo.

### 36.1 Card Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Buat member card |
| GET | `/` | Daftar cards |
| GET | `/stats` | Card statistics |
| GET | `/:id` | Get card by ID |
| GET | `/number/:cardNumber` | Get card by card number |
| PATCH | `/:id` | Update card |
| POST | `/:id/activate` | Activate card |
| POST | `/:id/deactivate` | Deactivate card |
| POST | `/:id/replace` | Replace lost/damaged card |

### 36.2 Card Transactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/:id/balance` | Get card balance |
| POST | `/:id/top-up` | Top-up card balance |
| POST | `/:id/withdraw` | Withdraw dari card |
| POST | `/:id/transfer` | Transfer ke card lain |
| GET | `/:id/transactions` | Transaction history |

### 36.3 Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/balance` | Card balance report |

---

## 37. Reports - Laporan

**Base Path:** `/api/business-logic/reports`

**Description:** Laporan komprehensif untuk semua modul bisnis.

### 37.1 Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Dashboard summary |

### 37.2 Sales Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sales` | Sales report |
| GET | `/top-products` | Top products report |
| GET | `/customer-revenue` | Customer revenue report |

### 37.3 Inventory Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/inventory` | Inventory report |
| GET | `/stock-movement` | Stock movement report |

### 37.4 Financial Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/receivable-aging` | Receivable aging report |
| GET | `/payable-aging` | Payable aging report |
| GET | `/cash-flow` | Cash flow report |
| GET | `/profit-loss` | Profit and loss report |
| GET | `/expense` | Expense report |

### 37.5 HR Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/attendance-summary` | Attendance summary |
| GET | `/payroll-summary` | Payroll summary |

### 37.6 Supplier Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/supplier-purchase` | Supplier purchase report |

---

## 38. Attendance Integration - Integrasi Absensi

**Base Path:** `/api/business-logic/attendance-integration`

**Description:** Integrasi dengan device absensi (finger print, face recognition).

### 38.1 Device Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/device` | Register device baru |
| GET | `/device` | Daftar devices |
| GET | `/device/:id` | Get device by ID |
| PUT | `/device/:id` | Update device config |
| DELETE | `/device/:id` | Delete device |
| POST | `/device/:id/test-connection` | Test connection |
| POST | `/device/:id/command` | Execute device command |

### 38.2 Employee Mapping

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/mapping` | Map employee ke device |
| POST | `/mapping/bulk` | Bulk map employees |
| GET | `/mapping` | Get mappings |
| DELETE | `/mapping/:employeeId` | Delete mapping |

### 38.3 Attendance Sync

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/sync` | Sync attendance dari device |

### 38.4 Schedule Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/schedule` | Buat work schedule |
| GET | `/schedule` | Daftar schedules |
| POST | `/schedule/assign` | Assign schedule ke employees |

### 38.5 Device Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/logs` | Get device logs |

---

## 39. Notification Gateway - SMS & WhatsApp

**Base Path:** `/api/business-logic/notification-gateway`

**Description:** SMS dan WhatsApp gateway untuk customer notification.

### 39.1 SMS

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/sms/send` | Kirim single SMS |
| POST | `/sms/bulk` | Kirim bulk SMS |
| POST | `/sms/template` | Kirim SMS dengan template |

### 39.2 WhatsApp

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/whatsapp/send` | Kirim single WhatsApp |
| POST | `/whatsapp/bulk` | Kirim bulk WhatsApp |

### 39.3 Auto Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auto/payment-reminder` | Payment reminder |
| POST | `/auto/stock-alert` | Stock alert notification |
| POST | `/auto/birthday-greeting` | Birthday greeting |
| POST | `/auto/promotion` | Promotion |

### 39.4 Templates

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/template` | Buat template |
| GET | `/template` | Daftar templates |

### 39.5 Logs & Stats

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/logs` | Notification logs |
| GET | `/stats` | Notification statistics |

### 39.6 Gateway Configuration

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/config/sms` | Configure SMS gateway |
| POST | `/config/whatsapp` | Configure WhatsApp gateway |
| GET | `/config` | List configured gateways |

---

## 40. Budgeting - Penganggaran

**Base Path:** `/api/business-logic/budgeting`

**Description:** Budget dan sales target management.

### 40.1 Budget Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/budget` | Buat budget |
| GET | `/budget` | Daftar budgets |
| GET | `/budget/:id` | Get budget by ID |
| PUT | `/budget/:id` | Update budget |
| DELETE | `/budget/:id` | Delete budget |
| POST | `/budget/copy` | Copy budget ke period baru |

### 40.2 Sales Target Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/target` | Buat sales target |
| GET | `/target` | Daftar targets |
| GET | `/target/:id` | Get target by ID |
| PUT | `/target/:id` | Update target |
| POST | `/target/:id/recalculate` | Recalculate actual values |

### 40.3 Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/comparison` | Budget vs actual comparison |
| GET | `/reports/target-performance` | Sales target performance |
| GET | `/reports/alerts` | Budget alerts |

---

## 41. Category & Brand - Master Data

**Base Path:** `/api/business-logic/master-data`

**Description:** Master data management - categories, brands, units, dan product groups.

### 41.1 Category Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/categories` | Buat category |
| GET | `/categories` | Daftar categories |
| GET | `/categories/:id` | Get category by ID |
| PUT | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Delete category |

### 41.2 Brand Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/brands` | Buat brand |
| GET | `/brands` | Daftar brands |
| GET | `/brands/:id` | Get brand by ID |
| PUT | `/brands/:id` | Update brand |
| DELETE | `/brands/:id` | Delete brand |

### 41.3 Unit Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/units` | Buat unit |
| GET | `/units` | Daftar units |
| PUT | `/units/:id` | Update unit |

### 41.4 Product Group Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/product-groups` | Buat product group |
| GET | `/product-groups` | Daftar groups |
| PUT | `/product-groups/:id` | Update group |

### 41.5 Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/summary` | Master data summary |

---

## 42. Transfer - Transfer Dana

**Base Path:** `/api/business-logic/transfers`

**Description:** Transfer dana antar accounts.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Buat transfer |
| GET | `/` | Daftar transfers |
| GET | `/summary` | Transfer summary |
| GET | `/accounts` | Get accounts |
| GET | `/:id` | Get transfer by ID |
| DELETE | `/:id` | Delete transfer |

---

## 43. Stock Transfer - Transfer Stok

**Base Path:** `/api/business-logic/stock-transfers`

**Description:** Transfer stok antar warehouses dengan complete/cancel.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Buat stock transfer |
| GET | `/` | Daftar transfers |
| GET | `/summary` | Summary |
| GET | `/:id` | Get transfer by ID |
| POST | `/:id/complete` | Complete transfer |
| POST | `/:id/cancel` | Cancel transfer |

---

## 44. Stock Mutation - Mutasi Stok

**Base Path:** `/api/business-logic/stock-mutation`

**Description:** Kategori mutasi dan movement stok.

### 44.1 Mutation Category

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/categories` | Buat category |
| GET | `/categories` | Daftar categories |
| GET | `/categories/:id` | Get category by ID |
| PATCH | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Delete category |

### 44.2 Stock Mutation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Buat mutation |
| GET | `/` | Daftar mutations |
| GET | `/:id` | Get mutation by ID |
| PATCH | `/:id` | Update mutation |
| POST | `/:id/reverse` | Reverse mutation |

### 44.3 Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/report/summary` | Mutation summary |
| GET | `/report/by-category` | Mutation by category |
| GET | `/product/:productId/history` | Product mutation history |

---

## 45. Stock Opname - Stock Taking

**Base Path:** `/api/business-logic/stock-opname`

**Description:** Stock opname dengan approval workflow.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/generate` | Generate opname list |
| POST | `/` | Buat stock opname |
| GET | `/` | Daftar opnames |
| GET | `/:id` | Get opname by ID |
| PATCH | `/:id` | Update opname |
| POST | `/:id/approve` | Approve opname |
| POST | `/:id/cancel` | Cancel opname |
| DELETE | `/:id` | Delete draft opname |

---

## 46. Payroll - Gaji

**Base Path:** `/api/business-logic/payroll`

**Description:** Payroll management.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Buat payroll |
| GET | `/` | Daftar payrolls |
| GET | `/summary` | Payroll summary |
| GET | `/:id` | Get payroll by ID |
| GET | `/employee/:employeeId/history` | Employee payroll history |
| PATCH | `/:id` | Update payroll |
| POST | `/payment` | Payment payroll |
| DELETE | `/:id` | Delete payroll |

---

## 47. Salesperson

**Base Path:** `/api/business-logic/salespersons`

**Description:** Salesperson management dan performance.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Buat salesperson |
| GET | `/` | Daftar salespersons |
| GET | `/performance` | Salesperson performance |
| GET | `/:id` | Get salesperson by ID |
| PATCH | `/:id` | Update salesperson |
| DELETE | `/:id` | Delete salesperson |

---

## 48. Supplier

**Base Path:** `/api/business-logic/suppliers`

**Description:** Supplier management dengan debt.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Buat supplier |
| GET | `/` | Daftar suppliers |
| GET | `/summary` | Supplier summary |
| GET | `/top` | Top suppliers |
| GET | `/:id` | Get supplier by ID |
| PATCH | `/:id` | Update supplier |
| DELETE | `/:id` | Delete supplier |
| POST | `/debt/add` | Add supplier debt |
| POST | `/debt/payment` | Payment debt |
| GET | `/:id/debt` | Get supplier debt |
| GET | `/:id/statement` | Supplier statement |

---

## 49. Warehouse

**Base Path:** `/api/business-logic/warehouses`

**Description:** Warehouse management dengan shelf.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Buat warehouse |
| GET | `/` | Daftar warehouses |
| GET | `/summary` | Warehouse summary |
| GET | `/:id` | Get warehouse by ID |
| GET | `/:id/stock` | Get warehouse stock |
| PATCH | `/:id` | Update warehouse |
| DELETE | `/:id` | Delete warehouse |
| POST | `/shelves` | Buat shelf |
| GET | `/shelves/:warehouseId` | Daftar shelves |
| PUT | `/shelves/:id` | Update shelf |

---

## 50. Leave - Cuti

**Base Path:** `/api/business-logic/leaves`

**Description:** Leave management dengan approval.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Buat leave request |
| GET | `/` | Daftar leaves |
| GET | `/types` | Leave types |
| GET | `/statuses` | Leave statuses |
| GET | `/:id` | Get leave by ID |
| PATCH | `/:id` | Update leave |
| POST | `/:id/approve` | Approve leave |
| POST | `/:id/reject` | Reject leave |
| GET | `/employee/:employeeId/balances` | Employee leave balances |
| POST | `/balances/initialize` | Initialize balances |

---

## 51. Loan - Pinjaman

**Base Path:** `/api/business-logic/loans`

**Description:** Employee loan management.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Buat loan |
| GET | `/` | Daftar loans |
| GET | `/summary` | Loan summary |
| GET | `/types` | Loan types |
| GET | `/statuses` | Loan statuses |
| GET | `/:id` | Get loan by ID |
| GET | `/employee/:employeeId/history` | Employee loan history |
| PATCH | `/:id` | Update loan |
| POST | `/installment` | Record installment |

---

## 52. Notification - Notifikasi

**Base Path:** `/api/business-logic/notifications`

**Description:** Sistem notification internal.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Buat notification |
| POST | `/bulk` | Buat bulk notification |
| GET | `/` | Daftar notifications |
| GET | `/summary` | Notification summary |
| GET | `/types` | Notification types |
| GET | `/settings/:userId` | User notification settings |
| GET | `/:id` | Get notification by ID |
| POST | `/mark-read` | Mark as read |
| POST | `/mark-all-read` | Mark all as read |
| PUT | `/settings/:userId/:typeId` | Update settings |
| DELETE | `/:id` | Delete notification |
| DELETE | `/read/all` | Delete read notifications |

---

## Authentication

Semua endpoint di module business-logic membutuhkan autentikasi JWT Bearer token di header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

Semua endpoint mengembalikan response dalam format:

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": { ... }
}
```

## Error Handling

Error responses memiliki format:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

---

*Document generated on: 2026-09-23*
