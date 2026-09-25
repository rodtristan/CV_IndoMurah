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
exports.ReportController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const report_service_1 = require("./report.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../common/dto/api-response-dto");
let ReportController = class ReportController {
    constructor(reportService) {
        this.reportService = reportService;
    }
    async salesReport(startDate, endDate, warehouseId, customerId) {
        const data = await this.reportService.salesReport({ startDate, endDate, warehouseId: warehouseId ? Number(warehouseId) : undefined, customerId: customerId ? Number(customerId) : undefined });
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async purchaseReport(startDate, endDate, warehouseId, supplierId) {
        const data = await this.reportService.purchaseReport({ startDate, endDate, warehouseId: warehouseId ? Number(warehouseId) : undefined, supplierId: supplierId ? Number(supplierId) : undefined });
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async inventoryReport(warehouseId, categoryId) {
        const data = await this.reportService.inventoryReport({ warehouseId: warehouseId ? Number(warehouseId) : undefined, categoryId: categoryId ? Number(categoryId) : undefined });
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async cashReport(startDate, endDate) {
        const data = await this.reportService.cashReport({ startDate, endDate });
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async profitLossReport(startDate, endDate) {
        const data = await this.reportService.profitLossReport({ startDate, endDate });
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async debtReport() {
        const data = await this.reportService.debtReport();
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async receivableReport() {
        const data = await this.reportService.receivableReport();
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async salesSummaryReport(startDate, endDate) {
        const data = await this.reportService.salesSummaryReport({ startDate, endDate });
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async stockOpnameReport() {
        const data = await this.reportService.stockOpnameReport();
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async stockMutationReport(productId, warehouseId, startDate, endDate) {
        if (!productId || !Number.isFinite(Number(productId))) {
            throw new common_1.BadRequestException('productId is required');
        }
        const data = await this.reportService.stockMutationReport({
            productId: Number(productId),
            warehouseId: warehouseId ? Number(warehouseId) : undefined,
            startDate,
            endDate,
        });
        return api_response_dto_1.ApiResponse.ok(data);
    }
};
exports.ReportController = ReportController;
__decorate([
    (0, common_1.Get)('sales'),
    (0, swagger_1.ApiOperation)({ summary: 'Sales Report' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'warehouseId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'customerId', required: false }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('warehouseId')),
    __param(3, (0, common_1.Query)('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "salesReport", null);
__decorate([
    (0, common_1.Get)('purchase'),
    (0, swagger_1.ApiOperation)({ summary: 'Purchase Report' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('warehouseId')),
    __param(3, (0, common_1.Query)('supplierId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "purchaseReport", null);
__decorate([
    (0, common_1.Get)('inventory'),
    (0, swagger_1.ApiOperation)({ summary: 'Inventory Report' }),
    __param(0, (0, common_1.Query)('warehouseId')),
    __param(1, (0, common_1.Query)('categoryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "inventoryReport", null);
__decorate([
    (0, common_1.Get)('cash'),
    (0, swagger_1.ApiOperation)({ summary: 'Cash Report' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "cashReport", null);
__decorate([
    (0, common_1.Get)('profit-loss'),
    (0, swagger_1.ApiOperation)({ summary: 'Profit & Loss Report' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "profitLossReport", null);
__decorate([
    (0, common_1.Get)('debt'),
    (0, swagger_1.ApiOperation)({ summary: 'Debt Report (Unpaid Purchases)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "debtReport", null);
__decorate([
    (0, common_1.Get)('receivable'),
    (0, swagger_1.ApiOperation)({ summary: 'Receivable Report (Unpaid Sales)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "receivableReport", null);
__decorate([
    (0, common_1.Get)('sales/summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Sales vs Purchases vs Profit chart (per day)' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "salesSummaryReport", null);
__decorate([
    (0, common_1.Get)('stock-opname'),
    (0, swagger_1.ApiOperation)({ summary: 'Stock Opname Report' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "stockOpnameReport", null);
__decorate([
    (0, common_1.Get)('stock-mutation'),
    (0, swagger_1.ApiOperation)({ summary: 'Stock Mutation Report (Kartu Stok / Mutasi Stok)' }),
    (0, swagger_1.ApiQuery)({ name: 'productId', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'warehouseId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false }),
    __param(0, (0, common_1.Query)('productId')),
    __param(1, (0, common_1.Query)('warehouseId')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "stockMutationReport", null);
exports.ReportController = ReportController = __decorate([
    (0, swagger_1.ApiTags)('Reports'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('reports'),
    __metadata("design:paramtypes", [report_service_1.ReportService])
], ReportController);
