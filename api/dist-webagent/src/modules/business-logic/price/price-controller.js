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
exports.PriceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const price_service_1 = require("./price-service");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const price_dto_1 = require("./price.dto");
let PriceController = class PriceController {
    constructor(priceService) {
        this.priceService = priceService;
    }
    async updateSellingPrice(productId, dto) {
        return this.priceService.updateSellingPrice(productId, dto, 'system');
    }
    async updatePurchasePrice(productId, dto) {
        return this.priceService.updatePurchasePrice(productId, dto, 'system');
    }
    async bulkUpdatePrices(dto) {
        return this.priceService.bulkUpdatePrices(dto, 'system');
    }
    async adjustPricesByPercent(dto) {
        return this.priceService.adjustPricesByPercent({
            CategoryId: dto.CategoryId,
            ProductIds: dto.ProductIds,
            adjustmentPercent: dto.AdjustmentPercent,
            adjustmentType: dto.AdjustmentType,
            Reason: dto.Reason,
        }, 'system');
    }
    async getPriceHistory(dto) {
        return this.priceService.getPriceHistory(dto);
    }
    async getProductPriceHistory(productId) {
        return this.priceService.getProductPriceHistory(productId);
    }
    async getPriceChangeReport(dto) {
        return this.priceService.getPriceChangeReport(dto);
    }
    async getPriceAnalysis(dto) {
        return this.priceService.getPriceAnalysis(dto);
    }
};
exports.PriceController = PriceController;
__decorate([
    (0, common_1.Put)(':productId/selling'),
    (0, swagger_1.ApiOperation)({ summary: 'Update product selling price' }),
    __param(0, (0, common_1.Param)('productId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, price_dto_1.UpdateProductPriceDto]),
    __metadata("design:returntype", Promise)
], PriceController.prototype, "updateSellingPrice", null);
__decorate([
    (0, common_1.Put)(':productId/purchase'),
    (0, swagger_1.ApiOperation)({ summary: 'Update product purchase price' }),
    __param(0, (0, common_1.Param)('productId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PriceController.prototype, "updatePurchasePrice", null);
__decorate([
    (0, common_1.Post)('bulk-update'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk update prices' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [price_dto_1.BulkUpdatePriceDto]),
    __metadata("design:returntype", Promise)
], PriceController.prototype, "bulkUpdatePrices", null);
__decorate([
    (0, common_1.Post)('adjust-by-percent'),
    (0, swagger_1.ApiOperation)({ summary: 'Adjust prices by percentage' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PriceController.prototype, "adjustPricesByPercent", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get price history' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [price_dto_1.PriceHistoryFilterDto]),
    __metadata("design:returntype", Promise)
], PriceController.prototype, "getPriceHistory", null);
__decorate([
    (0, common_1.Get)('history/:productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get product price history' }),
    __param(0, (0, common_1.Param)('productId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PriceController.prototype, "getProductPriceHistory", null);
__decorate([
    (0, common_1.Get)('reports/change'),
    (0, swagger_1.ApiOperation)({ summary: 'Get price change report' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [price_dto_1.PriceChangeReportDto]),
    __metadata("design:returntype", Promise)
], PriceController.prototype, "getPriceChangeReport", null);
__decorate([
    (0, common_1.Get)('reports/analysis'),
    (0, swagger_1.ApiOperation)({ summary: 'Get price analysis' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [price_dto_1.PriceAnalysisDto]),
    __metadata("design:returntype", Promise)
], PriceController.prototype, "getPriceAnalysis", null);
exports.PriceController = PriceController = __decorate([
    (0, swagger_1.ApiTags)('Business Logic - Price Management'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/price'),
    __metadata("design:paramtypes", [price_service_1.PriceService])
], PriceController);
