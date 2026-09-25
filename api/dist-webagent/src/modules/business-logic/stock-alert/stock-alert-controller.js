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
exports.StockAlertController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const stock_alert_service_1 = require("./stock-alert-service");
const stock_alert_dto_1 = require("./stock-alert.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../../common/dto/api-response-dto");
let StockAlertController = class StockAlertController {
    constructor(stockAlertService) {
        this.stockAlertService = stockAlertService;
    }
    async getStockAlerts(dto) {
        const data = await this.stockAlertService.getStockAlerts(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getStockAlertSummary(warehouseId) {
        const data = await this.stockAlertService.getStockAlertSummary(warehouseId ? parseInt(warehouseId) : undefined);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async markAsRead(alertId) {
        const data = await this.stockAlertService.markAsRead(alertId);
        return api_response_dto_1.ApiResponse.ok(data, 'Alert marked as read');
    }
    async markMultipleAsRead(dto) {
        const data = await this.stockAlertService.markMultipleAsRead(dto.AlertIds);
        return api_response_dto_1.ApiResponse.ok(data, `${dto.AlertIds.length} alerts marked as read`);
    }
    async resolveAlert(alertId, dto) {
        const data = await this.stockAlertService.resolveAlert(alertId, dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Alert resolved');
    }
    async bulkResolveAlerts(dto) {
        const data = await this.stockAlertService.bulkResolveAlerts(dto);
        return api_response_dto_1.ApiResponse.ok(data, `${dto.AlertIds.length} alerts resolved`);
    }
    async getStockLevelReport(dto) {
        const data = await this.stockAlertService.getStockLevelReport(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getReorderSuggestion(productId) {
        const data = await this.stockAlertService.createReOrderSuggestion(productId);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getProductsNeedingReorder(warehouseId) {
        const data = await this.stockAlertService.getProductsNeedingReOrder(warehouseId ? parseInt(warehouseId) : undefined);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async createPurchaseOrder(dto) {
        const data = await this.stockAlertService.generateReOrderPurchaseOrder(dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Purchase order created');
    }
    async checkAndCreateAlerts(warehouseId) {
        const data = await this.stockAlertService.CheckAndCreateAlerts(warehouseId ? parseInt(warehouseId) : undefined);
        return api_response_dto_1.ApiResponse.ok(data);
    }
};
exports.StockAlertController = StockAlertController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all stock alerts with filters' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [stock_alert_dto_1.StockAlertFilterDto]),
    __metadata("design:returntype", Promise)
], StockAlertController.prototype, "getStockAlerts", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get stock alert summary for dashboard' }),
    __param(0, (0, common_1.Query)('warehouseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StockAlertController.prototype, "getStockAlertSummary", null);
__decorate([
    (0, common_1.Put)(':alertId/read'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark alert as read' }),
    __param(0, (0, common_1.Param)('alertId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StockAlertController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Put)('read-multiple'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark multiple alerts as read' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StockAlertController.prototype, "markMultipleAsRead", null);
__decorate([
    (0, common_1.Put)(':alertId/resolve'),
    (0, swagger_1.ApiOperation)({ summary: 'Resolve an alert' }),
    __param(0, (0, common_1.Param)('alertId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, stock_alert_dto_1.ResolveStockAlertDto]),
    __metadata("design:returntype", Promise)
], StockAlertController.prototype, "resolveAlert", null);
__decorate([
    (0, common_1.Put)('resolve-multiple'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk resolve alerts' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [stock_alert_dto_1.BulkResolveAlertDto]),
    __metadata("design:returntype", Promise)
], StockAlertController.prototype, "bulkResolveAlerts", null);
__decorate([
    (0, common_1.Get)('stock-level-report'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate stock level report' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [stock_alert_dto_1.StockLevelReportDto]),
    __metadata("design:returntype", Promise)
], StockAlertController.prototype, "getStockLevelReport", null);
__decorate([
    (0, common_1.Get)('reorder-suggestion/:productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get reorder suggestion for a product' }),
    __param(0, (0, common_1.Param)('productId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StockAlertController.prototype, "getReorderSuggestion", null);
__decorate([
    (0, common_1.Get)('products-needing-reorder'),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of products needing reorder' }),
    __param(0, (0, common_1.Query)('warehouseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StockAlertController.prototype, "getProductsNeedingReorder", null);
__decorate([
    (0, common_1.Post)('create-purchase-order'),
    (0, swagger_1.ApiOperation)({ summary: 'Create purchase order from reorder suggestion' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [stock_alert_dto_1.ReorderStockDto]),
    __metadata("design:returntype", Promise)
], StockAlertController.prototype, "createPurchaseOrder", null);
__decorate([
    (0, common_1.Post)('check-stock'),
    (0, swagger_1.ApiOperation)({ summary: 'Check all products and create alerts (for scheduler)' }),
    __param(0, (0, common_1.Query)('warehouseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StockAlertController.prototype, "checkAndCreateAlerts", null);
exports.StockAlertController = StockAlertController = __decorate([
    (0, swagger_1.ApiTags)('Stock Alert - Alert Stok'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/stock-alert'),
    __metadata("design:paramtypes", [stock_alert_service_1.StockAlertService])
], StockAlertController);
