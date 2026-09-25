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
exports.ProductionMaterialController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const production_material_service_1 = require("./production-material-service");
const production_material_dto_1 = require("./production-material.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../../common/dto/api-response-dto");
let ProductionMaterialController = class ProductionMaterialController {
    constructor(productionMaterialService) {
        this.productionMaterialService = productionMaterialService;
    }
    async createCategory(dto) {
        const data = await this.productionMaterialService.createProductionCategory(dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Category created successfully');
    }
    async listCategories(includeInactive) {
        const data = await this.productionMaterialService.listProductionCategories(includeInactive === 'true');
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getCategory(id) {
        const data = await this.productionMaterialService.getProductionCategory(id);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async updateCategory(id, dto) {
        const data = await this.productionMaterialService.updateProductionCategory(id, dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Category updated successfully');
    }
    async deleteCategory(id) {
        const data = await this.productionMaterialService.deleteProductionCategory(id);
        return api_response_dto_1.ApiResponse.ok(data, 'Category deleted successfully');
    }
    async createMaterial(dto) {
        const userId = 'system';
        const data = await this.productionMaterialService.createProductionMaterial(dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Material created successfully');
    }
    async listMaterials(dto) {
        const data = await this.productionMaterialService.listProductionMaterials(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getLowStockMaterials() {
        const data = await this.productionMaterialService.getLowStockMaterials();
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getMaterial(id) {
        const data = await this.productionMaterialService.getProductionMaterial(id);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async updateMaterial(id, dto) {
        const userId = 'system';
        const data = await this.productionMaterialService.updateProductionMaterial(id, dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Material updated successfully');
    }
    async deleteMaterial(id) {
        const data = await this.productionMaterialService.deleteProductionMaterial(id);
        return api_response_dto_1.ApiResponse.ok(data, 'Material deleted successfully');
    }
};
exports.ProductionMaterialController = ProductionMaterialController;
__decorate([
    (0, common_1.Post)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'Create production category' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [production_material_dto_1.CreateProductionCategoryDto]),
    __metadata("design:returntype", Promise)
], ProductionMaterialController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'List production categories' }),
    __param(0, (0, common_1.Query)('includeInactive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductionMaterialController.prototype, "listCategories", null);
__decorate([
    (0, common_1.Get)('categories/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get production category by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductionMaterialController.prototype, "getCategory", null);
__decorate([
    (0, common_1.Patch)('categories/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update production category' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, production_material_dto_1.UpdateProductionCategoryDto]),
    __metadata("design:returntype", Promise)
], ProductionMaterialController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Delete)('categories/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete production category' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductionMaterialController.prototype, "deleteCategory", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create production material' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [production_material_dto_1.CreateProductionMaterialDto]),
    __metadata("design:returntype", Promise)
], ProductionMaterialController.prototype, "createMaterial", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List production materials' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [production_material_dto_1.ProductionMaterialFilterDto]),
    __metadata("design:returntype", Promise)
], ProductionMaterialController.prototype, "listMaterials", null);
__decorate([
    (0, common_1.Get)('low-stock'),
    (0, swagger_1.ApiOperation)({ summary: 'Get low stock materials' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductionMaterialController.prototype, "getLowStockMaterials", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get production material by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductionMaterialController.prototype, "getMaterial", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update production material' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, production_material_dto_1.UpdateProductionMaterialDto]),
    __metadata("design:returntype", Promise)
], ProductionMaterialController.prototype, "updateMaterial", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete production material' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductionMaterialController.prototype, "deleteMaterial", null);
exports.ProductionMaterialController = ProductionMaterialController = __decorate([
    (0, swagger_1.ApiTags)('Production Material - Bahan Produksi'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/production-material'),
    __metadata("design:paramtypes", [production_material_service_1.ProductionMaterialService])
], ProductionMaterialController);
