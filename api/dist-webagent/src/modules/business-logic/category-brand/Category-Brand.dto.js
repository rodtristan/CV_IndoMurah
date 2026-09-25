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
exports.UpdateProductGroupDto = exports.CreateProductGroupDto = exports.UpdateUnitDto = exports.CreateUnitDto = exports.BrandFilterDto = exports.UpdateBrandDto = exports.CreateBrandDto = exports.CategoryFilterDto = exports.UpdateCategoryDto = exports.CreateCategoryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateCategoryDto {
}
exports.CreateCategoryDto = CreateCategoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Category Code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "Code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Category Name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Icon Name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "Icon", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Image URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "Image", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "Description", void 0);
class UpdateCategoryDto {
}
exports.UpdateCategoryDto = UpdateCategoryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category Name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCategoryDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Icon Name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCategoryDto.prototype, "Icon", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Image URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCategoryDto.prototype, "Image", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCategoryDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateCategoryDto.prototype, "IsActive", void 0);
class CategoryFilterDto {
}
exports.CategoryFilterDto = CategoryFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CategoryFilterDto.prototype, "Search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Include inactive' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CategoryFilterDto.prototype, "IncludeInactive", void 0);
class CreateBrandDto {
}
exports.CreateBrandDto = CreateBrandDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Brand Code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBrandDto.prototype, "Code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Brand Name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBrandDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBrandDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Logo URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBrandDto.prototype, "LogoUrl", void 0);
class UpdateBrandDto {
}
exports.UpdateBrandDto = UpdateBrandDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Brand Name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBrandDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBrandDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Logo URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBrandDto.prototype, "LogoUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateBrandDto.prototype, "IsActive", void 0);
class BrandFilterDto {
}
exports.BrandFilterDto = BrandFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BrandFilterDto.prototype, "Search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Include inactive' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], BrandFilterDto.prototype, "IncludeInactive", void 0);
class CreateUnitDto {
}
exports.CreateUnitDto = CreateUnitDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unit Code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateUnitDto.prototype, "Code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unit Name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateUnitDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Abbreviation' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUnitDto.prototype, "Abbreviation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUnitDto.prototype, "Description", void 0);
class UpdateUnitDto {
}
exports.UpdateUnitDto = UpdateUnitDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Unit Name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUnitDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Abbreviation' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUnitDto.prototype, "Abbreviation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUnitDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateUnitDto.prototype, "IsActive", void 0);
class CreateProductGroupDto {
}
exports.CreateProductGroupDto = CreateProductGroupDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product group Code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateProductGroupDto.prototype, "Code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product group Name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateProductGroupDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductGroupDto.prototype, "Description", void 0);
class UpdateProductGroupDto {
}
exports.UpdateProductGroupDto = UpdateProductGroupDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Product group Name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProductGroupDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProductGroupDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateProductGroupDto.prototype, "IsActive", void 0);
