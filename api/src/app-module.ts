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
//      - LoggingInterceptor: catat setiap request ke tabel logs
//
// ================================================================

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

// Configs — membaca semua konfigurasi dari .env
import { appConfig, databaseConfig, jwtConfig, redisConfig, securityConfig } from './config';

// ── Infrastruktur ──────────────────────────────────────────────────────
import { PrismaModule } from './common/prisma/prisma-module';
import { RedisModule } from './common/redis/redis-module';
import { QueryModule } from './common/query/query-module';
import { HashIdModule } from './common/utils/hash-id-module';

// ── Fitur ──────────────────────────────────────────────────────────────
import { AuthModule } from './modules/auth/auth-module';
import { UserModule } from './modules/user/user-module';
import { RoleModule } from './modules/role/role-module';
import { MenuModule } from './modules/menu/menu-module';
import { HealthModule } from './modules/health/health-module';

// Purchase Transaction Modules
import { PurchaseOrderModule } from './modules/purchase-order/purchase-order.module';
import { PurchaseModule } from './modules/purchase/purchase.module';
import { PurchasePaymentModule } from './modules/purchase-payment/purchase-payment.module';
import { PurchaseReturnModule } from './modules/purchase-return/purchase-return.module';

// Sale Transaction Modules
import { SaleOrderModule } from './modules/sale-order/sale-order.module';
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
import { JournalEntryModule } from './modules/journal-entry/journal-entry.module';

// Point & Settings Modules
import { PointSettingModule } from './modules/point-setting/point-setting.module';
import { PointRedemptionModule } from './modules/point-redemption/point-redemption.module';
import { CompanyModule } from './modules/company/company.module';
import { NumberingModule } from './modules/numbering/numbering.module';

// Reports
import { ReportModule } from './modules/report/report.module';
import { TestingModule } from './modules/testing/testing.module';
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
import { UserRoleModule } from './modules/user-role/user-role.module';
import { RoleMenuModule } from './modules/role-menu/role-menu.module';
import { UserMenuModule } from './modules/user-menu/user-menu.module';
import { LeaveModule } from './modules/leave/leave.module';
import { LeaveBalanceModule } from './modules/leave-balance/leave-balance.module';

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
    RedisModule,    // Cache layer
    QueryModule,    // Smart query builder ($select, $where, $orderBy, dll)
    HashIdModule,   // Obfuscate integer ID di URL

    // ── [4] Modul Fitur ───────────────────────────────────────────────
    AuthModule,     // Login, register, JWT
    UserModule,     // Data akun + UserRole
    RoleModule,     // Role/jabatan
    MenuModule,     // Menu sidebar + RoleMenu/UserMenu
    HealthModule,   // Health check endpoint (untuk Docker/monitoring)

    // Master Data Modules
    CategoryModule, // Kategori produk
    UnitModule,    // Satuan produk
    BrandModule,   // Merek produk
    SupplierModule,// Supplier/pemasok
    CustomerModule,// Pelanggan
    SalesPersonModule, // Sales person
    WarehouseModule, // Gudang
    ProductModule, // Produk dengan stock management

    // Sale Transaction Modules
    SaleOrderModule,     // Order Penjualan
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
    JournalEntryModule,   // Jurnal Entry

    // Reports
    ReportModule,         // Laporan

    // Point & Settings
    PointSettingModule,   // Pengaturan Poin
    PointRedemptionModule, // Penukaran Poin
    CompanyModule,        // Informasi Perusahaan
    NumberingModule,      // Format Penomoran
    TestingModule,
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
    UserRoleModule,
    RoleMenuModule,
    UserMenuModule,
    LeaveModule,
    LeaveBalanceModule,
  ],
  providers: [
    // ── [5] Guard & Interceptor Global ───────────────────────────────
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Cek rate limit sebelum request masuk
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor, // Catat semua request ke tabel `logs`
    },
  ],
})
export class AppModule {}
