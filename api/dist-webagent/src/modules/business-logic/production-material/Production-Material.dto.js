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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductionMaterialFilterDto = exports.UpdateProductionMaterialDto = exports.CreateProductionMaterialDto = exports.UpdateProductionCategoryDto = exports.CreateProductionCategoryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateProductionCategoryDto {
}
exports.CreateProductionCategoryDto = CreateProductionCategoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Category Code' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductionCategoryDto.prototype, "Code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Category Name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductionCategoryDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductionCategoryDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is for raw materials' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateProductionCategoryDto.prototype, "isRawMaterial", void 0);
class UpdateProductionCategoryDto {
}
exports.UpdateProductionCategoryDto = UpdateProductionCategoryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category Name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProductionCategoryDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProductionCategoryDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateProductionCategoryDto.prototype, "IsActive", void 0);
class CreateProductionMaterialDto {
}
exports.CreateProductionMaterialDto = CreateProductionMaterialDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Material Name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductionMaterialDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Production category ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateProductionMaterialDto.prototype, "CategoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unit ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateProductionMaterialDto.prototype, "UnitId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Purchase price' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateProductionMaterialDto.prototype, "PurchasePrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Minimum stock level' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateProductionMaterialDto.prototype, "MinimumStock", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductionMaterialDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateProductionMaterialDto.prototype, "IsActive", void 0);
class UpdateProductionMaterialDto {
}
exports.UpdateProductionMaterialDto = UpdateProductionMaterialDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Material Name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProductionMaterialDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateProductionMaterialDto.prototype, "CategoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Unit ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateProductionMaterialDto.prototype, "UnitId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Purchase price' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateProductionMaterialDto.prototype, "PurchasePrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Minimum stock' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateProductionMaterialDto.prototype, "MinimumStock", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProductionMaterialDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateProductionMaterialDto.prototype, "IsActive", void 0);
class ProductionMaterialFilterDto {
}
exports.ProductionMaterialFilterDto = ProductionMaterialFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProductionMaterialFilterDto.prototype, "CategoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search by Name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductionMaterialFilterDto.prototype, "Search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Raw materials only' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ProductionMaterialFilterDto.prototype, "isRawMaterial", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Active only' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ProductionMaterialFilterDto.prototype, "IsActive", void 0);
