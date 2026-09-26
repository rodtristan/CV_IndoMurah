// ================================================================
// app-module.ts — Modul Utama Aplikasi
// ================================================================
//
// AppModule adalah "induk" dari semua modul di aplikasi ini.
// Di sinilah semua modul didaftarkan agar bisa saling terhubung.
//
// Struktur modul dibagi menjadi tiga kelompok:
//
//  [1] INFRASTRUKTUR — Modul teknis yang dipakai oleh semua fitur:
//      - ConfigModule   : baca nilai dari file .env
//      - ThrottlerModule: batasi jumlah request (rate limiting)
//      - PrismaModule   : koneksi ke database PostgreSQL
//      - RedisModule    : koneksi ke cache Redis
//      - QueryModule    : helper untuk query database yang fleksibel
//      - HashIdModule   : encode/decode ID di URL (keamanan)
//
//      JWT/Passport TIDAK didaftarkan di sini lagi — AuthModule
//      sudah membawanya sendiri (PassportModule + JwtModule +
//      JwtStrategy), jadi tidak perlu didaftarkan dua kali.
//
//  [2] FITUR — Modul bisnis sesuai domain aplikasi:
//      - AuthModule  : login, register, JWT
//      - UserModule  : data akun + UserRole (role tambahan per user)
//      - RoleModule  : role/jabatan
//      - MenuModule  : menu sidebar + RoleMenu/UserMenu (kontrol akses)
//      Tambahkan modul bisnis lain (Product, Order, Attendance, dll)
//      sesuai kebutuhan Toko CV IndoMurah.
//
//  [3] PROVIDER GLOBAL — Dijalankan untuk setiap request:
//      - ThrottlerGuard    : cek rate limit
//      - AdminRouteGuard   : route sensitif khusus Administrator
//      - AllExceptionsFilter: format error, sembunyikan detail internal
//      - LoggingInterceptor: catat setiap request ke tabel logs
//
// ================================================================

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

// Configs — membaca semua konfigurasi dari .env
import { appConfig, databaseConfig, jwtConfig, redisConfig, securityConfig } from './config';

// ── Infrastruktur ──────────────────────────────────────────────────────
import { PrismaModule } from './common/prisma/prisma-module';
import { AutoAccountingModule } from './common/accounting/accounting.module';
import { RedisModule } from './common/redis/redis-module';
import { QueryModule } from './common/query/query-module';
import { HashIdModule } from './common/utils/hash-id-module';
import { AuthzModule } from './common/auth/authz-module';
import { AdminRouteGuard } from './common/guards/admin-route-guard';
import { AllExceptionsFilter } from './common/filters/all-exceptions-filter';

// ── Fitur ──────────────────────────────────────────────────────────────
import { AuthModule } from './modules/auth/auth-module';
import { UserModule } from './modules/user/user-module';
import { RoleModule } from './modules/role/role-module';
import { MenuModule } from './modules/menu/menu-module';
import { HealthModule } from './modules/health/health-module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

// Purchase Transaction Modules
import { PurchaseOrderModule } from './modules/purchase-order/purchase-order.module';
import { PurchaseModule } from './modules/purchase/purchase.module';
import { PurchasePaymentModule } from './modules/purchase-payment/purchase-payment.module';
import { PurchaseReturnModule } from './modules/purchase-return/purchase-return.module';

// Sale Transaction Modules
// SaleOrderModule is intentionally NOT registered — sale-order.service.ts
// targets `prisma.saleOrder`/`saleOrderItem`, but no SaleOrder/SaleOrderItem
// model exists anywhere in prisma/schema.prisma (not a naming bug — the
// model was never defined). Not used by the frontend. Excluded from the
// TS build too (see tsconfig.json/tsconfig.build.json `exclude`).
import { SaleModule } from './modules/sale/sale.module';
import { SalePaymentModule } from './modules/sale-payment/sale-payment.module';
import { SaleReturnModule } from './modules/sale-return/sale-return.module';
import { SalePointModule } from './modules/sale-point/sale-point.module';

