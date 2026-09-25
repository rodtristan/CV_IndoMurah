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
exports.QueryPurchaseOrderItemDto = exports.PurchaseOrderItemResponseDto = exports.UpdatePurchaseOrderItemDto = exports.CreatePurchaseOrderItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreatePurchaseOrderItemDto {
}
exports.CreatePurchaseOrderItemDto = CreatePurchaseOrderItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'purchaseOrderId' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseOrderItemDto.prototype, "purchaseOrderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'productId' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseOrderItemDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'quantity' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseOrderItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'unitId' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseOrderItemDto.prototype, "unitId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'unitPrice' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseOrderItemDto.prototype, "unitPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'discountPercent' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseOrderItemDto.prototype, "discountPercent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'discountAmount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseOrderItemDto.prototype, "discountAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'subtotal' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseOrderItemDto.prototype, "subtotal", void 0);
class UpdatePurchaseOrderItemDto {
}
exports.UpdatePurchaseOrderItemDto = UpdatePurchaseOrderItemDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'purchaseOrderId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePurchaseOrderItemDto.prototype, "purchaseOrderId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'productId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePurchaseOrderItemDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'quantity' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePurchaseOrderItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'unitId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePurchaseOrderItemDto.prototype, "unitId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'unitPrice' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePurchaseOrderItemDto.prototype, "unitPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'discountPercent' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePurchaseOrderItemDto.prototype, "discountPercent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'discountAmount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePurchaseOrderItemDto.prototype, "discountAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'subtotal' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePurchaseOrderItemDto.prototype, "subtotal", void 0);
class PurchaseOrderItemResponseDto {
}
exports.PurchaseOrderItemResponseDto = PurchaseOrderItemResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'purchaseOrderId' }),
    __metadata("design:type", Number)
], PurchaseOrderItemResponseDto.prototype, "purchaseOrderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'productId' }),
    __metadata("design:type", Number)
], PurchaseOrderItemResponseDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'quantity' }),
    __metadata("design:type", Number)
], PurchaseOrderItemResponseDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'unitId' }),
    __metadata("design:type", Number)
], PurchaseOrderItemResponseDto.prototype, "unitId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'unitPrice' }),
    __metadata("design:type", Number)
], PurchaseOrderItemResponseDto.prototype, "unitPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'discountPercent' }),
    __metadata("design:type", Number)
], PurchaseOrderItemResponseDto.prototype, "discountPercent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'discountAmount' }),
    __metadata("design:type", Number)
], PurchaseOrderItemResponseDto.prototype, "discountAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'subtotal' }),
    __metadata("design:type", Number)
], PurchaseOrderItemResponseDto.prototype, "subtotal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'purchaseOrder' }),
    __metadata("design:type", Object)
], PurchaseOrderItemResponseDto.prototype, "purchaseOrder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'product' }),
    __metadata("design:type", Object)
], PurchaseOrderItemResponseDto.prototype, "product", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'unit' }),
    __metadata("design:type", Object)
], PurchaseOrderItemResponseDto.prototype, "unit", void 0);
class QueryPurchaseOrderItemDto {
}
exports.QueryPurchaseOrderItemDto = QueryPurchaseOrderItemDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fields to select' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPurchaseOrderItemDto.prototype, "$select", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Relations to include' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPurchaseOrderItemDto.prototype, "$include", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to skip' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryPurchaseOrderItemDto.prototype, "$skip", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to take' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryPurchaseOrderItemDto.prototype, "$take", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPurchaseOrderItemDto.prototype, "$search", void 0);
