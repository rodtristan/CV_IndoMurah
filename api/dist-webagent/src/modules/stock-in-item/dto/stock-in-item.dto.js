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
exports.QueryStockInItemDto = exports.StockInItemResponseDto = exports.UpdateStockInItemDto = exports.CreateStockInItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateStockInItemDto {
}
exports.CreateStockInItemDto = CreateStockInItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'stockInId' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateStockInItemDto.prototype, "stockInId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'productId' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateStockInItemDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'quantity' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateStockInItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'unitId' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateStockInItemDto.prototype, "unitId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'unitPrice' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateStockInItemDto.prototype, "unitPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'subtotal' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateStockInItemDto.prototype, "subtotal", void 0);
class UpdateStockInItemDto {
}
exports.UpdateStockInItemDto = UpdateStockInItemDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'stockInId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateStockInItemDto.prototype, "stockInId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'productId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateStockInItemDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'quantity' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateStockInItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'unitId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateStockInItemDto.prototype, "unitId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'unitPrice' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateStockInItemDto.prototype, "unitPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'subtotal' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateStockInItemDto.prototype, "subtotal", void 0);
class StockInItemResponseDto {
}
exports.StockInItemResponseDto = StockInItemResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'stockInId' }),
    __metadata("design:type", Number)
], StockInItemResponseDto.prototype, "stockInId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'productId' }),
    __metadata("design:type", Number)
], StockInItemResponseDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'quantity' }),
    __metadata("design:type", Number)
], StockInItemResponseDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'unitId' }),
    __metadata("design:type", Number)
], StockInItemResponseDto.prototype, "unitId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'unitPrice' }),
    __metadata("design:type", Number)
], StockInItemResponseDto.prototype, "unitPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'subtotal' }),
    __metadata("design:type", Number)
], StockInItemResponseDto.prototype, "subtotal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'stockIn' }),
    __metadata("design:type", Object)
], StockInItemResponseDto.prototype, "stockIn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'product' }),
    __metadata("design:type", Object)
], StockInItemResponseDto.prototype, "product", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'unit' }),
    __metadata("design:type", Object)
], StockInItemResponseDto.prototype, "unit", void 0);
class QueryStockInItemDto {
}
exports.QueryStockInItemDto = QueryStockInItemDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fields to select' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryStockInItemDto.prototype, "$select", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Relations to include' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryStockInItemDto.prototype, "$include", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to skip' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryStockInItemDto.prototype, "$skip", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to take' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryStockInItemDto.prototype, "$take", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryStockInItemDto.prototype, "$search", void 0);
