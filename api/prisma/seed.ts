import 'dotenv/config';
import { PrismaClient } from '.prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as argon2 from 'argon2';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  // ─── Seed PaymentMethods ─────────────────────────────────────────
  const paymentMethods = [
    { Code: 'CASH', Name: 'Tunai', Description: 'Pembayaran dengan uang tunai' },
    { Code: 'BANK_TRANSFER', Name: 'Transfer Bank', Description: 'Pembayaran via transfer bank' },
    { Code: 'EWALLET', Name: 'E-Wallet', Description: 'Pembayaran via e-wallet (GoPay, OVO, Dana)' },
    { Code: 'QRIS', Name: 'QRIS', Description: 'Pembayaran via QRIS' },
    { Code: 'DEBIT', Name: 'Kartu Debit', Description: 'Pembayaran dengan kartu debit' },
    { Code: 'CREDIT', Name: 'Kartu Kredit', Description: 'Pembayaran dengan kartu kredit' },
    { Code: 'GIRO', Name: 'Giro', Description: 'Pembayaran dengan giro' },
    { Code: 'CHECK', Name: 'Cek', Description: 'Pembayaran dengan cek' },
  ];

  for (const method of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { Code: method.Code },
      create: { ...method, IsActive: true, SortOrder: paymentMethods.indexOf(method) },
      update: { Name: method.Name, Description: method.Description },
    });
  }
  console.log('✓ PaymentMethods seeded');

  // ─── Seed PaymentStatuses ───────────────────────────────────────
  const paymentStatuses = [
    { Code: 'PENDING', Name: 'Menunggu', Description: 'Belum ada pembayaran', Color: '#FFA500' },
    { Code: 'PARTIAL', Name: 'Sebagian', Description: 'Pembayaran sebagian', Color: '#1E90FF' },
    { Code: 'PAID', Name: 'Lunas', Description: 'Pembayaran lunas', Color: '#28A745' },
    { Code: 'OVERDUE', Name: 'Jatuh Tempo', Description: 'Melewati batas waktu', Color: '#DC3545' },
    { Code: 'CANCELLED', Name: 'Dibatalkan', Description: 'Pembayaran dibatalkan', Color: '#6C757D' },
  ];

  for (const status of paymentStatuses) {
    await prisma.paymentStatus.upsert({
      where: { Code: status.Code },
      create: { ...status, IsActive: true, SortOrder: paymentStatuses.indexOf(status) },
      update: { Name: status.Name, Description: status.Description, Color: status.Color },
    });
  }
  console.log('✓ PaymentStatuses seeded');

  // ─── Seed TransactionStatuses ───────────────────────────────────
  const transactionStatuses = [
    { Code: 'DRAFT', Name: 'Draft', Description: 'Status draft/rencana', Color: '#6C757D', IsTerminal: false },
    { Code: 'CONFIRMED', Name: 'Dikonfirmasi', Description: 'Sudah dikonfirmasi', Color: '#17A2B8', IsTerminal: false },
    { Code: 'PROCESSING', Name: 'Diproses', Description: 'Sedang diproses', Color: '#FFC107', IsTerminal: false },
    { Code: 'COMPLETED', Name: 'Selesai', Description: 'Transaksi selesai', Color: '#28A745', IsTerminal: true },
    { Code: 'CANCELLED', Name: 'Dibatalkan', Description: 'Transaksi dibatalkan', Color: '#DC3545', IsTerminal: true },
    { Code: 'REJECTED', Name: 'Ditolak', Description: 'Transaksi ditolak', Color: '#6C757D', IsTerminal: true },
  ];

  for (const status of transactionStatuses) {
    await prisma.transactionStatus.upsert({
      where: { Code: status.Code },
      create: { ...status, IsActive: true, SortOrder: transactionStatuses.indexOf(status) },
      update: { Name: status.Name, Description: status.Description, Color: status.Color, IsTerminal: status.IsTerminal },
    });
  }
  console.log('✓ TransactionStatuses seeded');

  // ─── Seed StockOpnameStatuses ──────────────────────────────────
  const stockOpnameStatuses = [
    { Code: 'DRAFT', Name: 'Draft', Description: 'Stock opname masih draft', Color: '#6C757D' },
    { Code: 'IN_PROGRESS', Name: 'Sedang Berlangsung', Description: 'Stock opname sedang berlangsung', Color: '#FFC107' },
    { Code: 'COMPLETED', Name: 'Selesai', Description: 'Stock opname selesai', Color: '#28A745' },
    { Code: 'CANCELLED', Name: 'Dibatalkan', Description: 'Stock opname dibatalkan', Color: '#DC3545' },
  ];

  for (const status of stockOpnameStatuses) {
    await prisma.stockOpnameStatus.upsert({
      where: { Code: status.Code },
      create: { ...status, IsActive: true, SortOrder: stockOpnameStatuses.indexOf(status) },
      update: { Name: status.Name, Description: status.Description, Color: status.Color },
    });
  }
  console.log('✓ StockOpnameStatuses seeded');

  // ─── Seed AccountTypes ─────────────────────────────────────────
  const accountTypes = [
    { Code: 'ASSET', Name: 'Aset', Description: 'Akun aset (harta)', IsDebitNormal: true },
    { Code: 'LIABILITY', Name: 'Kewajiban', Description: 'Akun kewajiban (utang)', IsDebitNormal: false },
    { Code: 'EQUITY', Name: 'Modal', Description: 'Akun modal', IsDebitNormal: false },
    { Code: 'REVENUE', Name: 'Pendapatan', Description: 'Akun pendapatan', IsDebitNormal: false },
    { Code: 'EXPENSE', Name: 'Beban', Description: 'Akun beban (pengeluaran)', IsDebitNormal: true },
    { Code: 'COST', Name: 'Harga Pokok', Description: 'Akun harga pokok penjualan', IsDebitNormal: true },
  ];

  for (const type of accountTypes) {
    await prisma.accountType.upsert({
      where: { Code: type.Code },
      create: { ...type, IsActive: true, SortOrder: accountTypes.indexOf(type) },
      update: { Name: type.Name, Description: type.Description },
    });
  }
  console.log('✓ AccountTypes seeded');

  // ─── Seed ReferenceTypes ────────────────────────────────────────
  const referenceTypes = [
    { Code: 'PURCHASE_ORDER', Name: 'Purchase Order', Description: 'Referensi dari Purchase Order' },
    { Code: 'SALE_RETURN', Name: 'Retur Penjualan', Description: 'Referensi dari Retur Penjualan' },
    { Code: 'PRODUCTION', Name: 'Produksi', Description: 'Referensi dari Produksi' },
    { Code: 'ADJUSTMENT', Name: 'Penyesuaian', Description: 'Referensi dari Penyesuaian Stok' },
    { Code: 'TRANSFER', Name: 'Transfer', Description: 'Referensi dari Transfer Stok' },
  ];

  for (const type of referenceTypes) {
    await prisma.referenceType.upsert({
      where: { Code: type.Code },
      create: { ...type, IsActive: true, SortOrder: referenceTypes.indexOf(type) },
      update: { Name: type.Name, Description: type.Description },
    });
  }
  console.log('✓ ReferenceTypes seeded');

  // ─── Seed CustomerGroups ────────────────────────────────────────
  const customerGroups = [
    { Code: 'GENERAL', Name: 'Umum', Description: 'Grup pelanggan umum', DiscountPercent: 0, PointMultiplier: 1 },
    { Code: 'RETAIL', Name: 'Retail', Description: 'Pelanggan retail', DiscountPercent: 0, PointMultiplier: 1 },
    { Code: 'WHOLESALE', Name: 'Grosir', Description: 'Pelanggan grosir', DiscountPercent: 5, PointMultiplier: 1.5 },
    { Code: 'VIP', Name: 'VIP', Description: 'Pelanggan VIP', DiscountPercent: 10, PointMultiplier: 2 },
    { Code: 'MEMBER', Name: 'Member', Description: 'Pelanggan member', DiscountPercent: 3, PointMultiplier: 1.2 },
  ];

  for (const group of customerGroups) {
    await prisma.customerGroup.upsert({
      where: { Code: group.Code },
      create: { ...group, IsActive: true, SortOrder: customerGroups.indexOf(group) },
      update: { Name: group.Name, Description: group.Description, DiscountPercent: group.DiscountPercent, PointMultiplier: group.PointMultiplier },
    });
  }
  console.log('✓ CustomerGroups seeded');

  // ─── Seed EmployeeStatuses ──────────────────────────────────────
  const employeeStatuses = [
    { Code: 'ACTIVE', Name: 'Aktif', Description: 'Karyawan aktif bekerja', Color: '#28A745' },
    { Code: 'ON_LEAVE', Name: 'Cuti', Description: 'Karyawan sedang cuti', Color: '#FFC107' },
    { Code: 'SUSPENDED', Name: 'Diberhentikan', Description: 'Karyawan diberhentikan sementara', Color: '#FFA500' },
    { Code: 'RESIGNED', Name: 'Resign', Description: 'Karyawan sudah resign', Color: '#6C757D' },
    { Code: 'TERMINATED', Name: 'Diputus Kontrak', Description: 'Karyawan diputus kontrak', Color: '#DC3545' },
  ];

  for (const status of employeeStatuses) {
    await prisma.employeeStatus.upsert({
      where: { Code: status.Code },
      create: { ...status, IsActive: true, SortOrder: employeeStatuses.indexOf(status) },
      update: { Name: status.Name, Description: status.Description, Color: status.Color },
    });
  }
  console.log('✓ EmployeeStatuses seeded');

  // ─── Seed AttendanceStatuses ───────────────────────────────────
  const attendanceStatuses = [
    { Code: 'PRESENT', Name: 'Hadir', Description: 'Karyawan hadir', Color: '#28A745' },
    { Code: 'ABSENT', Name: 'Tidak Hadir', Description: 'Karyawan tidak hadir', Color: '#DC3545' },
    { Code: 'LATE', Name: 'Terlambat', Description: 'Karyawan terlambat', Color: '#FFC107' },
    { Code: 'LEAVE', Name: 'Cuti', Description: 'Karyawan cuti', Color: '#17A2B8' },
    { Code: 'SICK', Name: 'Sakit', Description: 'Karyawan sakit', Color: '#FFA500' },
    { Code: 'PERMIT', Name: 'Izin', Description: 'Karyawan izin', Color: '#6C757D' },
  ];

  for (const status of attendanceStatuses) {
    await prisma.attendanceStatus.upsert({
      where: { Code: status.Code },
      create: { ...status, IsActive: true, SortOrder: attendanceStatuses.indexOf(status) },
      update: { Name: status.Name, Description: status.Description, Color: status.Color },
    });
  }
  console.log('✓ AttendanceStatuses seeded');

  // ─── Seed LeaveTypes ───────────────────────────────────────────
  const leaveTypes = [
    { Code: 'ANNUAL', Name: 'Cuti Tahunan', Description: 'Cuti tahunan', IsPaidLeave: true, DefaultDays: 12 },
    { Code: 'SICK', Name: 'Sakit', Description: 'Cuti sakit', IsPaidLeave: true, DefaultDays: 14 },
    { Code: 'EMERGENCY', Name: 'Keperluan Mendesak', Description: 'Cuti keperluan mendesak', IsPaidLeave: true, DefaultDays: 3 },
    { Code: 'MATERNITY', Name: 'Melahirkan', Description: 'Cuti melahirkan', IsPaidLeave: true, DefaultDays: 90 },
    { Code: 'PATERNITY', Name: 'Ayah', Description: 'Cuti ayah', IsPaidLeave: true, DefaultDays: 2 },
    { Code: 'UNPAID', Name: 'Tanpa Gaji', Description: 'Cuti tanpa gaji', IsPaidLeave: false, DefaultDays: 0 },
  ];

  for (const type of leaveTypes) {
    await prisma.leaveType.upsert({
      where: { Code: type.Code },
      create: { ...type, IsActive: true, SortOrder: leaveTypes.indexOf(type) },
      update: { Name: type.Name, Description: type.Description },
    });
  }
  console.log('✓ LeaveTypes seeded');

  // ─── Seed LeaveStatuses ────────────────────────────────────────
  const leaveStatuses = [
    { Code: 'PENDING', Name: 'Menunggu', Description: 'Menunggu persetujuan', Color: '#FFC107', RequiresApproval: true, IsTerminal: false },
    { Code: 'APPROVED', Name: 'Disetujui', Description: 'Cuti disetujui', Color: '#28A745', RequiresApproval: true, IsTerminal: true },
    { Code: 'REJECTED', Name: 'Ditolak', Description: 'Cuti ditolak', Color: '#DC3545', RequiresApproval: true, IsTerminal: true },
    { Code: 'CANCELLED', Name: 'Dibatalkan', Description: 'Cuti dibatalkan', Color: '#6C757D', RequiresApproval: false, IsTerminal: true },
  ];

  for (const status of leaveStatuses) {
    await prisma.leaveStatus.upsert({
      where: { Code: status.Code },
      create: { ...status, IsActive: true, SortOrder: leaveStatuses.indexOf(status) },
      update: { Name: status.Name, Description: status.Description, Color: status.Color },
    });
  }
  console.log('✓ LeaveStatuses seeded');

  // ─── Seed LoanStatuses ─────────────────────────────────────────
  const loanStatuses = [
    { Code: 'PENDING', Name: 'Menunggu', Description: 'Menunggu persetujuan', Color: '#FFC107' },
    { Code: 'APPROVED', Name: 'Disetujui', Description: 'Pinjaman disetujui', Color: '#28A745' },
    { Code: 'ACTIVE', Name: 'Aktif', Description: 'Pinjaman aktif/masih berjalan', Color: '#17A2B8' },
    { Code: 'COMPLETED', Name: 'Lunas', Description: 'Pinjaman lunas', Color: '#28A745' },
    { Code: 'DEFAULTED', Name: 'Macet', Description: 'Pinjaman macet', Color: '#DC3545' },
    { Code: 'CANCELLED', Name: 'Dibatalkan', Description: 'Pinjaman dibatalkan', Color: '#6C757D' },
  ];

  for (const status of loanStatuses) {
    await prisma.loanStatus.upsert({
      where: { Code: status.Code },
      create: { ...status, IsActive: true, SortOrder: loanStatuses.indexOf(status) },
      update: { Name: status.Name, Description: status.Description, Color: status.Color },
    });
  }
  console.log('✓ LoanStatuses seeded');

  // ─── Seed LoanTypes ────────────────────────────────────────────
  const loanTypes = [
    { Code: 'EMERGENCY', Name: 'Dana Darurat', Description: 'Pinjaman dana darurat', MaxTenorMonths: 6, MaxAmount: 5000000, InterestRate: 0 },
    { Code: 'CONSUMPTION', Name: 'Konsumsi', Description: 'Pinjaman konsumsi', MaxTenorMonths: 12, MaxAmount: 10000000, InterestRate: 1 },
    { Code: 'INVESTMENT', Name: 'Investasi', Description: 'Pinjaman investasi', MaxTenorMonths: 36, MaxAmount: 50000000, InterestRate: 0.5 },
  ];

  for (const type of loanTypes) {
    await prisma.loanType.upsert({
      where: { Code: type.Code },
      create: { ...type, IsActive: true, SortOrder: loanTypes.indexOf(type) },
      update: { Name: type.Name, Description: type.Description },
    });
  }
  console.log('✓ LoanTypes seeded');

  // ─── Seed AssetStatuses ─────────────────────────────────────────
  const assetStatuses = [
    { Code: 'ACTIVE', Name: 'Aktif', Description: 'Aset masih aktif digunakan', Color: '#28A745' },
    { Code: 'MAINTENANCE', Name: 'Perbaikan', Description: 'Aset sedang dalam perbaikan', Color: '#FFC107' },
    { Code: 'STORAGE', Name: 'Penyimpanan', Description: 'Aset disimpan/dibungkus', Color: '#17A2B8' },
    { Code: 'DISPOSED', Name: 'Dihapus', Description: 'Aset sudah dihapus', Color: '#6C757D' },
    { Code: 'SOLD', Name: 'Terjual', Description: 'Aset sudah terjual', Color: '#6C757D' },
  ];

  for (const status of assetStatuses) {
    await prisma.assetStatus.upsert({
      where: { Code: status.Code },
      create: { ...status, IsActive: true, SortOrder: assetStatuses.indexOf(status) },
      update: { Name: status.Name, Description: status.Description, Color: status.Color },
    });
  }
  console.log('✓ AssetStatuses seeded');

  // ─── Seed DepreciationMethods ──────────────────────────────────
  const depreciationMethods = [
    { Code: 'STRAIGHT_LINE', Name: 'Garis Lurus', Description: 'Penyusutan metode garis lurus', Formula: '(Cost - Salvage) / Useful Life' },
    { Code: 'DECLINING', Name: 'Saldo Menurun', Description: 'Penyusutan metode saldo menurun', Formula: 'Book Value x Rate' },
    { Code: 'UNITS_OF_PRODUCTION', Name: 'Unit Produksi', Description: 'Penyusutan berdasarkan unit produksi', Formula: '(Cost - Salvage) x (Production / Total Production)' },
  ];

  for (const method of depreciationMethods) {
    await prisma.depreciationMethod.upsert({
      where: { Code: method.Code },
      create: { ...method, IsActive: true, SortOrder: depreciationMethods.indexOf(method) },
      update: { Name: method.Name, Description: method.Description },
    });
  }
  console.log('✓ DepreciationMethods seeded');

  // ─── Seed RepairStatuses ────────────────────────────────────────
  const repairStatuses = [
    { Code: 'PENDING', Name: 'Menunggu', Description: 'Menunggu antrian perbaikan', Color: '#6C757D', IsTerminal: false },
    { Code: 'DIAGNOSING', Name: 'Mendiagnosis', Description: 'Sedang mendiagnosis masalah', Color: '#FFC107', IsTerminal: false },
    { Code: 'IN_REPAIR', Name: 'Sedang Diperbaiki', Description: 'Sedang dalam proses perbaikan', Color: '#17A2B8', IsTerminal: false },
    { Code: 'SPARE_PARTS', Name: 'Menunggu Suku Cadang', Description: 'Menunggu suku cadang', Color: '#FFA500', IsTerminal: false },
    { Code: 'COMPLETED', Name: 'Selesai', Description: 'Perbaikan selesai', Color: '#28A745', IsTerminal: true },
    { Code: 'CANCELLED', Name: 'Dibatalkan', Description: 'Perbaikan dibatalkan', Color: '#DC3545', IsTerminal: true },
  ];

  for (const status of repairStatuses) {
    await prisma.repairStatus.upsert({
      where: { Code: status.Code },
      create: { ...status, IsActive: true, SortOrder: repairStatuses.indexOf(status) },
      update: { Name: status.Name, Description: status.Description, Color: status.Color },
    });
  }
  console.log('✓ RepairStatuses seeded');

  // ─── Seed ProductionStatuses ────────────────────────────────────
  const productionStatuses = [
    { Code: 'PLANNING', Name: 'Perencanaan', Description: 'Sedang dalam perencanaan', Color: '#6C757D', IsTerminal: false },
    { Code: 'IN_PROGRESS', Name: 'Sedang Berlangsung', Description: 'Produksi sedang berlangsung', Color: '#FFC107', IsTerminal: false },
    { Code: 'COMPLETED', Name: 'Selesai', Description: 'Produksi selesai', Color: '#28A745', IsTerminal: true },
    { Code: 'CANCELLED', Name: 'Dibatalkan', Description: 'Produksi dibatalkan', Color: '#DC3545', IsTerminal: true },
  ];

  for (const status of productionStatuses) {
    await prisma.productionStatus.upsert({
      where: { Code: status.Code },
      create: { ...status, IsActive: true, SortOrder: productionStatuses.indexOf(status) },
      update: { Name: status.Name, Description: status.Description, Color: status.Color },
    });
  }
  console.log('✓ ProductionStatuses seeded');

  // ─── Seed VoucherTypes ─────────────────────────────────────────
  const voucherTypes = [
    { Code: 'PERCENTAGE', Name: 'Persentase', Description: 'Diskon dalam bentuk persentase', HasMaxDiscount: true },
    { Code: 'FIXED', Name: 'Nominal', Description: 'Diskon dalam bentuk nominal', HasMaxDiscount: false },
    { Code: 'BUY_GET', Name: 'Beli Dapat', Description: 'Beli X dapat Y', HasMaxDiscount: false },
  ];

  for (const type of voucherTypes) {
    await prisma.voucherType.upsert({
      where: { Code: type.Code },
      create: { ...type, IsActive: true, SortOrder: voucherTypes.indexOf(type) },
      update: { Name: type.Name, Description: type.Description },
    });
  }
  console.log('✓ VoucherTypes seeded');

  // ─── Seed NotificationTypes ─────────────────────────────────────
  const notificationTypes = [
    { Code: 'SALE', Name: 'Penjualan', Description: 'Notifikasi penjualan', Icon: 'shopping-cart', Color: '#28A745' },
    { Code: 'PURCHASE', Name: 'Pembelian', Description: 'Notifikasi pembelian', Icon: 'package', Color: '#17A2B8' },
    { Code: 'STOCK', Name: 'Stok', Description: 'Notifikasi stok barang', Icon: 'archive', Color: '#FFC107' },
    { Code: 'PAYMENT', Name: 'Pembayaran', Description: 'Notifikasi pembayaran', Icon: 'credit-card', Color: '#28A745' },
    { Code: 'APPOINTMENT', Name: 'Janji Temu', Description: 'Notifikasi janji temu', Icon: 'calendar', Color: '#17A2B8' },
    { Code: 'REMINDER', Name: 'Pengingat', Description: 'Notifikasi pengingat', Icon: 'bell', Color: '#FFA500' },
    { Code: 'ALERT', Name: 'Peringatan', Description: 'Notifikasi peringatan', Icon: 'alert-triangle', Color: '#DC3545' },
    { Code: 'INFO', Name: 'Informasi', Description: 'Notifikasi informasi umum', Icon: 'info', Color: '#6C757D' },
  ];

  for (const type of notificationTypes) {
    await prisma.notificationType.upsert({
      where: { Code: type.Code },
      create: { ...type, IsActive: true, SortOrder: notificationTypes.indexOf(type) },
      update: { Name: type.Name, Description: type.Description },
    });
  }
  console.log('✓ NotificationTypes seeded');

  // ─── Seed AlertTypes ───────────────────────────────────────────
  const alertTypes = [
    { Code: 'LOW_STOCK', Name: 'Stok Rendah', Description: 'Stok barang di bawah minimum', Color: '#FFC107' },
    { Code: 'OUT_OF_STOCK', Name: 'Stok Habis', Description: 'Stok barang habis', Color: '#DC3545' },
    { Code: 'EXPIRED', Name: 'Kadaluarsa', Description: 'Barang sudah kadaluarsa', Color: '#DC3545' },
    { Code: 'OVERSTOCK', Name: 'Over Stok', Description: 'Stok barang berlebihan', Color: '#17A2B8' },
    { Code: 'REORDER', Name: 'Reorder', Description: 'Waktunya reorder', Color: '#FFA500' },
  ];

  for (const type of alertTypes) {
    await prisma.alertType.upsert({
      where: { Code: type.Code },
      create: { ...type, IsActive: true, SortOrder: alertTypes.indexOf(type) },
      update: { Name: type.Name, Description: type.Description, Color: type.Color },
    });
  }
  console.log('✓ AlertTypes seeded');

  // ─── Seed PointSettings ────────────────────────────────────────
  await prisma.pointSetting.upsert({
    where: { ID: 1 },
    create: {
      ID: 1,
      Name: 'Default Loyalty Program',
      PointsPerRupiah: 0.01, // 1 point per Rp 100
      MinimumTransaction: 10000,
      IsActive: true,
    },
    update: {},
  });
  console.log('✓ PointSettings seeded');

  // ─── Seed Numberings ───────────────────────────────────────────
  const numberings = [
    { Type: 'SALE', Prefix: 'SA', DigitCount: 4, Suffix: '' },
    { Type: 'PURCHASE', Prefix: 'PO', DigitCount: 4, Suffix: '' },
    { Type: 'PURCHASE_ORDER', Prefix: 'PR', DigitCount: 4, Suffix: '' },
    { Type: 'SALE_RETURN', Prefix: 'SR', DigitCount: 4, Suffix: '' },
    { Type: 'PURCHASE_RETURN', Prefix: 'PRR', DigitCount: 4, Suffix: '' },
    { Type: 'STOCK_IN', Prefix: 'SI', DigitCount: 4, Suffix: '' },
    { Type: 'STOCK_OUT', Prefix: 'SO', DigitCount: 4, Suffix: '' },
    { Type: 'STOCK_TRANSFER', Prefix: 'ST', DigitCount: 4, Suffix: '' },
    { Type: 'STOCK_OPNAME', Prefix: 'OP', DigitCount: 4, Suffix: '' },
    { Type: 'EXPENSE', Prefix: 'EX', DigitCount: 4, Suffix: '' },
    { Type: 'CASH_IN', Prefix: 'CI', DigitCount: 4, Suffix: '' },
    { Type: 'CASH_OUT', Prefix: 'CO', DigitCount: 4, Suffix: '' },
    { Type: 'SERVICE', Prefix: 'SV', DigitCount: 4, Suffix: '' },
    { Type: 'PRODUCTION', Prefix: 'PD', DigitCount: 4, Suffix: '' },
    { Type: 'LOAN', Prefix: 'LN', DigitCount: 4, Suffix: '' },
    { Type: 'LEAVE', Prefix: 'LV', DigitCount: 4, Suffix: '' },
    { Type: 'PAYROLL', Prefix: 'PRL', DigitCount: 4, Suffix: '' },
    { Type: 'ASSET', Prefix: 'AST', DigitCount: 4, Suffix: '' },
  ];

  for (const numbering of numberings) {
    await prisma.numbering.upsert({
      where: { Type: numbering.Type },
      create: { ...numbering, LastNumber: 0, IsActive: true },
      update: {},
    });
  }
  console.log('✓ Numberings seeded');

  // ─── Company default ─────────────────────────────────────────
  const company = await prisma.company.upsert({
    where: { CompanyCode: 'INDOMURAH' },
    create: {
      CompanyCode: 'INDOMURAH',
      Name: 'CV Indo Murah',
      Address: 'Jl. Raya Utama No. 1',
      City: 'Jakarta',
      Province: 'DKI Jakarta',
      IsActive: true,
    },
    update: { IsActive: true },
  });

  // ─── Role default (ID = 1) ─────────────────────────────────
  const adminRole = await prisma.role.upsert({
    where: { ID: 1 },
    create: { RoleName: 'Administrator', RoleDescription: 'Akses penuh ke seluruh sistem' },
    update: {},
  });

  // ─── User admin default ────────────────────────────────────
  const adminUsername = 'admin';
  const adminEmail = 'admin@tokocvindomurah.com';
  const adminPassword = await argon2.hash('admin123', { type: argon2.argon2id });

  const admin = await prisma.user.upsert({
    where: {
      CompanyID_Username: {
        CompanyID: company.ID,
        Username: adminUsername,
      },
    },
    create: {
      CompanyID: company.ID,
      Username: adminUsername,
      Email: adminEmail,
      Password: adminPassword,
      Name: 'Administrator',
      Role: 'admin',
      IsActive: true,
    },
    update: { IsActive: true },
  });

  await prisma.userRole.upsert({
    where: { UserID_RoleID: { UserID: admin.ID, RoleID: adminRole.ID } },
    create: { UserID: admin.ID, RoleID: adminRole.ID, IsActive: true },
    update: { IsActive: true },
  });

  // ─── Pelanggan Umum (walk-in) ───────────────────────────────
  const walkInCustomer = await prisma.customer.upsert({
    where: { Code: 'UMUM' },
    create: {
      Code: 'UMUM',
      Name: 'Pelanggan Umum',
      CustomerGroupID: 1, // GENERAL group
      IsActive: true
    },
    update: {},
  });

  // ─── Menus dasar + akses role Admin ─────────────────────────
  const menuNames = ['dashboard', 'users', 'roles', 'menus'];
  const menus = await Promise.all(
    menuNames.map((name) =>
      prisma.menu.upsert({
        where: { ID: menuNames.indexOf(name) + 1 },
        create: { ID: menuNames.indexOf(name) + 1, MenuName: name, MenuType: 'sidebar' },
        update: {},
      }),
    ),
  );

  await Promise.all(
    menus.map((menu) =>
      prisma.roleMenu.upsert({
        where: { RoleID_MenuID: { RoleID: adminRole.ID, MenuID: menu.ID } },
        create: { RoleID: adminRole.ID, MenuID: menu.ID },
        update: { IsActive: true },
      }),
    ),
  );

  // Seed menu akses personal admin (UserMenu) dari RoleMenu-nya
  await Promise.all(
    menus.map((menu) =>
      prisma.userMenu.upsert({
        where: { UserID_MenuID: { UserID: admin.ID, MenuID: menu.ID } },
        create: { UserID: admin.ID, MenuID: menu.ID },
        update: { IsActive: true },
      }),
    ),
  );

  console.log('\n✅ Seed selesai:');
  console.log(`  Company: ${company.CompanyCode} (ID=${company.ID})`);
  console.log(`  Role   : ${adminRole.RoleName} (ID=${adminRole.ID})`);
  console.log(`  Menus  : ${menus.map((m) => m.MenuName).join(', ')}`);
  console.log(`  Customer walk-in: ${walkInCustomer.Code} (ID=${walkInCustomer.ID})`);
  console.log(`  Admin  : ${company.CompanyCode} / ${adminUsername} / admin123 (GANTI password ini setelah login pertama!)`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
