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
exports.QuerySaleItemDto = exports.SaleItemResponseDto = exports.UpdateSaleItemDto = exports.CreateSaleItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateSaleItemDto {
}
exports.CreateSaleItemDto = CreateSaleItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sale ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSaleItemDto.prototype, "saleId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSaleItemDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantity' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSaleItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Unit ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSaleItemDto.prototype, "unitId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unit price' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSaleItemDto.prototype, "unitPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Discount percent' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSaleItemDto.prototype, "discountPercent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Discount amount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSaleItemDto.prototype, "discountAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Subtotal (calculated)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSaleItemDto.prototype, "subtotal", void 0);
class UpdateSaleItemDto {
}
exports.UpdateSaleItemDto = UpdateSaleItemDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Product ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateSaleItemDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Quantity' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateSaleItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Unit ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateSaleItemDto.prototype, "unitId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Unit price' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateSaleItemDto.prototype, "unitPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Discount percent' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateSaleItemDto.prototype, "discountPercent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Discount amount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateSaleItemDto.prototype, "discountAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Subtotal (calculated)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateSaleItemDto.prototype, "subtotal", void 0);
class SaleItemResponseDto {
}
exports.SaleItemResponseDto = SaleItemResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sale ID' }),
    __metadata("design:type", Number)
], SaleItemResponseDto.prototype, "saleId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product ID' }),
    __metadata("design:type", Number)
], SaleItemResponseDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantity' }),
    __metadata("design:type", Number)
], SaleItemResponseDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unit ID' }),
    __metadata("design:type", Number)
], SaleItemResponseDto.prototype, "unitId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unit price' }),
    __metadata("design:type", Number)
], SaleItemResponseDto.prototype, "unitPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Discount percent' }),
    __metadata("design:type", Number)
], SaleItemResponseDto.prototype, "discountPercent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Discount amount' }),
    __metadata("design:type", Number)
], SaleItemResponseDto.prototype, "discountAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Subtotal' }),
    __metadata("design:type", Number)
], SaleItemResponseDto.prototype, "subtotal", void 0);
class QuerySaleItemDto {
}
exports.QuerySaleItemDto = QuerySaleItemDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fields to select' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QuerySaleItemDto.prototype, "$select", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Relations to include' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QuerySaleItemDto.prototype, "$include", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to skip' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QuerySaleItemDto.prototype, "$skip", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to take' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QuerySaleItemDto.prototype, "$take", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QuerySaleItemDto.prototype, "$search", void 0);
