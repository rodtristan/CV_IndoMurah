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
exports.ProductPriceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const product_price_service_1 = require("./product-price-service");
const product_price_dto_1 = require("./product-price.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../../common/dto/api-response-dto");
let ProductPriceController = class ProductPriceController {
    constructor(productPriceService) {
        this.productPriceService = productPriceService;
    }
    async setPrice(dto) {
        const userId = 'system';
        const data = await this.productPriceService.setProductPrice(dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Price set successfully');
    }
    async getProductPrices(productId) {
        const data = await this.productPriceService.getProductPrices(productId);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getApplicablePrice(dto) {
        const data = await this.productPriceService.getApplicablePrice(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async listPrices(dto) {
        const data = await this.productPriceService.listPrices(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async deletePrice(id) {
        const data = await this.productPriceService.deletePrice(id);
        return api_response_dto_1.ApiResponse.ok(data, 'Price deleted successfully');
    }
};
exports.ProductPriceController = ProductPriceController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Set product price' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_price_dto_1.CreateProductPriceDto]),
    __metadata("design:returntype", Promise)
], ProductPriceController.prototype, "setPrice", null);
__decorate([
    (0, common_1.Get)('product/:productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all prices for a product' }),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductPriceController.prototype, "getProductPrices", null);
__decorate([
    (0, common_1.Get)('applicable'),
    (0, swagger_1.ApiOperation)({ summary: 'Get applicable price for a product' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_price_dto_1.GetPriceDto]),
    __metadata("design:returntype", Promise)
], ProductPriceController.prototype, "getApplicablePrice", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List prices with filters' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_price_dto_1.ProductPriceFilterDto]),
    __metadata("design:returntype", Promise)
], ProductPriceController.prototype, "listPrices", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete price' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductPriceController.prototype, "deletePrice", null);
exports.ProductPriceController = ProductPriceController = __decorate([
    (0, swagger_1.ApiTags)('Business Logic - Product Price'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/product-price'),
    __metadata("design:paramtypes", [product_price_service_1.ProductPriceService])
], ProductPriceController);