// Master Data Modules
import { CategoryModule } from './modules/category/category.module';
import { UnitModule } from './modules/unit/unit.module';
import { BrandModule } from './modules/brand/brand.module';
import { SupplierModule } from './modules/supplier/supplier.module';
import { CustomerModule } from './modules/customer/customer.module';
import { CustomerGroupModule } from './modules/customer-group/customer-group.module';
import { BankModule } from './modules/bank/bank.module';
import { EMoneyModule } from './modules/e-money/e-money.module';
import { RegionModule } from './modules/region/region.module';
import { SubRegionModule } from './modules/sub-region/sub-region.module';
import { ShippingCostModule } from './modules/shipping-cost/shipping-cost.module';
import { PromotionModule } from './modules/promotion/promotion.module';
import { SalesPersonModule } from './modules/sales-person/sales-person.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { ProductModule } from './modules/product/product.module';

// Inventory Modules
import { StockInModule } from './modules/stock-in/stock-in.module';
import { StockOutModule } from './modules/stock-out/stock-out.module';
import { StockTransferModule } from './modules/stock-transfer/stock-transfer.module';
import { StockOpnameModule } from './modules/stock-opname/stock-opname.module';

// Accounting Modules
import { AccountModule } from './modules/account/account.module';
import { CashInModule } from './modules/cash-in/cash-in.module';
import { CashOutModule } from './modules/cash-out/cash-out.module';
import { CashTransferModule } from './modules/cash-transfer/cash-transfer.module';
import { CustomerDepositModule } from './modules/customer-deposit/customer-deposit.module';
import { SupplierDepositModule } from './modules/supplier-deposit/supplier-deposit.module';
import { JournalModule } from './modules/journal/journal.module';
import { FileStorageModule } from './modules/file-storage/file-storage.module';
import { AttendanceMobileModule } from './modules/attendance-mobile/attendance-mobile.module';
import { OpeningBalanceModule } from './modules/opening-balance/opening-balance.module';
import { AccountSettingModule } from './modules/account-setting/account-setting.module';
import { FiscalYearModule } from './modules/fiscal-year/fiscal-year.module';
import { JournalEntryModule } from './modules/journal-entry/journal-entry.module';

// Point & Settings Modules
import { PointSettingModule } from './modules/point-setting/point-setting.module';
import { PointRedemptionModule } from './modules/point-redemption/point-redemption.module';
import { CompanyModule } from './modules/company/company.module';
import { NumberingModule } from './modules/numbering/numbering.module';

