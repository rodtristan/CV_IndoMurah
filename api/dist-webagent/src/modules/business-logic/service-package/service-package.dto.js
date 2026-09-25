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
exports.ComparePackagesDto = exports.CalculatePackageQuoteDto = exports.ServicePackageFilterDto = exports.UpDateServicePackageDto = exports.CreateServicePackageDto = exports.PackageItemDto = exports.UpDateServiceCategoryDto = exports.CreateServiceCategoryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateServiceCategoryDto {
}
exports.CreateServiceCategoryDto = CreateServiceCategoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Category Code', example: 'SVC-GADGET' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateServiceCategoryDto.prototype, "Code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Category Name', example: 'Service Gadget' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateServiceCategoryDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateServiceCategoryDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Default labor cost' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateServiceCategoryDto.prototype, "DefaultLaborCost", void 0);
class UpDateServiceCategoryDto {
}
exports.UpDateServiceCategoryDto = UpDateServiceCategoryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category Name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpDateServiceCategoryDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpDateServiceCategoryDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Default labor cost' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpDateServiceCategoryDto.prototype, "DefaultLaborCost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpDateServiceCategoryDto.prototype, "IsActive", void 0);
class PackageItemDto {
}
exports.PackageItemDto = PackageItemDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Product ID (if using inventory product)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PackageItemDto.prototype, "ProductId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Item Name', example: 'LCD Replacement' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PackageItemDto.prototype, "ItemName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantity' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.001),
    __metadata("design:type", Number)
], PackageItemDto.prototype, "Quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Unit price' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PackageItemDto.prototype, "UnitPrice", void 0);
class CreateServicePackageDto {
}
exports.CreateServicePackageDto = CreateServicePackageDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Package Code', example: 'PKG-SCREEN-001' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateServicePackageDto.prototype, "Code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Package Name', example: 'Screen Replacement Package' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateServicePackageDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Service category ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateServicePackageDto.prototype, "ServiceCategoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Estimated duration in minutes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateServicePackageDto.prototype, "EstimatedDuration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Selling price' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateServicePackageDto.prototype, "SellingPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Cost price' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateServicePackageDto.prototype, "CostPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateServicePackageDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Package Items', type: [PackageItemDto] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateServicePackageDto.prototype, "Items", void 0);
class UpDateServicePackageDto {
}
exports.UpDateServicePackageDto = UpDateServicePackageDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Package Name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpDateServicePackageDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Service category ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpDateServicePackageDto.prototype, "ServiceCategoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Estimated duration in minutes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpDateServicePackageDto.prototype, "EstimatedDuration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Selling price' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpDateServicePackageDto.prototype, "SellingPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Cost price' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpDateServicePackageDto.prototype, "CostPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpDateServicePackageDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpDateServicePackageDto.prototype, "IsActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Package Items', type: [PackageItemDto] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpDateServicePackageDto.prototype, "Items", void 0);
class ServicePackageFilterDto {
}
exports.ServicePackageFilterDto = ServicePackageFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Service category ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ServicePackageFilterDto.prototype, "ServiceCategoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search by Code or Name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ServicePackageFilterDto.prototype, "Search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ServicePackageFilterDto.prototype, "IsActive", void 0);
class CalculatePackageQuoteDto {
}
exports.CalculatePackageQuoteDto = CalculatePackageQuoteDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Package ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CalculatePackageQuoteDto.prototype, "PackageId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Custom Quantity multiplier' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CalculatePackageQuoteDto.prototype, "Quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Apply discount percentage' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CalculatePackageQuoteDto.prototype, "DiscountPercent", void 0);
class ComparePackagesDto {
}
exports.ComparePackagesDto = ComparePackagesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Package IDs to compare', type: [Number] }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], ComparePackagesDto.prototype, "PackageIds", void 0);
