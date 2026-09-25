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
exports.GetPriceDto = exports.ProductPriceFilterDto = exports.CreateProductPriceDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateProductPriceDto {
}
exports.CreateProductPriceDto = CreateProductPriceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateProductPriceDto.prototype, "ProductId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unit ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateProductPriceDto.prototype, "UnitId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Price Type: STANDARD, BULK, SPECIAL, PROMOTION' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductPriceDto.prototype, "PriceType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Price value' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateProductPriceDto.prototype, "Price", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Minimum Quantity for this price' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateProductPriceDto.prototype, "MinQuantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum Quantity for this price' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateProductPriceDto.prototype, "MaxQuantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateProductPriceDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateProductPriceDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is active (1 = active, 0 = inactive)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateProductPriceDto.prototype, "IsActive", void 0);
class ProductPriceFilterDto {
}
exports.ProductPriceFilterDto = ProductPriceFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Product ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProductPriceFilterDto.prototype, "ProductId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Unit ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProductPriceFilterDto.prototype, "UnitId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Price Type filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductPriceFilterDto.prototype, "PriceType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Active only' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ProductPriceFilterDto.prototype, "ActiveOnly", void 0);
class GetPriceDto {
}
exports.GetPriceDto = GetPriceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GetPriceDto.prototype, "ProductId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Unit ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GetPriceDto.prototype, "UnitId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Quantity' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetPriceDto.prototype, "Quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customer ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GetPriceDto.prototype, "CustomerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Price Type' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetPriceDto.prototype, "PriceType", void 0);
