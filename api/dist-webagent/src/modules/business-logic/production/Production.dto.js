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
exports.CreateBOMDto = exports.BOMItemDto = exports.ProductionFilterDto = exports.CreateProductionDto = exports.ProductionItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class ProductionItemDto {
}
exports.ProductionItemDto = ProductionItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Raw material product ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProductionItemDto.prototype, "ProductId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantity needed' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.001),
    __metadata("design:type", Number)
], ProductionItemDto.prototype, "Quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Unit ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProductionItemDto.prototype, "UnitId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Unit price (for cost calculation)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ProductionItemDto.prototype, "UnitPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductionItemDto.prototype, "Notes", void 0);
class CreateProductionDto {
}
exports.CreateProductionDto = CreateProductionDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Production Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateProductionDto.prototype, "Date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Finished product ID (product result)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateProductionDto.prototype, "ProductId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Finished product Name (if new product)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductionDto.prototype, "ProductName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Production Quantity' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.001),
    __metadata("design:type", Number)
], CreateProductionDto.prototype, "Quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID for output' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateProductionDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Labor cost' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateProductionDto.prototype, "LaborCost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Overhead cost' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateProductionDto.prototype, "OverheadCost", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Raw material Items', type: [ProductionItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ProductionItemDto),
    __metadata("design:type", Array)
], CreateProductionDto.prototype, "Items", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Production Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductionDto.prototype, "Notes", void 0);
class ProductionFilterDto {
}
exports.ProductionFilterDto = ProductionFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProductionFilterDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProductionFilterDto.prototype, "StatusId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ProductionFilterDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ProductionFilterDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Pending only' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ProductionFilterDto.prototype, "PendingOnly", void 0);
class BOMItemDto {
}
exports.BOMItemDto = BOMItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Raw material product ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BOMItemDto.prototype, "ProductId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantity per unit of finished product' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.001),
    __metadata("design:type", Number)
], BOMItemDto.prototype, "Quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Unit ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BOMItemDto.prototype, "UnitId", void 0);
class CreateBOMDto {
}
exports.CreateBOMDto = CreateBOMDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Finished product ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBOMDto.prototype, "ProductId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'BOM Items', type: [BOMItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BOMItemDto),
    __metadata("design:type", Array)
], CreateBOMDto.prototype, "Items", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateBOMDto.prototype, "IsActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBOMDto.prototype, "Notes", void 0);
