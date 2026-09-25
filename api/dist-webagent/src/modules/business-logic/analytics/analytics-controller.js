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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const analytics_service_1 = require("./analytics-service");
const analytics_dto_1 = require("./analytics.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../../common/dto/api-response-dto");
let AnalyticsController = class AnalyticsController {
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async getDashboardSummary(dto) {
        const data = await this.analyticsService.getDashboardSummary(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getSalesReport(dto) {
        const data = await this.analyticsService.getSalesReport(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getSalesByCategory(dto) {
        const data = await this.analyticsService.getSalesByCategory(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getProfitReport(dto) {
        const data = await this.analyticsService.getProfitReport(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getTopProducts(dto) {
        const data = await this.analyticsService.getTopProducts(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getTopCustomers(dto) {
        const data = await this.analyticsService.getTopCustomers(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getInventoryReport(dto) {
        const data = await this.analyticsService.getInventoryReport(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getCashFlowReport(dto) {
        const data = await this.analyticsService.getCashFlowReport(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getTaxReport(dto) {
        const data = await this.analyticsService.getTaxReport(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getSalesTrend(dto) {
        const data = await this.analyticsService.getSalesTrend(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Get comprehensive dashboard summary' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analytics_dto_1.DashboardSummaryDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getDashboardSummary", null);
__decorate([
    (0, common_1.Get)('sales-report'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate detailed sales report' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analytics_dto_1.SalesReportDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getSalesReport", null);
__decorate([
    (0, common_1.Get)('sales-by-category'),
    (0, swagger_1.ApiOperation)({ summary: 'Get sales breakdown by category' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analytics_dto_1.SalesReportDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getSalesByCategory", null);
__decorate([
    (0, common_1.Get)('profit-report'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate profit/loss report' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analytics_dto_1.ProfitReportDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getProfitReport", null);
__decorate([
    (0, common_1.Get)('top-products'),
    (0, swagger_1.ApiOperation)({ summary: 'Get top selling products' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analytics_dto_1.TopProductsDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getTopProducts", null);
__decorate([
    (0, common_1.Get)('top-customers'),
    (0, swagger_1.ApiOperation)({ summary: 'Get top customers by revenue' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analytics_dto_1.TopCustomersDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getTopCustomers", null);
__decorate([
    (0, common_1.Get)('inventory-report'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate inventory/stock report' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analytics_dto_1.InventoryReportDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getInventoryReport", null);
__decorate([
    (0, common_1.Get)('cash-flow'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate cash flow report' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analytics_dto_1.CashFlowReportDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getCashFlowReport", null);
__decorate([
    (0, common_1.Get)('tax-report'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate tax report' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analytics_dto_1.TaxReportDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getTaxReport", null);
__decorate([
    (0, common_1.Get)('sales-trend'),
    (0, swagger_1.ApiOperation)({ summary: 'Get sales trend analysis with comparison' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analytics_dto_1.SalesTrendDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getSalesTrend", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, swagger_1.ApiTags)('Analytics - Laporan & Analisis'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/analytics'),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
