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
exports.CategoryBrandController = void 0;
const common_1 = require("@nestjs/common");
const category_brand_service_1 = require("./category-brand-service");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const category_brand_dto_1 = require("./category-brand.dto");
let CategoryBrandController = class CategoryBrandController {
    constructor(categoryBrandService) {
        this.categoryBrandService = categoryBrandService;
    }
    async createCategory(dto) {
        return this.categoryBrandService.createCategory(dto);
    }
    async listCategories(dto) {
        return this.categoryBrandService.listCategories(dto);
    }
    async getCategory(id) {
        return this.categoryBrandService.getCategory(id);
    }
    async updateCategory(id, dto) {
        return this.categoryBrandService.updateCategory(id, dto);
    }
    async deleteCategory(id) {
        return this.categoryBrandService.deleteCategory(id);
    }
    async createBrand(dto) {
        return this.categoryBrandService.createBrand(dto);
    }
    async listBrands(dto) {
        return this.categoryBrandService.listBrands(dto);
    }
    async getBrand(id) {
        return this.categoryBrandService.getBrand(id);
    }
    async updateBrand(id, dto) {
        return this.categoryBrandService.updateBrand(id, dto);
    }
    async deleteBrand(id) {
        return this.categoryBrandService.deleteBrand(id);
    }
    async createUnit(dto) {
        return this.categoryBrandService.createUnit(dto);
    }
    async listUnits() {
        return this.categoryBrandService.listUnits();
    }
    async updateUnit(id, dto) {
        return this.categoryBrandService.updateUnit(id, dto);
    }
    async createProductGroup(dto) {
        return this.categoryBrandService.createProductGroup(dto);
    }
    async listProductGroups() {
        return this.categoryBrandService.listProductGroups();
    }
    async updateProductGroup(id, dto) {
        return this.categoryBrandService.updateProductGroup(id, dto);
    }
    async getMasterDataSummary() {
        return this.categoryBrandService.getMasterDataSummary();
    }
};
exports.CategoryBrandController = CategoryBrandController;
__decorate([
    (0, common_1.Post)('categories'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [category_brand_dto_1.CreateCategoryDto]),
    __metadata("design:returntype", Promise)
], CategoryBrandController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Get)('categories'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [category_brand_dto_1.CategoryFilterDto]),
    __metadata("design:returntype", Promise)
], CategoryBrandController.prototype, "listCategories", null);
__decorate([
    (0, common_1.Get)('categories/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CategoryBrandController.prototype, "getCategory", null);
__decorate([
    (0, common_1.Put)('categories/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, category_brand_dto_1.UpdateCategoryDto]),
    __metadata("design:returntype", Promise)
], CategoryBrandController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Delete)('categories/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CategoryBrandController.prototype, "deleteCategory", null);
__decorate([
    (0, common_1.Post)('brands'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [category_brand_dto_1.CreateBrandDto]),
    __metadata("design:returntype", Promise)
], CategoryBrandController.prototype, "createBrand", null);
__decorate([
    (0, common_1.Get)('brands'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [category_brand_dto_1.BrandFilterDto]),
    __metadata("design:returntype", Promise)
], CategoryBrandController.prototype, "listBrands", null);
__decorate([
    (0, common_1.Get)('brands/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CategoryBrandController.prototype, "getBrand", null);
__decorate([
    (0, common_1.Put)('brands/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, category_brand_dto_1.UpdateBrandDto]),
    __metadata("design:returntype", Promise)
], CategoryBrandController.prototype, "updateBrand", null);
__decorate([
    (0, common_1.Delete)('brands/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CategoryBrandController.prototype, "deleteBrand", null);
__decorate([
    (0, common_1.Post)('units'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [category_brand_dto_1.CreateUnitDto]),
    __metadata("design:returntype", Promise)
], CategoryBrandController.prototype, "createUnit", null);
__decorate([
    (0, common_1.Get)('units'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CategoryBrandController.prototype, "listUnits", null);
__decorate([
    (0, common_1.Put)('units/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, category_brand_dto_1.UpdateUnitDto]),
    __metadata("design:returntype", Promise)
], CategoryBrandController.prototype, "updateUnit", null);
__decorate([
    (0, common_1.Post)('product-groups'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [category_brand_dto_1.CreateProductGroupDto]),
    __metadata("design:returntype", Promise)
], CategoryBrandController.prototype, "createProductGroup", null);
__decorate([
    (0, common_1.Get)('product-groups'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CategoryBrandController.prototype, "listProductGroups", null);
__decorate([
    (0, common_1.Put)('product-groups/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, category_brand_dto_1.UpdateProductGroupDto]),
    __metadata("design:returntype", Promise)
], CategoryBrandController.prototype, "updateProductGroup", null);
__decorate([
    (0, common_1.Get)('summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CategoryBrandController.prototype, "getMasterDataSummary", null);
exports.CategoryBrandController = CategoryBrandController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/master-data'),
    __metadata("design:paramtypes", [category_brand_service_1.CategoryBrandService])
], CategoryBrandController);