// Reports
import { ReportModule } from './modules/report/report.module';
// TestingModule sengaja TIDAK didaftarkan (endpoint uji tidak boleh ada di produksi).
import { ExpenseCategoryModule } from './modules/expense-category/expense-category.module';
import { ExpenseModule } from './modules/expense/expense.module';
import { TransferModule } from './modules/transfer/transfer.module';
import { AssetCategoryModule } from './modules/asset-category/asset-category.module';
import { AssetModule } from './modules/asset/asset.module';
import { ServiceModule } from './modules/service/service.module';
import { ServiceItemModule } from './modules/service-item/service-item.module';
import { PriceHistoryModule } from './modules/price-history/price-history.module';
import { VoucherModule } from './modules/voucher/voucher.module';
import { TaxModule } from './modules/tax/tax.module';
import { ProductionModule } from './modules/production/production.module';
import { ProductionItemModule } from './modules/production-item/production-item.module';
import { DepartmentModule } from './modules/department/department.module';
import { PositionModule } from './modules/position/position.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { LoanModule } from './modules/loan/loan.module';
import { LoanInstallmentModule } from './modules/loan-installment/loan-installment.module';
import { NotificationModule } from './modules/notification/notification.module';
import { PaymentMethodModule } from './modules/payment-method/payment-method.module';
import { ChequePaymentModule } from './modules/cheque-payment/cheque-payment.module';
import { ProductStockModule } from './modules/product-stock/product-stock.module';
import { StockInItemModule } from './modules/stock-in-item/stock-in-item.module';
import { StockOutItemModule } from './modules/stock-out-item/stock-out-item.module';
import { StockTransferItemModule } from './modules/stock-transfer-item/stock-transfer-item.module';
import { StockOpnameItemModule } from './modules/stock-opname-item/stock-opname-item.module';
import { SaleItemModule } from './modules/sale-item/sale-item.module';
import { SaleReturnItemModule } from './modules/sale-return-item/sale-return-item.module';
import { PurchaseOrderItemModule } from './modules/purchase-order-item/purchase-order-item.module';
import { PurchaseItemModule } from './modules/purchase-item/purchase-item.module';
import { PurchaseReturnItemModule } from './modules/purchase-return-item/purchase-return-item.module';
import { ActivityLogModule } from './modules/activity-log/activity-log.module';
import { BrandLogoModule } from './modules/brand-logo/brand-logo.module';
import { LogModule } from './modules/log/log.module';
import { DailySalesSummaryModule } from './modules/daily-sales-summary/daily-sales-summary.module';
import { MonthlySalesSummaryModule } from './modules/monthly-sales-summary/monthly-sales-summary.module';
import { NotificationSettingModule } from './modules/notification-setting/notification-setting.module';
import { ProductBarcodeModule } from './modules/product-barcode/product-barcode.module';
import { ProductImageModule } from './modules/product-image/product-image.module';
import { StockAlertModule } from './modules/stock-alert/stock-alert.module';
import { ShelfModule } from './modules/shelf/shelf.module';
import { ShelfProductModule } from './modules/shelf-product/shelf-product.module';
import { ProductGroupModule } from './modules/product-group/product-group.module';
import { ProductTypeModule } from './modules/business-logic/product-type/product-type-module';
import { UserRoleModule } from './modules/user-role/user-role.module';
import { RoleMenuModule } from './modules/role-menu/role-menu.module';
import { UserMenuModule } from './modules/user-menu/user-menu.module';
import { StockBalanceModule } from './modules/stock-balance/stock-balance.module';
import { StockModule } from './common/stock/stock.module';
import { ProductImportModule } from './modules/product-import/product-import.module';
import { LeaveModule } from './modules/leave/leave.module';
import { LeaveBalanceModule } from './modules/leave-balance/leave-balance.module';
import { AppSettingModule } from './modules/app-setting/app-setting.module';
import { ReportEngineModule } from './modules/report-engine/report-engine.module';
// BackupModule sengaja TIDAK didaftarkan: implementasinya hanya men-dump 10 tabel
// ke JSON di disk container (hilang saat redeploy) dan restore-nya placeholder.
// Backup produksi = backup Postgres terkelola (Railway Backups / pg_dump).
import { BalanceRepairModule } from './modules/balance-repair/balance-repair.module';

