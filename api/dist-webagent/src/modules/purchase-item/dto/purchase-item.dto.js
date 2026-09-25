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
exports.QueryPurchaseItemDto = exports.PurchaseItemResponseDto = exports.UpdatePurchaseItemDto = exports.CreatePurchaseItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreatePurchaseItemDto {
}
exports.CreatePurchaseItemDto = CreatePurchaseItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'purchaseId' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseItemDto.prototype, "purchaseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'productId' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseItemDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'quantity' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'unitId' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseItemDto.prototype, "unitId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'unitPrice' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseItemDto.prototype, "unitPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'discountPercent' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseItemDto.prototype, "discountPercent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'discountAmount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseItemDto.prototype, "discountAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'subtotal' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseItemDto.prototype, "subtotal", void 0);
class UpdatePurchaseItemDto {
}
exports.UpdatePurchaseItemDto = UpdatePurchaseItemDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'purchaseId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePurchaseItemDto.prototype, "purchaseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'productId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePurchaseItemDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'quantity' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePurchaseItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'unitId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePurchaseItemDto.prototype, "unitId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'unitPrice' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePurchaseItemDto.prototype, "unitPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'discountPercent' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePurchaseItemDto.prototype, "discountPercent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'discountAmount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePurchaseItemDto.prototype, "discountAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'subtotal' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePurchaseItemDto.prototype, "subtotal", void 0);
class PurchaseItemResponseDto {
}
exports.PurchaseItemResponseDto = PurchaseItemResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'purchaseId' }),
    __metadata("design:type", Number)
], PurchaseItemResponseDto.prototype, "purchaseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'productId' }),
    __metadata("design:type", Number)
], PurchaseItemResponseDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'quantity' }),
    __metadata("design:type", Number)
], PurchaseItemResponseDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'unitId' }),
    __metadata("design:type", Number)
], PurchaseItemResponseDto.prototype, "unitId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'unitPrice' }),
    __metadata("design:type", Number)
], PurchaseItemResponseDto.prototype, "unitPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'discountPercent' }),
    __metadata("design:type", Number)
], PurchaseItemResponseDto.prototype, "discountPercent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'discountAmount' }),
    __metadata("design:type", Number)
], PurchaseItemResponseDto.prototype, "discountAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'subtotal' }),
    __metadata("design:type", Number)
], PurchaseItemResponseDto.prototype, "subtotal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'purchase' }),
    __metadata("design:type", Object)
], PurchaseItemResponseDto.prototype, "purchase", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'product' }),
    __metadata("design:type", Object)
], PurchaseItemResponseDto.prototype, "product", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'unit' }),
    __metadata("design:type", Object)
], PurchaseItemResponseDto.prototype, "unit", void 0);
class QueryPurchaseItemDto {
}
exports.QueryPurchaseItemDto = QueryPurchaseItemDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fields to select' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPurchaseItemDto.prototype, "$select", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Relations to include' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPurchaseItemDto.prototype, "$include", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to skip' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryPurchaseItemDto.prototype, "$skip", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to take' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryPurchaseItemDto.prototype, "$take", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPurchaseItemDto.prototype, "$search", void 0);
