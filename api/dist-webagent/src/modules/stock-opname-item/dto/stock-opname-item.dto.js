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
exports.QueryStockOpnameItemDto = exports.StockOpnameItemResponseDto = exports.UpdateStockOpnameItemDto = exports.CreateStockOpnameItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateStockOpnameItemDto {
}
exports.CreateStockOpnameItemDto = CreateStockOpnameItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'stockOpnameId' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateStockOpnameItemDto.prototype, "stockOpnameId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'productId' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateStockOpnameItemDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'systemStock' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateStockOpnameItemDto.prototype, "systemStock", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'countedStock' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateStockOpnameItemDto.prototype, "countedStock", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'difference' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateStockOpnameItemDto.prototype, "difference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'unitId' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateStockOpnameItemDto.prototype, "unitId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'unitPrice' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateStockOpnameItemDto.prototype, "unitPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'note' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStockOpnameItemDto.prototype, "note", void 0);
class UpdateStockOpnameItemDto {
}
exports.UpdateStockOpnameItemDto = UpdateStockOpnameItemDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'stockOpnameId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateStockOpnameItemDto.prototype, "stockOpnameId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'productId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateStockOpnameItemDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'systemStock' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateStockOpnameItemDto.prototype, "systemStock", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'countedStock' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateStockOpnameItemDto.prototype, "countedStock", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'difference' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateStockOpnameItemDto.prototype, "difference", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'unitId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateStockOpnameItemDto.prototype, "unitId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'unitPrice' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateStockOpnameItemDto.prototype, "unitPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'note' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateStockOpnameItemDto.prototype, "note", void 0);
class StockOpnameItemResponseDto {
}
exports.StockOpnameItemResponseDto = StockOpnameItemResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'stockOpnameId' }),
    __metadata("design:type", Number)
], StockOpnameItemResponseDto.prototype, "stockOpnameId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'productId' }),
    __metadata("design:type", Number)
], StockOpnameItemResponseDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'systemStock' }),
    __metadata("design:type", Number)
], StockOpnameItemResponseDto.prototype, "systemStock", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'countedStock' }),
    __metadata("design:type", Number)
], StockOpnameItemResponseDto.prototype, "countedStock", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'difference' }),
    __metadata("design:type", Number)
], StockOpnameItemResponseDto.prototype, "difference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'unitId' }),
    __metadata("design:type", Number)
], StockOpnameItemResponseDto.prototype, "unitId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'unitPrice' }),
    __metadata("design:type", Number)
], StockOpnameItemResponseDto.prototype, "unitPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'note' }),
    __metadata("design:type", String)
], StockOpnameItemResponseDto.prototype, "note", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'stockOpname' }),
    __metadata("design:type", Object)
], StockOpnameItemResponseDto.prototype, "stockOpname", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'product' }),
    __metadata("design:type", Object)
], StockOpnameItemResponseDto.prototype, "product", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'unit' }),
    __metadata("design:type", Object)
], StockOpnameItemResponseDto.prototype, "unit", void 0);
class QueryStockOpnameItemDto {
}
exports.QueryStockOpnameItemDto = QueryStockOpnameItemDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fields to select' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryStockOpnameItemDto.prototype, "$select", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Relations to include' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryStockOpnameItemDto.prototype, "$include", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to skip' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryStockOpnameItemDto.prototype, "$skip", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to take' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryStockOpnameItemDto.prototype, "$take", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryStockOpnameItemDto.prototype, "$search", void 0);
