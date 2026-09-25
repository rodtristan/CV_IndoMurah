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
exports.ProductionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const production_service_1 = require("./production-service");
const production_dto_1 = require("./production.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../../common/dto/api-response-dto");
let ProductionController = class ProductionController {
    constructor(productionService) {
        this.productionService = productionService;
    }
    async createProduction(dto) {
        const userId = 'system';
        const data = await this.productionService.createProduction(dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Production created successfully');
    }
    async listProductions(dto) {
        const data = await this.productionService.listProductions(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getProduction(id) {
        const data = await this.productionService.getProduction(id);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getProductionCostReport(startDate, endDate, warehouseId) {
        const data = await this.productionService.getProductionCostReport(startDate, endDate, warehouseId);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getBOM(productId) {
        const data = await this.productionService.getBOM(productId);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async calculateProductionCost(productId, quantity, warehouseId) {
        const data = await this.productionService.calculateProductionCost(productId, quantity, warehouseId);
        return api_response_dto_1.ApiResponse.ok(data);
    }
};
exports.ProductionController = ProductionController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new production' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [production_dto_1.CreateProductionDto]),
    __metadata("design:returntype", Promise)
], ProductionController.prototype, "createProduction", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List productions' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [production_dto_1.ProductionFilterDto]),
    __metadata("design:returntype", Promise)
], ProductionController.prototype, "listProductions", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get production by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductionController.prototype, "getProduction", null);
__decorate([
    (0, common_1.Get)('reports/cost'),
    (0, swagger_1.ApiOperation)({ summary: 'Get production cost report' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('warehouseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], ProductionController.prototype, "getProductionCostReport", null);
__decorate([
    (0, common_1.Get)('bom/:productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Bill of Materials for product' }),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductionController.prototype, "getBOM", null);
__decorate([
    (0, common_1.Get)('bom/:productId/calculate'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate production cost from BOM' }),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Query)('quantity')),
    __param(2, (0, common_1.Query)('warehouseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number]),
    __metadata("design:returntype", Promise)
], ProductionController.prototype, "calculateProductionCost", null);
exports.ProductionController = ProductionController = __decorate([
    (0, swagger_1.ApiTags)('Production - Produksi'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/production'),
    __metadata("design:paramtypes", [production_service_1.ProductionService])
], ProductionController);
