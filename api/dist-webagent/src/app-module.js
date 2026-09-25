"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const config_2 = require("./config");
const prisma_module_1 = require("./common/prisma/prisma-module");
const accounting_module_1 = require("./common/accounting/accounting.module");
const redis_module_1 = require("./common/redis/redis-module");
const query_module_1 = require("./common/query/query-module");
const hash_id_module_1 = require("./common/utils/hash-id-module");
const authz_module_1 = require("./common/auth/authz-module");
const admin_route_guard_1 = require("./common/guards/admin-route-guard");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions-filter");
const auth_module_1 = require("./modules/auth/auth-module");
const user_module_1 = require("./modules/user/user-module");
const role_module_1 = require("./modules/role/role-module");
const menu_module_1 = require("./modules/menu/menu-module");
const health_module_1 = require("./modules/health/health-module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const purchase_order_module_1 = require("./modules/purchase-order/purchase-order.module");
const purchase_module_1 = require("./modules/purchase/purchase.module");
const purchase_payment_module_1 = require("./modules/purchase-payment/purchase-payment.module");
const purchase_return_module_1 = require("./modules/purchase-return/purchase-return.module");
const sale_module_1 = require("./modules/sale/sale.module");
const sale_payment_module_1 = require("./modules/sale-payment/sale-payment.module");
const sale_return_module_1 = require("./modules/sale-return/sale-return.module");
const sale_point_module_1 = require("./modules/sale-point/sale-point.module");
const category_module_1 = require("./modules/category/category.module");
const unit_module_1 = require("./modules/unit/unit.module");
const brand_module_1 = require("./modules/brand/brand.module");
const supplier_module_1 = require("./modules/supplier/supplier.module");
const customer_module_1 = require("./modules/customer/customer.module");
const customer_group_module_1 = require("./modules/customer-group/customer-group.module");
const bank_module_1 = require("./modules/bank/bank.module");
const e_money_module_1 = require("./modules/e-money/e-money.module");
const region_module_1 = require("./modules/region/region.module");
const sub_region_module_1 = require("./modules/sub-region/sub-region.module");
const shipping_cost_module_1 = require("./modules/shipping-cost/shipping-cost.module");
const promotion_module_1 = require("./modules/promotion/promotion.module");
const sales_person_module_1 = require("./modules/sales-person/sales-person.module");
const warehouse_module_1 = require("./modules/warehouse/warehouse.module");
const product_module_1 = require("./modules/product/product.module");
const stock_in_module_1 = require("./modules/stock-in/stock-in.module");
const stock_out_module_1 = require("./modules/stock-out/stock-out.module");
const stock_transfer_module_1 = require("./modules/stock-transfer/stock-transfer.module");
const stock_opname_module_1 = require("./modules/stock-opname/stock-opname.module");
const account_module_1 = require("./modules/account/account.module");
const cash_in_module_1 = require("./modules/cash-in/cash-in.module");
const cash_out_module_1 = require("./modules/cash-out/cash-out.module");
const cash_transfer_module_1 = require("./modules/cash-transfer/cash-transfer.module");
const customer_deposit_module_1 = require("./modules/customer-deposit/customer-deposit.module");
const supplier_deposit_module_1 = require("./modules/supplier-deposit/supplier-deposit.module");
const journal_module_1 = require("./modules/journal/journal.module");
const file_storage_module_1 = require("./modules/file-storage/file-storage.module");
const attendance_mobile_module_1 = require("./modules/attendance-mobile/attendance-mobile.module");
const opening_balance_module_1 = require("./modules/opening-balance/opening-balance.module");
const account_setting_module_1 = require("./modules/account-setting/account-setting.module");
const fiscal_year_module_1 = require("./modules/fiscal-year/fiscal-year.module");
const journal_entry_module_1 = require("./modules/journal-entry/journal-entry.module");
const point_setting_module_1 = require("./modules/point-setting/point-setting.module");
const point_redemption_module_1 = require("./modules/point-redemption/point-redemption.module");
const company_module_1 = require("./modules/company/company.module");
const numbering_module_1 = require("./modules/numbering/numbering.module");
const report_module_1 = require("./modules/report/report.module");
const expense_category_module_1 = require("./modules/expense-category/expense-category.module");
const expense_module_1 = require("./modules/expense/expense.module");
const transfer_module_1 = require("./modules/transfer/transfer.module");
const asset_category_module_1 = require("./modules/asset-category/asset-category.module");
const asset_module_1 = require("./modules/asset/asset.module");
const service_module_1 = require("./modules/service/service.module");
const service_item_module_1 = require("./modules/service-item/service-item.module");
const price_history_module_1 = require("./modules/price-history/price-history.module");
const voucher_module_1 = require("./modules/voucher/voucher.module");
const tax_module_1 = require("./modules/tax/tax.module");
const production_module_1 = require("./modules/production/production.module");
const production_item_module_1 = require("./modules/production-item/production-item.module");
const department_module_1 = require("./modules/department/department.module");
const position_module_1 = require("./modules/position/position.module");
const employee_module_1 = require("./modules/employee/employee.module");
const attendance_module_1 = require("./modules/attendance/attendance.module");
const payroll_module_1 = require("./modules/payroll/payroll.module");
const loan_module_1 = require("./modules/loan/loan.module");
const loan_installment_module_1 = require("./modules/loan-installment/loan-installment.module");
const notification_module_1 = require("./modules/notification/notification.module");
const payment_method_module_1 = require("./modules/payment-method/payment-method.module");
const cheque_payment_module_1 = require("./modules/cheque-payment/cheque-payment.module");
const product_stock_module_1 = require("./modules/product-stock/product-stock.module");
const stock_in_item_module_1 = require("./modules/stock-in-item/stock-in-item.module");
const stock_out_item_module_1 = require("./modules/stock-out-item/stock-out-item.module");
const stock_transfer_item_module_1 = require("./modules/stock-transfer-item/stock-transfer-item.module");
const stock_opname_item_module_1 = require("./modules/stock-opname-item/stock-opname-item.module");
const sale_item_module_1 = require("./modules/sale-item/sale-item.module");
const sale_return_item_module_1 = require("./modules/sale-return-item/sale-return-item.module");
const purchase_order_item_module_1 = require("./modules/purchase-order-item/purchase-order-item.module");
const purchase_item_module_1 = require("./modules/purchase-item/purchase-item.module");
const purchase_return_item_module_1 = require("./modules/purchase-return-item/purchase-return-item.module");
const activity_log_module_1 = require("./modules/activity-log/activity-log.module");
const brand_logo_module_1 = require("./modules/brand-logo/brand-logo.module");
const log_module_1 = require("./modules/log/log.module");
const daily_sales_summary_module_1 = require("./modules/daily-sales-summary/daily-sales-summary.module");
const monthly_sales_summary_module_1 = require("./modules/monthly-sales-summary/monthly-sales-summary.module");
const notification_setting_module_1 = require("./modules/notification-setting/notification-setting.module");
const product_barcode_module_1 = require("./modules/product-barcode/product-barcode.module");
const product_image_module_1 = require("./modules/product-image/product-image.module");
const stock_alert_module_1 = require("./modules/stock-alert/stock-alert.module");
const shelf_module_1 = require("./modules/shelf/shelf.module");
const shelf_product_module_1 = require("./modules/shelf-product/shelf-product.module");
const product_group_module_1 = require("./modules/product-group/product-group.module");
const product_type_module_1 = require("./modules/business-logic/product-type/product-type-module");
const user_role_module_1 = require("./modules/user-role/user-role.module");
const role_menu_module_1 = require("./modules/role-menu/role-menu.module");
const user_menu_module_1 = require("./modules/user-menu/user-menu.module");
const stock_balance_module_1 = require("./modules/stock-balance/stock-balance.module");
const stock_module_1 = require("./common/stock/stock.module");
const product_import_module_1 = require("./modules/product-import/product-import.module");
const leave_module_1 = require("./modules/leave/leave.module");
const leave_balance_module_1 = require("./modules/leave-balance/leave-balance.module");
const app_setting_module_1 = require("./modules/app-setting/app-setting.module");
const report_engine_module_1 = require("./modules/report-engine/report-engine.module");
const import_module_1 = require("./modules/import/import.module");
const balance_repair_module_1 = require("./modules/balance-repair/balance-repair.module");
const accounting_module_2 = require("./modules/business-logic/accounting/accounting-module");
const analytics_module_1 = require("./modules/business-logic/analytics/analytics-module");
const assembly_module_1 = require("./modules/business-logic/assembly/assembly-module");
const asset_module_2 = require("./modules/business-logic/asset/asset-module");
const attendance_integration_module_1 = require("./modules/business-logic/attendance-integration/attendance-integration-module");
const attendance_module_2 = require("./modules/business-logic/attendance/attendance-module");
const budgeting_module_1 = require("./modules/business-logic/budgeting/budgeting-module");
const cash_flow_module_1 = require("./modules/business-logic/cash-flow/cash-flow-module");
const cash_module_1 = require("./modules/business-logic/cash/cash-module");
const category_brand_module_1 = require("./modules/business-logic/category-brand/category-brand-module");
const customer_deposit_module_2 = require("./modules/business-logic/customer-deposit/customer-deposit-module");
const customer_module_2 = require("./modules/business-logic/customer/customer-module");
const expense_module_2 = require("./modules/business-logic/expense/expense-module");
const hrm_module_1 = require("./modules/business-logic/hrm/hrm-module");
const inventory_module_1 = require("./modules/business-logic/inventory/inventory-module");
const journal_module_2 = require("./modules/business-logic/journal/journal-module");
const leave_module_2 = require("./modules/business-logic/leave/leave-module");
const loan_module_2 = require("./modules/business-logic/loan/loan-module");
const loyalty_module_1 = require("./modules/business-logic/loyalty/loyalty-module");
const member_card_module_1 = require("./modules/business-logic/member-card/member-card-module");
const notification_gateway_module_1 = require("./modules/business-logic/notification-gateway/notification-gateway-module");
const notification_module_2 = require("./modules/business-logic/notification/notification-module");
const pos_module_1 = require("./modules/business-logic/pos/pos-module");
const payroll_module_2 = require("./modules/business-logic/payroll/payroll-module");
const price_module_1 = require("./modules/business-logic/price/price-module");
const product_price_module_1 = require("./modules/business-logic/product-price/product-price-module");
const product_unit_module_1 = require("./modules/business-logic/product-unit/product-unit-module");
const production_material_module_1 = require("./modules/business-logic/production-material/production-material-module");
const production_module_2 = require("./modules/business-logic/production/production-module");
const production_recipe_module_1 = require("./modules/business-logic/production-recipe/production-recipe-module");
const production_request_module_1 = require("./modules/business-logic/production-request/production-request-module");
const production_schedule_module_1 = require("./modules/business-logic/production-schedule/production-schedule-module");
const purchase_module_2 = require("./modules/business-logic/purchase/purchase-module");
const purchase_order_module_2 = require("./modules/business-logic/purchase-order-bl/purchase-order-module");
const purchase_return_module_2 = require("./modules/business-logic/purchase-return/purchase-return-module");
const quality_control_category_module_1 = require("./modules/business-logic/quality-control-category/quality-control-category-module");
const quality_control_module_1 = require("./modules/business-logic/quality-control/quality-control-module");
const receivable_module_1 = require("./modules/business-logic/receivable/receivable-module");
const reports_module_1 = require("./modules/business-logic/reports/reports-module");
const sale_return_module_2 = require("./modules/business-logic/sale-return/sale-return-module");
const salesperson_module_1 = require("./modules/business-logic/salesperson/salesperson-module");
const service_module_2 = require("./modules/business-logic/service/service-module");
const service_package_module_1 = require("./modules/business-logic/service-package/service-package-module");
const stock_alert_module_2 = require("./modules/business-logic/stock-alert/stock-alert-module");
const stock_mutation_module_1 = require("./modules/business-logic/stock-mutation/stock-mutation-module");
const stock_opname_module_2 = require("./modules/business-logic/stock-opname/stock-opname-module");
const stock_transfer_module_2 = require("./modules/business-logic/stock-transfer/stock-transfer-module");
const supplier_debt_module_1 = require("./modules/business-logic/supplier-debt/supplier-debt-module");
const supplier_module_2 = require("./modules/business-logic/supplier/supplier-module");
const transfer_module_2 = require("./modules/business-logic/transfer/transfer-module");
const voucher_module_2 = require("./modules/business-logic/voucher/voucher-module");
const warehouse_module_2 = require("./modules/business-logic/warehouse/warehouse-module");
const work_order_module_1 = require("./modules/business-logic/work-order/work-order-module");
const year_close_module_1 = require("./modules/year-close/year-close.module");
const logging_interceptor_1 = require("./common/interceptors/logging-interceptor");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env', '../.env'],
                cache: true,
                load: [config_2.appConfig, config_2.databaseConfig, config_2.jwtConfig, config_2.redisConfig, config_2.securityConfig],
            }),
            throttler_1.ThrottlerModule.forRoot([
                { name: 'short', ttl: 1000, limit: 10 },
                { name: 'medium', ttl: 10000, limit: 50 },
                { name: 'long', ttl: 60000, limit: 200 },
            ]),
            prisma_module_1.PrismaModule,
            accounting_module_1.AutoAccountingModule,
            redis_module_1.RedisModule,
            query_module_1.QueryModule,
            hash_id_module_1.HashIdModule,
            authz_module_1.AuthzModule,
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            role_module_1.RoleModule,
            menu_module_1.MenuModule,
            health_module_1.HealthModule,
            dashboard_module_1.DashboardModule,
            category_module_1.CategoryModule,
            unit_module_1.UnitModule,
            brand_module_1.BrandModule,
            supplier_module_1.SupplierModule,
            customer_module_1.CustomerModule,
            customer_group_module_1.CustomerGroupModule,
            bank_module_1.BankModule,
            e_money_module_1.EMoneyModule,
            region_module_1.RegionModule,
            sub_region_module_1.SubRegionModule,
            shipping_cost_module_1.ShippingCostModule,
            promotion_module_1.PromotionModule,
            sales_person_module_1.SalesPersonModule,
            warehouse_module_1.WarehouseModule,
            product_module_1.ProductModule,
            purchase_order_module_1.PurchaseOrderModule,
            purchase_module_1.PurchaseModule,
            purchase_payment_module_1.PurchasePaymentModule,
            purchase_return_module_1.PurchaseReturnModule,
            sale_module_1.SaleModule,
            sale_payment_module_1.SalePaymentModule,
            sale_return_module_1.SaleReturnModule,
            sale_point_module_1.SalePointModule,
            stock_in_module_1.StockInModule,
            stock_out_module_1.StockOutModule,
            stock_transfer_module_1.StockTransferModule,
            stock_opname_module_1.StockOpnameModule,
            account_module_1.AccountModule,
            cash_in_module_1.CashInModule,
            cash_out_module_1.CashOutModule,
            cash_transfer_module_1.CashTransferModule,
            customer_deposit_module_1.CustomerDepositModule,
            supplier_deposit_module_1.SupplierDepositModule,
            journal_module_1.JournalModule,
            opening_balance_module_1.OpeningBalanceModule,
            account_setting_module_1.AccountSettingModule,
            fiscal_year_module_1.FiscalYearModule,
            journal_entry_module_1.JournalEntryModule,
            report_module_1.ReportModule,
            point_setting_module_1.PointSettingModule,
            point_redemption_module_1.PointRedemptionModule,
            company_module_1.CompanyModule,
            numbering_module_1.NumberingModule,
            expense_category_module_1.ExpenseCategoryModule,
            expense_module_1.ExpenseModule,
            transfer_module_1.TransferModule,
            asset_category_module_1.AssetCategoryModule,
            asset_module_1.AssetModule,
            service_module_1.ServiceModule,
            service_item_module_1.ServiceItemModule,
            price_history_module_1.PriceHistoryModule,
            voucher_module_1.VoucherModule,
            tax_module_1.TaxModule,
            production_module_1.ProductionModule,
            production_item_module_1.ProductionItemModule,
            department_module_1.DepartmentModule,
            position_module_1.PositionModule,
            employee_module_1.EmployeeModule,
            attendance_module_1.AttendanceModule,
            payroll_module_1.PayrollModule,
            loan_module_1.LoanModule,
            loan_installment_module_1.LoanInstallmentModule,
            notification_module_1.NotificationModule,
            payment_method_module_1.PaymentMethodModule,
            cheque_payment_module_1.ChequePaymentModule,
            product_stock_module_1.ProductStockModule,
            stock_in_item_module_1.StockInItemModule,
            stock_out_item_module_1.StockOutItemModule,
            stock_transfer_item_module_1.StockTransferItemModule,
            stock_opname_item_module_1.StockOpnameItemModule,
            sale_item_module_1.SaleItemModule,
            sale_return_item_module_1.SaleReturnItemModule,
            purchase_order_item_module_1.PurchaseOrderItemModule,
            purchase_item_module_1.PurchaseItemModule,
            purchase_return_item_module_1.PurchaseReturnItemModule,
            activity_log_module_1.ActivityLogModule,
            log_module_1.LogModule,
            brand_logo_module_1.BrandLogoModule,
            daily_sales_summary_module_1.DailySalesSummaryModule,
            monthly_sales_summary_module_1.MonthlySalesSummaryModule,
            notification_setting_module_1.NotificationSettingModule,
            product_barcode_module_1.ProductBarcodeModule,
            product_image_module_1.ProductImageModule,
            stock_alert_module_1.StockAlertModule,
            shelf_module_1.ShelfModule,
            shelf_product_module_1.ShelfProductModule,
            product_group_module_1.ProductGroupModule,
            product_type_module_1.ProductTypeModule,
            user_role_module_1.UserRoleModule,
            role_menu_module_1.RoleMenuModule,
            user_menu_module_1.UserMenuModule,
            leave_module_1.LeaveModule,
            leave_balance_module_1.LeaveBalanceModule,
            app_setting_module_1.AppSettingModule,
            stock_balance_module_1.StockBalanceModule,
            stock_module_1.StockModule,
            product_import_module_1.ProductImportModule,
            report_engine_module_1.ReportEngineModule,
            file_storage_module_1.FileStorageModule,
            attendance_mobile_module_1.AttendanceMobileModule,
            import_module_1.ImportModule,
            balance_repair_module_1.BalanceRepairModule,
            accounting_module_2.AccountingModule,
            analytics_module_1.AnalyticsModule,
            assembly_module_1.AssemblyModule,
            asset_module_2.AssetModule,
            attendance_integration_module_1.AttendanceIntegrationModule,
            attendance_module_2.AttendanceModule,
            budgeting_module_1.BudgetingModule,
            cash_flow_module_1.CashFlowModule,
            cash_module_1.CashModule,
            category_brand_module_1.CategoryBrandModule,
            customer_deposit_module_2.CustomerDepositModule,
            customer_module_2.CustomerModule,
            expense_module_2.ExpenseModule,
            hrm_module_1.HRMModule,
            inventory_module_1.InventoryModule,
            journal_module_2.JournalModule,
            leave_module_2.LeaveModule,
            loan_module_2.LoanModule,
            loyalty_module_1.LoyaltyModule,
            member_card_module_1.MemberCardModule,
            notification_gateway_module_1.NotificationGatewayModule,
            notification_module_2.NotificationModule,
            pos_module_1.POSModule,
            payroll_module_2.PayrollModule,
            price_module_1.PriceModule,
            product_price_module_1.ProductPriceModule,
            product_unit_module_1.ProductUnitModule,
            production_material_module_1.ProductionMaterialModule,
            production_module_2.ProductionModule,
            production_recipe_module_1.ProductionRecipeModule,
            production_request_module_1.ProductionRequestModule,
            production_schedule_module_1.ProductionScheduleModule,
            purchase_module_2.PurchaseModule,
            purchase_order_module_2.PurchaseOrderModule,
            purchase_return_module_2.PurchaseReturnModule,
            quality_control_category_module_1.QualityControlCategoryModule,
            quality_control_module_1.QualityControlModule,
            receivable_module_1.ReceivableModule,
            reports_module_1.ReportsModule,
            sale_return_module_2.SaleReturnModule,
            salesperson_module_1.SalesPersonModule,
            service_module_2.ServiceModule,
            service_package_module_1.ServicePackageModule,
            stock_alert_module_2.StockAlertModule,
            stock_mutation_module_1.StockMutationModule,
            stock_opname_module_2.StockOpnameModule,
            stock_transfer_module_2.StockTransferModule,
            supplier_debt_module_1.SupplierDebtModule,
            supplier_module_2.SupplierModule,
            transfer_module_2.TransferModule,
            voucher_module_2.VoucherModule,
            warehouse_module_2.WarehouseModule,
            work_order_module_1.WorkOrderModule,
            year_close_module_1.YearCloseModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useExisting: admin_route_guard_1.AdminRouteGuard,
            },
            {
                provide: core_1.APP_FILTER,
                useClass: all_exceptions_filter_1.AllExceptionsFilter,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: logging_interceptor_1.LoggingInterceptor,
            },
        ],
    })
], AppModule);
