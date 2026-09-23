/**
 * Business Logic Module Index
 *
 * This module consolidates all complex business logic endpoints that span
 * multiple models and require transactional integrity.
 *
 * NOTE: DTOs are NOT exported from this file to avoid duplicate exports
 * between modules. Each controller imports its own DTOs directly.
 */

// POS - Point of Sale
export * from './pos/pos-module';
export * from './pos/pos-controller';
export * from './pos/pos-service';

// Receivable - Piutang Pelanggan
export * from './receivable/receivable-module';
export * from './receivable/receivable-controller';
export * from './receivable/receivable-service';

// Stock Alert - Alert Stok
export * from './stock-alert/stock-alert-module';
export * from './stock-alert/stock-alert-controller';
export * from './stock-alert/stock-alert-service';

// Analytics - Laporan & Analisis
export * from './analytics/analytics-module';
export * from './analytics/analytics-controller';
export * from './analytics/analytics-service';

// Inventory - Manajemen Stok
export * from './inventory/inventory-module';
export * from './inventory/inventory-controller';
export * from './inventory/inventory-service';

// Purchase - Pembelian & Supplier
export * from './purchase/purchase-module';
export * from './purchase/purchase-controller';
export * from './purchase/purchase-service';

// Production - Produksi & BOM
export * from './production/production-module';
export * from './production/production-controller';
export * from './production/production-service';

// Service - Servis & Reparasi
export * from './service/service-module';
export * from './service/service-controller';
export * from './service/service-service';

// HRM - Human Resource Management
export * from './hrm/hrm-module';
export * from './hrm/hrm-controller';
export * from './hrm/hrm-service';

// Expense - Pengeluaran
export * from './expense/expense-module';
export * from './expense/expense-controller';
export * from './expense/expense-service';

// Voucher - Voucher & Promo
export * from './voucher/voucher-module';
export * from './voucher/voucher-controller';
export * from './voucher/voucher-service';

// Loyalty - Loyalty & Poin
export * from './loyalty/loyalty-module';
export * from './loyalty/loyalty-controller';
export * from './loyalty/loyalty-service';

// Sale Return - Retur Penjualan
export * from './sale-return/sale-return-module';
export * from './sale-return/sale-return-controller';
export * from './sale-return/sale-return-service';

// Accounting - Akuntansi & Laporan Keuangan
export * from './accounting/accounting-module';
export * from './accounting/accounting-controller';
export * from './accounting/accounting-service';

// Quality Control - QC & Inspeksi
export * from './quality-control/quality-control-module';
export * from './quality-control/quality-control-controller';
export * from './quality-control/quality-control-service';

// Work Order - Work Order & Scheduling Produksi
export * from './work-order/work-order-module';
export * from './work-order/work-order-controller';
export * from './work-order/work-order-service';

// Assembly - Rakitan & BOM
export * from './assembly/assembly-module';
export * from './assembly/assembly-controller';
export * from './assembly/assembly-service';

// Asset - Manajemen Aset Tetap
export * from './asset/asset-module';
export * from './asset/asset-controller';
export * from './asset/asset-service';

// Cash - Manajemen Kas
export * from './cash/cash-module';
export * from './cash/cash-controller';
export * from './cash/cash-service';

// Supplier Debt - Hutang Supplier
export * from './supplier-debt/supplier-debt-module';
export * from './supplier-debt/supplier-debt-controller';
export * from './supplier-debt/supplier-debt-service';

// Price - Manajemen Harga
export * from './price/price-module';
export * from './price/price-controller';
export * from './price/price-service';

// Stock Mutation - Mutasi Stok
export * from './stock-mutation/stock-mutation-module';
export * from './stock-mutation/stock-mutation-controller';
export * from './stock-mutation/stock-mutation-service';

// Purchase Return - Retur Pembelian
export * from './purchase-return/purchase-return-module';
export * from './purchase-return/purchase-return-controller';
export * from './purchase-return/purchase-return-service';

// Customer Deposit - Deposit Pelanggan
export * from './customer-deposit/customer-deposit-module';
export * from './customer-deposit/customer-deposit-controller';
export * from './customer-deposit/customer-deposit-service';

// Stock Opname - Stock Taking
export * from './stock-opname/stock-opname-module';
export * from './stock-opname/stock-opname-controller';
export * from './stock-opname/stock-opname-service';

// Journal - Jurnal Umum
export * from './journal/journal-module';
export * from './journal/journal-controller';
export * from './journal/journal-service';

// ═══════════════════════════════════════════════════════════════════════════════
// NEW MODULES - Added Batch 5
// ═══════════════════════════════════════════════════════════════════════════════

// Member Card - Kartu Anggota
export * from './member-card/member-card-module';
export * from './member-card/member-card-controller';
export * from './member-card/member-card-service';

// Reports - Laporan Konsolidasi
export * from './reports/reports-module';
export * from './reports/reports-controller';
export * from './reports/reports-service';

// Loan - Pinjaman Karyawan
export * from './loan/loan-module';
export * from './loan/loan-controller';
export * from './loan/loan-service';

// Attendance Integration - Integrasi Absensi
export * from './attendance-integration/attendance-integration-module';
export * from './attendance-integration/attendance-integration-controller';
export * from './attendance-integration/attendance-integration-service';

// Notification Gateway - SMS & WhatsApp
export * from './notification-gateway/notification-gateway-module';
export * from './notification-gateway/notification-gateway-controller';
export * from './notification-gateway/notification-gateway-service';

// Budgeting - Penganggaran
export * from './budgeting/budgeting-module';
export * from './budgeting/budgeting-controller';
export * from './budgeting/budgeting-service';

// ═══════════════════════════════════════════════════════════════════════════════
// NEW MODULES - Batch 6 (Based on Screenshot Analysis)
// ═══════════════════════════════════════════════════════════════════════════════

// Customer - Manajemen Pelanggan
export * from './customer/customer-module';
export * from './customer/customer-controller';
export * from './customer/customer-service';

// Supplier - Manajemen Supplier
export * from './supplier/supplier-module';
export * from './supplier/supplier-controller';
export * from './supplier/supplier-service';

// Warehouse - Manajemen Gudang
export * from './warehouse/warehouse-module';
export * from './warehouse/warehouse-controller';
export * from './warehouse/warehouse-service';

// SalesPerson - Manajemen Salesman
export * from './salesperson/salesperson-module';
export * from './salesperson/salesperson-controller';
export * from './salesperson/salesperson-service';

// Attendance - Absensi Karyawan
export * from './attendance/attendance-module';
export * from './attendance/attendance-controller';
export * from './attendance/attendance-service';

// Payroll - Gaji Karyawan
export * from './payroll/payroll-module';
export * from './payroll/payroll-controller';
export * from './payroll/payroll-service';

// Leave - Cuti Karyawan
export * from './leave/leave-module';
export * from './leave/leave-controller';
export * from './leave/leave-service';

// Notification - Notifikasi
export * from './notification/notification-module';
export * from './notification/notification-controller';
export * from './notification/notification-service';

// Category Brand - Kategori & Merek
export * from './category-brand/category-brand-module';
export * from './category-brand/category-brand-controller';
export * from './category-brand/category-brand-service';

// Transfer - Transfer Kas & Gudang
export * from './transfer/transfer-module';
export * from './transfer/transfer-controller';
export * from './transfer/transfer-service';

// Stock Transfer - Transfer Stok Gudang
export * from './stock-transfer/stock-transfer-module';
export * from './stock-transfer/stock-transfer-controller';
export * from './stock-transfer/stock-transfer-service';