// ── Business Logic Modules ──────────────────────────────────────────────
// The `src/modules/business-logic/**` tree (54 submodules from the
// "Business-logic" merge) has been repaired to compile cleanly against the
// real schema.prisma and is now registered below. Its controllers are all
// mounted under the `business-logic/` route prefix, so none of them collide
// with the already-live modules above; several class names do collide
// though (e.g. PurchaseModule, SupplierModule), so those are imported under
// a `BL`-prefixed alias.
import { AccountingModule } from './modules/business-logic/accounting/accounting-module';
import { AnalyticsModule } from './modules/business-logic/analytics/analytics-module';
import { AssemblyModule } from './modules/business-logic/assembly/assembly-module';
import { AssetModule as BLAssetModule } from './modules/business-logic/asset/asset-module';
import { AttendanceIntegrationModule } from './modules/business-logic/attendance-integration/attendance-integration-module';
import { AttendanceModule as BLAttendanceModule } from './modules/business-logic/attendance/attendance-module';
import { BudgetingModule } from './modules/business-logic/budgeting/budgeting-module';
import { CashFlowModule } from './modules/business-logic/cash-flow/cash-flow-module';
import { CashModule } from './modules/business-logic/cash/cash-module';
import { CategoryBrandModule } from './modules/business-logic/category-brand/category-brand-module';
import { CustomerDepositModule as BLCustomerDepositModule } from './modules/business-logic/customer-deposit/customer-deposit-module';
import { CustomerModule as BLCustomerModule } from './modules/business-logic/customer/customer-module';
import { ExpenseModule as BLExpenseModule } from './modules/business-logic/expense/expense-module';
import { HRMModule } from './modules/business-logic/hrm/hrm-module';
import { InventoryModule } from './modules/business-logic/inventory/inventory-module';
import { JournalModule as BLJournalModule } from './modules/business-logic/journal/journal-module';
import { LeaveModule as BLLeaveModule } from './modules/business-logic/leave/leave-module';
import { LoanModule as BLLoanModule } from './modules/business-logic/loan/loan-module';
import { LoyaltyModule } from './modules/business-logic/loyalty/loyalty-module';
import { MemberCardModule } from './modules/business-logic/member-card/member-card-module';
import { NotificationGatewayModule } from './modules/business-logic/notification-gateway/notification-gateway-module';
import { NotificationModule as BLNotificationModule } from './modules/business-logic/notification/notification-module';
import { POSModule } from './modules/business-logic/pos/pos-module';
import { PayrollModule as BLPayrollModule } from './modules/business-logic/payroll/payroll-module';
import { PriceModule } from './modules/business-logic/price/price-module';
import { ProductPriceModule } from './modules/business-logic/product-price/product-price-module';
import { ProductUnitModule } from './modules/business-logic/product-unit/product-unit-module';
import { ProductionMaterialModule } from './modules/business-logic/production-material/production-material-module';
import { ProductionModule as BLProductionModule } from './modules/business-logic/production/production-module';
import { ProductionRecipeModule } from './modules/business-logic/production-recipe/production-recipe-module';
import { ProductionRequestModule } from './modules/business-logic/production-request/production-request-module';
import { ProductionScheduleModule } from './modules/business-logic/production-schedule/production-schedule-module';
import { PurchaseModule as BLPurchaseModule } from './modules/business-logic/purchase/purchase-module';
import { PurchaseOrderModule as BLPurchaseOrderModule } from './modules/business-logic/purchase-order-bl/purchase-order-module';
import { PurchaseReturnModule as BLPurchaseReturnModule } from './modules/business-logic/purchase-return/purchase-return-module';
import { QualityControlCategoryModule } from './modules/business-logic/quality-control-category/quality-control-category-module';
import { QualityControlModule } from './modules/business-logic/quality-control/quality-control-module';
import { ReceivableModule } from './modules/business-logic/receivable/receivable-module';
import { ReportsModule } from './modules/business-logic/reports/reports-module';
import { SaleReturnModule as BLSaleReturnModule } from './modules/business-logic/sale-return/sale-return-module';
import { SalesPersonModule as BLSalesPersonModule } from './modules/business-logic/salesperson/salesperson-module';
import { ServiceModule as BLServiceModule } from './modules/business-logic/service/service-module';
import { ServicePackageModule } from './modules/business-logic/service-package/service-package-module';
import { StockAlertModule as BLStockAlertModule } from './modules/business-logic/stock-alert/stock-alert-module';
import { StockMutationModule } from './modules/business-logic/stock-mutation/stock-mutation-module';
import { StockOpnameModule as BLStockOpnameModule } from './modules/business-logic/stock-opname/stock-opname-module';
import { StockTransferModule as BLStockTransferModule } from './modules/business-logic/stock-transfer/stock-transfer-module';
import { SupplierDebtModule } from './modules/business-logic/supplier-debt/supplier-debt-module';
import { SupplierModule as BLSupplierModule } from './modules/business-logic/supplier/supplier-module';
import { TransferModule as BLTransferModule } from './modules/business-logic/transfer/transfer-module';
import { VoucherModule as BLVoucherModule } from './modules/business-logic/voucher/voucher-module';
import { WarehouseModule as BLWarehouseModule } from './modules/business-logic/warehouse/warehouse-module';
import { WorkOrderModule } from './modules/business-logic/work-order/work-order-module';
import { YearCloseModule } from './modules/year-close/year-close.module';

