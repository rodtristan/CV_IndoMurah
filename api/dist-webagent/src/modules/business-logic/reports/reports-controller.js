"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const reports_service_1 = require("./reports-service");
const reports_service_extensions_1 = require("./reports-service-extensions");
const reports_dto_1 = require("./reports.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../../common/dto/api-response-dto");
let ReportsController = class ReportsController {
    constructor(reportsService, reportsExtensionsService) {
        this.reportsService = reportsService;
        this.reportsExtensionsService = reportsExtensionsService;
    }
    async getDashboardSummary(dto) {
        const data = await this.reportsService.getDashboardSummary(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getSalesReport(dto) {
        const data = await this.reportsService.getSalesReport(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getTopProductsReport(dto) {
        const data = await this.reportsService.getTopProductsReport(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getCustomerRevenueReport(dto) {
        const data = await this.reportsService.getCustomerRevenueReport(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getInventoryReport(dto) {
        const data = await this.reportsService.getInventoryReport(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getStockMovementReport(dto) {
        const data = await this.reportsService.getStockMovementReport(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getReceivableAgingReport(dto) {
        const data = await this.reportsService.getReceivableAgingReport(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getPayableAgingReport(dto) {
        const data = await this.reportsService.getPayableAgingReport(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getCashFlowReport(dto) {
        const data = await this.reportsService.getCashFlowReport(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getProfitLossReport(dto) {
        const data = await this.reportsService.getProfitLossReport(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getExpenseReport(dto) {
        const data = await this.reportsService.getExpenseReport(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getAttendanceSummaryReport(dto) {
        const data = await this.reportsService.getAttendanceSummaryReport(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getPayrollSummaryReport(dto) {
        const data = await this.reportsExtensionsService.getPayrollSummary(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getSupplierPurchaseReport(dto) {
        const data = await this.reportsService.getSupplierPurchaseReport(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getDepositBalanceReport(dto) {
        const data = await this.reportsService.getDepositBalanceReport(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Get dashboard summary' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reports_dto_1.DashboardSummaryDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getDashboardSummary", null);
__decorate([
    (0, common_1.Get)('sales'),
    (0, swagger_1.ApiOperation)({ summary: 'Get sales report' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reports_dto_1.SalesReportDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getSalesReport", null);
__decorate([
    (0, common_1.Get)('top-products'),
    (0, swagger_1.ApiOperation)({ summary: 'Get top products report' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reports_dto_1.TopProductsReportDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getTopProductsReport", null);
__decorate([
    (0, common_1.Get)('customer-revenue'),
    (0, swagger_1.ApiOperation)({ summary: 'Get customer revenue report' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reports_dto_1.CustomerRevenueReportDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getCustomerRevenueReport", null);
__decorate([
    (0, common_1.Get)('inventory'),
    (0, swagger_1.ApiOperation)({ summary: 'Get inventory report' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reports_dto_1.InventoryReportDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getInventoryReport", null);
__decorate([
    (0, common_1.Get)('stock-movement'),
    (0, swagger_1.ApiOperation)({ summary: 'Get stock movement report' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reports_dto_1.StockMovementReportDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getStockMovementReport", null);
__decorate([
    (0, common_1.Get)('receivable-aging'),
    (0, swagger_1.ApiOperation)({ summary: 'Get receivable aging report' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reports_dto_1.ReceivableAgingReportDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getReceivableAgingReport", null);
__decorate([
    (0, common_1.Get)('payable-aging'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payable aging report' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reports_dto_1.PayableAgingReportDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getPayableAgingReport", null);
__decorate([
    (0, common_1.Get)('cash-flow'),
    (0, swagger_1.ApiOperation)({ summary: 'Get cash flow report' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reports_dto_1.CashFlowReportDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getCashFlowReport", null);
__decorate([
    (0, common_1.Get)('profit-loss'),
    (0, swagger_1.ApiOperation)({ summary: 'Get profit and loss report' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reports_dto_1.ProfitLossReportDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getProfitLossReport", null);
__decorate([
    (0, common_1.Get)('expense'),
    (0, swagger_1.ApiOperation)({ summary: 'Get expense report' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reports_dto_1.ExpenseReportDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getExpenseReport", null);
__decorate([
    (0, common_1.Get)('attendance-summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get attendance summary report' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reports_dto_1.AttendanceSummaryReportDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getAttendanceSummaryReport", null);
__decorate([
    (0, common_1.Get)('payroll-summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payroll summary report' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reports_dto_1.PayrollSummaryReportDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getPayrollSummaryReport", null);
__decorate([
    (0, common_1.Get)('supplier-purchase'),
    (0, swagger_1.ApiOperation)({ summary: 'Get supplier purchase report' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reports_dto_1.SupplierPurchaseReportDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getSupplierPurchaseReport", null);
__decorate([
    (0, common_1.Get)('deposit-balance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get deposit balance report (customer & supplier deposits)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reports_dto_1.DepositBalanceReportDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getDepositBalanceReport", null);
exports.ReportsController = ReportsController = __decorate([
    (0, swagger_1.ApiTags)('Reports - Laporan'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/reports'),
    __metadata("design:paramtypes", [reports_service_1.ReportsService,
        reports_service_extensions_1.ReportsServiceExtensions])
], ReportsController);
