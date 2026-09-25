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
exports.QueryProductionDto = exports.ProductionResponseDto = exports.UpdateProductionDto = exports.CreateProductionDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateProductionDto {
}
exports.CreateProductionDto = CreateProductionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'code' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductionDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'date', type: String, format: 'date-time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateProductionDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'productId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateProductionDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'productName' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductionDto.prototype, "productName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'quantity' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateProductionDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'warehouseId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateProductionDto.prototype, "warehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'rawMaterialCost' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateProductionDto.prototype, "rawMaterialCost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'laborCost' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateProductionDto.prototype, "laborCost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'overheadCost' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateProductionDto.prototype, "overheadCost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'totalCost' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateProductionDto.prototype, "totalCost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ProductionStatus ID (default 1)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateProductionDto.prototype, "statusId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductionDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'isActive' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateProductionDto.prototype, "isActive", void 0);
class UpdateProductionDto {
}
exports.UpdateProductionDto = UpdateProductionDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'code' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProductionDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'date', type: String, format: 'date-time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], UpdateProductionDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'productId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateProductionDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'productName' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProductionDto.prototype, "productName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'quantity' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateProductionDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'warehouseId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateProductionDto.prototype, "warehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'rawMaterialCost' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateProductionDto.prototype, "rawMaterialCost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'laborCost' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateProductionDto.prototype, "laborCost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'overheadCost' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateProductionDto.prototype, "overheadCost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'totalCost' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateProductionDto.prototype, "totalCost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ProductionStatus ID (default 1)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateProductionDto.prototype, "statusId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProductionDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'isActive' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateProductionDto.prototype, "isActive", void 0);
class ProductionResponseDto {
}
exports.ProductionResponseDto = ProductionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'code' }),
    __metadata("design:type", String)
], ProductionResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'date' }),
    __metadata("design:type", Date)
], ProductionResponseDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'productId' }),
    __metadata("design:type", Number)
], ProductionResponseDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'productName' }),
    __metadata("design:type", String)
], ProductionResponseDto.prototype, "productName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'quantity' }),
    __metadata("design:type", Number)
], ProductionResponseDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'warehouseId' }),
    __metadata("design:type", Number)
], ProductionResponseDto.prototype, "warehouseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'rawMaterialCost' }),
    __metadata("design:type", Number)
], ProductionResponseDto.prototype, "rawMaterialCost", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'laborCost' }),
    __metadata("design:type", Number)
], ProductionResponseDto.prototype, "laborCost", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'overheadCost' }),
    __metadata("design:type", Number)
], ProductionResponseDto.prototype, "overheadCost", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'totalCost' }),
    __metadata("design:type", Number)
], ProductionResponseDto.prototype, "totalCost", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'status' }),
    __metadata("design:type", Object)
], ProductionResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'notes' }),
    __metadata("design:type", String)
], ProductionResponseDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'isActive' }),
    __metadata("design:type", Boolean)
], ProductionResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'warehouse' }),
    __metadata("design:type", Object)
], ProductionResponseDto.prototype, "warehouse", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'product' }),
    __metadata("design:type", Object)
], ProductionResponseDto.prototype, "product", void 0);
class QueryProductionDto {
}
exports.QueryProductionDto = QueryProductionDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fields to select' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryProductionDto.prototype, "$select", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Relations to include' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryProductionDto.prototype, "$include", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to skip' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryProductionDto.prototype, "$skip", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to take' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryProductionDto.prototype, "$take", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryProductionDto.prototype, "$search", void 0);
