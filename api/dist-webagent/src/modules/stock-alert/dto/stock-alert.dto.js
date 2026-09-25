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
exports.QueryStockAlertDto = exports.StockAlertResponseDto = exports.UpdateStockAlertDto = exports.CreateStockAlertDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateStockAlertDto {
}
exports.CreateStockAlertDto = CreateStockAlertDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'productId' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateStockAlertDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Alert type ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateStockAlertDto.prototype, "alertTypeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'threshold' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateStockAlertDto.prototype, "threshold", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'currentStock' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateStockAlertDto.prototype, "currentStock", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'isRead' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateStockAlertDto.prototype, "isRead", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'isResolved' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateStockAlertDto.prototype, "isResolved", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'resolvedAt' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], CreateStockAlertDto.prototype, "resolvedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStockAlertDto.prototype, "notes", void 0);
class UpdateStockAlertDto {
}
exports.UpdateStockAlertDto = UpdateStockAlertDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'productId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateStockAlertDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Alert type ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateStockAlertDto.prototype, "alertTypeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'threshold' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateStockAlertDto.prototype, "threshold", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'currentStock' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateStockAlertDto.prototype, "currentStock", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'isRead' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateStockAlertDto.prototype, "isRead", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'isResolved' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateStockAlertDto.prototype, "isResolved", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'resolvedAt' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], UpdateStockAlertDto.prototype, "resolvedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateStockAlertDto.prototype, "notes", void 0);
class StockAlertResponseDto {
}
exports.StockAlertResponseDto = StockAlertResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'productId' }),
    __metadata("design:type", Number)
], StockAlertResponseDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Alert type ID' }),
    __metadata("design:type", Number)
], StockAlertResponseDto.prototype, "alertTypeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'threshold' }),
    __metadata("design:type", Number)
], StockAlertResponseDto.prototype, "threshold", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'currentStock' }),
    __metadata("design:type", Number)
], StockAlertResponseDto.prototype, "currentStock", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'isRead' }),
    __metadata("design:type", Boolean)
], StockAlertResponseDto.prototype, "isRead", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'isResolved' }),
    __metadata("design:type", Boolean)
], StockAlertResponseDto.prototype, "isResolved", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'resolvedAt' }),
    __metadata("design:type", Date)
], StockAlertResponseDto.prototype, "resolvedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'notes' }),
    __metadata("design:type", String)
], StockAlertResponseDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'product' }),
    __metadata("design:type", Object)
], StockAlertResponseDto.prototype, "product", void 0);
class QueryStockAlertDto {
}
exports.QueryStockAlertDto = QueryStockAlertDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fields to select' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryStockAlertDto.prototype, "$select", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Relations to include' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryStockAlertDto.prototype, "$include", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to skip' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryStockAlertDto.prototype, "$skip", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to take' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryStockAlertDto.prototype, "$take", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryStockAlertDto.prototype, "$search", void 0);
