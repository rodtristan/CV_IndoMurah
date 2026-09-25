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
exports.ProductUnitController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const product_unit_service_1 = require("./product-unit-service");
const product_unit_dto_1 = require("./product-unit.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../../common/dto/api-response-dto");
let ProductUnitController = class ProductUnitController {
    constructor(productUnitService) {
        this.productUnitService = productUnitService;
    }
    async setProductUnits(dto) {
        const userId = 'system';
        const data = await this.productUnitService.setProductUnits(dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Product units configured successfully');
    }
    async getProductUnits(productId) {
        const data = await this.productUnitService.getProductUnits(productId);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async listProductUnits(dto) {
        const data = await this.productUnitService.listProductUnits(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async convertUnit(dto) {
        const data = await this.productUnitService.convertUnit(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getProductUnitOptions(productId, type) {
        const data = await this.productUnitService.getProductUnitOptions(productId, type);
        return api_response_dto_1.ApiResponse.ok(data);
    }
};
exports.ProductUnitController = ProductUnitController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Set product unit configurations' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_unit_dto_1.CreateProductUnitDto]),
    __metadata("design:returntype", Promise)
], ProductUnitController.prototype, "setProductUnits", null);
__decorate([
    (0, common_1.Get)('product/:productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get product units by product ID' }),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductUnitController.prototype, "getProductUnits", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List product units' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_unit_dto_1.ProductUnitFilterDto]),
    __metadata("design:returntype", Promise)
], ProductUnitController.prototype, "listProductUnits", null);
__decorate([
    (0, common_1.Post)('convert'),
    (0, swagger_1.ApiOperation)({ summary: 'Convert quantity between units' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_unit_dto_1.ConvertUnitDto]),
    __metadata("design:returntype", Promise)
], ProductUnitController.prototype, "convertUnit", null);
__decorate([
    (0, common_1.Get)('options/:productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get unit options for product (dropdown)' }),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], ProductUnitController.prototype, "getProductUnitOptions", null);
exports.ProductUnitController = ProductUnitController = __decorate([
    (0, swagger_1.ApiTags)('Business Logic - Product Unit'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/product-unit'),
    __metadata("design:paramtypes", [product_unit_service_1.ProductUnitService])
], ProductUnitController);
