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
exports.QueryPriceHistoryDto = exports.PriceHistoryResponseDto = exports.UpdatePriceHistoryDto = exports.CreatePriceHistoryDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreatePriceHistoryDto {
}
exports.CreatePriceHistoryDto = CreatePriceHistoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'productId' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePriceHistoryDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'type' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePriceHistoryDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'oldPrice' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePriceHistoryDto.prototype, "oldPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'newPrice' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePriceHistoryDto.prototype, "newPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'changedBy' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePriceHistoryDto.prototype, "changedBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'changedAt', type: String, format: 'date-time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreatePriceHistoryDto.prototype, "changedAt", void 0);
class UpdatePriceHistoryDto {
}
exports.UpdatePriceHistoryDto = UpdatePriceHistoryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'productId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePriceHistoryDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'type' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePriceHistoryDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'oldPrice' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePriceHistoryDto.prototype, "oldPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'newPrice' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePriceHistoryDto.prototype, "newPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'changedBy' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePriceHistoryDto.prototype, "changedBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'changedAt', type: String, format: 'date-time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], UpdatePriceHistoryDto.prototype, "changedAt", void 0);
class PriceHistoryResponseDto {
}
exports.PriceHistoryResponseDto = PriceHistoryResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'productId' }),
    __metadata("design:type", Number)
], PriceHistoryResponseDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'type' }),
    __metadata("design:type", String)
], PriceHistoryResponseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'oldPrice' }),
    __metadata("design:type", Number)
], PriceHistoryResponseDto.prototype, "oldPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'newPrice' }),
    __metadata("design:type", Number)
], PriceHistoryResponseDto.prototype, "newPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'changedBy' }),
    __metadata("design:type", String)
], PriceHistoryResponseDto.prototype, "changedBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'changedAt' }),
    __metadata("design:type", Date)
], PriceHistoryResponseDto.prototype, "changedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'product' }),
    __metadata("design:type", Object)
], PriceHistoryResponseDto.prototype, "product", void 0);
class QueryPriceHistoryDto {
}
exports.QueryPriceHistoryDto = QueryPriceHistoryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fields to select' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPriceHistoryDto.prototype, "$select", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Relations to include' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPriceHistoryDto.prototype, "$include", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to skip' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryPriceHistoryDto.prototype, "$skip", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to take' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryPriceHistoryDto.prototype, "$take", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPriceHistoryDto.prototype, "$search", void 0);
