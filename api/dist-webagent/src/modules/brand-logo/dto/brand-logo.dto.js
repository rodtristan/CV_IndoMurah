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
exports.QueryBrandLogoDto = exports.BrandLogoResponseDto = exports.UpdateBrandLogoDto = exports.CreateBrandLogoDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateBrandLogoDto {
}
exports.CreateBrandLogoDto = CreateBrandLogoDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'brandId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBrandLogoDto.prototype, "brandId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBrandLogoDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'logoUrl' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBrandLogoDto.prototype, "logoUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'website' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBrandLogoDto.prototype, "website", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'sortOrder' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBrandLogoDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'isActive' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateBrandLogoDto.prototype, "isActive", void 0);
class UpdateBrandLogoDto {
}
exports.UpdateBrandLogoDto = UpdateBrandLogoDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'brandId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateBrandLogoDto.prototype, "brandId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBrandLogoDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'logoUrl' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBrandLogoDto.prototype, "logoUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'website' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBrandLogoDto.prototype, "website", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'sortOrder' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateBrandLogoDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'isActive' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateBrandLogoDto.prototype, "isActive", void 0);
class BrandLogoResponseDto {
}
exports.BrandLogoResponseDto = BrandLogoResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'brandId' }),
    __metadata("design:type", Number)
], BrandLogoResponseDto.prototype, "brandId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'name' }),
    __metadata("design:type", String)
], BrandLogoResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'logoUrl' }),
    __metadata("design:type", String)
], BrandLogoResponseDto.prototype, "logoUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'website' }),
    __metadata("design:type", String)
], BrandLogoResponseDto.prototype, "website", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'sortOrder' }),
    __metadata("design:type", Number)
], BrandLogoResponseDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'isActive' }),
    __metadata("design:type", Boolean)
], BrandLogoResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'brand' }),
    __metadata("design:type", Object)
], BrandLogoResponseDto.prototype, "brand", void 0);
class QueryBrandLogoDto {
}
exports.QueryBrandLogoDto = QueryBrandLogoDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fields to select' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryBrandLogoDto.prototype, "$select", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Relations to include' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryBrandLogoDto.prototype, "$include", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to skip' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryBrandLogoDto.prototype, "$skip", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to take' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryBrandLogoDto.prototype, "$take", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryBrandLogoDto.prototype, "$search", void 0);
