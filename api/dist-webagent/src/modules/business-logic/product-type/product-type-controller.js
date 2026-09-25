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
exports.ProductTypeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const product_type_service_1 = require("./product-type-service");
const product_type_dto_1 = require("./product-type.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../../common/dto/api-response-dto");
let ProductTypeController = class ProductTypeController {
    constructor(productTypeService) {
        this.productTypeService = productTypeService;
    }
    async createProductType(dto) {
        const userId = 'system';
        const data = await this.productTypeService.createProductType(dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Product type created successfully');
    }
    async updateProductType(id, dto) {
        const userId = 'system';
        const data = await this.productTypeService.updateProductType(id, dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Product type updated successfully');
    }
    async getProductType(id) {
        const data = await this.productTypeService.getProductType(id);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async listProductTypes(dto) {
        const data = await this.productTypeService.listProductTypes(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getProductTypeStats() {
        const data = await this.productTypeService.getProductTypeStats();
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async deleteProductType(id) {
        const data = await this.productTypeService.deleteProductType(id);
        return api_response_dto_1.ApiResponse.ok(data, 'Product type deleted successfully');
    }
};
exports.ProductTypeController = ProductTypeController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new product type' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_type_dto_1.CreateProductTypeDto]),
    __metadata("design:returntype", Promise)
], ProductTypeController.prototype, "createProductType", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update product type' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, product_type_dto_1.UpDateProductTypeDto]),
    __metadata("design:returntype", Promise)
], ProductTypeController.prototype, "updateProductType", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get product type by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductTypeController.prototype, "getProductType", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List product types' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_type_dto_1.ProductTypeFilterDto]),
    __metadata("design:returntype", Promise)
], ProductTypeController.prototype, "listProductTypes", null);
__decorate([
    (0, common_1.Get)('stats/overview'),
    (0, swagger_1.ApiOperation)({ summary: 'Get product type statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductTypeController.prototype, "getProductTypeStats", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete product type' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductTypeController.prototype, "deleteProductType", null);
exports.ProductTypeController = ProductTypeController = __decorate([
    (0, swagger_1.ApiTags)('Business Logic - Product Type'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/product-type'),
    __metadata("design:paramtypes", [product_type_service_1.ProductTypeService])
], ProductTypeController);