// ── Provider Global ────────────────────────────────────────────────────
import { LoggingInterceptor } from './common/interceptors/logging-interceptor';

@Module({
  imports: [
    // ── [1] Konfigurasi Environment (.env) ── ─────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
      cache: true,
      load: [appConfig, databaseConfig, jwtConfig, redisConfig, securityConfig],
    }),

    // ── [2] Rate Limiting — Batasi Jumlah Request ─────────────────────
    //   short : maks 10 request per detik
    //   medium: maks 50 request per 10 detik
    //   long  : maks 200 request per menit
    // (AuthController login/register punya limit lebih ketat sendiri)
    ThrottlerModule.forRoot([
      { name: 'short',  ttl: 1000,  limit: 10  },
      { name: 'medium', ttl: 10000, limit: 50  },
      { name: 'long',   ttl: 60000, limit: 200 },
    ]),

    // ── [3] Infrastruktur Core ────────────────────────────────────────
    PrismaModule,   // Database ORM (PostgreSQL)
    AutoAccountingModule, // Jurnal otomatis + saldo deposit (global)
    RedisModule,    // Cache layer
    QueryModule,    // Smart query builder ($select, $where, $orderBy, dll)
    HashIdModule,   // Obfuscate integer ID di URL
    AuthzModule,    // Status user aktif/admin (cache Redis) untuk JwtStrategy & AdminRouteGuard

    // ── [4] Modul Fitur ───────────────────────────────────────────────
    AuthModule,     // Login, register, JWT
    UserModule,     // Data akun + UserRole
    RoleModule,     // Role/jabatan
    MenuModule,     // Menu sidebar + RoleMenu/UserMenu (kontrol akses)
    HealthModule,   // Health check endpoint (untuk Docker/monitoring)
    DashboardModule, // Ringkasan KPI untuk halaman utama

    // Master Data Modules
    CategoryModule, // Kategori produk
    UnitModule,    // Satuan produk
    BrandModule,   // Merek produk
    SupplierModule,// Supplier/pemasok
    CustomerModule,// Pelanggan
    CustomerGroupModule, // Grup Pelanggan
    BankModule, // Bank
    EMoneyModule, // E-Money
    RegionModule, // Region/Wilayah
    SubRegionModule, // Sub-Region
    ShippingCostModule, // Ongkos Kirim
    PromotionModule, // Promosi
    SalesPersonModule, // Sales person
    WarehouseModule, // Gudang
    ProductModule, // Produk dengan stock management

    // Purchase Transaction Modules
    PurchaseOrderModule,   // Pesanan Pembelian
    PurchaseModule,        // Pembelian
    PurchasePaymentModule, // Pembayaran Pembelian
    PurchaseReturnModule,  // Retur Pembelian

    // Sale Transaction Modules
    SaleModule,          // Penjualan
    SalePaymentModule,   // Pembayaran Penjualan
    SaleReturnModule,    // Retur Penjualan
    SalePointModule,     // Poin Penjualan

    // Inventory Modules
    StockInModule,        // Barang Masuk
    StockOutModule,       // Barang Keluar
    StockTransferModule,  // Transfer Stock
    StockOpnameModule,    // Stock Opname

    // Accounting Modules
    AccountModule,         // Chart of Accounts
    CashInModule,         // Kas Masuk
    CashOutModule,        // Kas Keluar
    CashTransferModule,    // Transfer Kas
    CustomerDepositModule, // Deposito Pelanggan
    SupplierDepositModule, // Deposito Supplier
    JournalModule,        // Jurnal Umum
    OpeningBalanceModule,
    AccountSettingModule,
    FiscalYearModule,
    JournalEntryModule,   // Jurnal Entry

    // Reports
    ReportModule,         // Laporan

    // Point & Settings
    PointSettingModule,   // Pengaturan Poin
    PointRedemptionModule, // Penukaran Poin (sale/points)
    CompanyModule,        // Informasi Perusahaan
    NumberingModule,      // Format Penomoran
    ExpenseCategoryModule,
    ExpenseModule,
    TransferModule,       // Transfer (Gudang/Kas)
    AssetCategoryModule,
    AssetModule,
    ServiceModule,
    ServiceItemModule,
    PriceHistoryModule,
    VoucherModule,
    TaxModule,
    ProductionModule,
    ProductionItemModule,
    DepartmentModule,
    PositionModule,
    EmployeeModule,
    AttendanceModule,
    PayrollModule,
    LoanModule,
    LoanInstallmentModule,
    NotificationModule,
    PaymentMethodModule,
    ChequePaymentModule,
    ProductStockModule,
    StockInItemModule,
    StockOutItemModule,
    StockTransferItemModule,
    StockOpnameItemModule,
    SaleItemModule,
    SaleReturnItemModule,
    PurchaseOrderItemModule,
    PurchaseItemModule,
    PurchaseReturnItemModule,
    ActivityLogModule,
    LogModule,
    BrandLogoModule,
    DailySalesSummaryModule,
    MonthlySalesSummaryModule,
    NotificationSettingModule,
    ProductBarcodeModule,
    ProductImageModule,
    StockAlertModule,
    ShelfModule,
    ShelfProductModule,
    ProductGroupModule,
    ProductTypeModule,
    UserRoleModule,
    RoleMenuModule,
    UserMenuModule,
    LeaveModule,
    LeaveBalanceModule,
    AppSettingModule,
    StockBalanceModule,
    StockModule,
    ProductImportModule,
    ReportEngineModule,
    FileStorageModule,
    AttendanceMobileModule,
    // ImportModule dicabut: duplikat product-import dan menimpa stok berjalan (tidak dipakai web).
    BalanceRepairModule,

    // Business Logic Modules (see comment above the imports above)
    AccountingModule,
    AnalyticsModule,
    AssemblyModule,
    BLAssetModule,
    AttendanceIntegrationModule,
    BLAttendanceModule,
    BudgetingModule,
    CashFlowModule,
    CashModule,
    CategoryBrandModule,
    BLCustomerDepositModule,
    BLCustomerModule,
    BLExpenseModule,
    HRMModule,
    InventoryModule,
    BLJournalModule,
    BLLeaveModule,
    BLLoanModule,
    LoyaltyModule,
    MemberCardModule,
    NotificationGatewayModule,
    BLNotificationModule,
    POSModule,
    BLPayrollModule,
    PriceModule,
    ProductPriceModule,
    ProductUnitModule,
    ProductionMaterialModule,
    BLProductionModule,
    ProductionRecipeModule,
    ProductionRequestModule,
    ProductionScheduleModule,
    BLPurchaseModule,
    BLPurchaseOrderModule,
    BLPurchaseReturnModule,
    QualityControlCategoryModule,
    QualityControlModule,
    ReceivableModule,
    ReportsModule,
    BLSaleReturnModule,
    BLSalesPersonModule,
    BLServiceModule,
    ServicePackageModule,
    BLStockAlertModule,
    StockMutationModule,
    BLStockOpnameModule,
    BLStockTransferModule,
    SupplierDebtModule,
    BLSupplierModule,
    BLTransferModule,
    BLVoucherModule,
    BLWarehouseModule,
    WorkOrderModule,
    YearCloseModule,
  ],
  providers: [
    // ── [5] Guard & Interceptor Global ───────────────────────────────
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Cek rate limit sebelum request masuk
    },
    {
      // Route sensitif (users, roles, menus, journal, backup, import, ...)
      // hanya untuk Administrator. Fail closed. Lihat admin-route-guard.ts.
      provide: APP_GUARD,
      useExisting: AdminRouteGuard,
    },
    {
      // Format error seragam; 500 tidak membocorkan detail internal di production.
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor, // Catat semua request ke tabel `logs`
    },
  ],
})
export class AppModule {}
