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
exports.MutationSummaryDto = exports.MutationReportDto = exports.StockMutationFilterDto = exports.UpdateStockMutationDto = exports.CreateStockMutationDto = exports.StockMutationItemDto = exports.UpdateMutationCategoryDto = exports.CreateMutationCategoryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateMutationCategoryDto {
}
exports.CreateMutationCategoryDto = CreateMutationCategoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Category Code', example: 'ADJ-IN' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMutationCategoryDto.prototype, "Code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Category Name', example: 'Stock Adjustment In' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMutationCategoryDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMutationCategoryDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Color for UI', example: '#4CAF50' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMutationCategoryDto.prototype, "Color", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Mutation Type: IN, OUT, ADJUSTMENT', example: 'IN' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMutationCategoryDto.prototype, "MutationType", void 0);
class UpdateMutationCategoryDto {
}
exports.UpdateMutationCategoryDto = UpdateMutationCategoryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category Name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMutationCategoryDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMutationCategoryDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Color for UI' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMutationCategoryDto.prototype, "Color", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateMutationCategoryDto.prototype, "IsActive", void 0);
class StockMutationItemDto {
}
exports.StockMutationItemDto = StockMutationItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StockMutationItemDto.prototype, "ProductId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantity' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.001),
    __metadata("design:type", Number)
], StockMutationItemDto.prototype, "Quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Unit ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StockMutationItemDto.prototype, "UnitId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Unit price for valuation' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StockMutationItemDto.prototype, "UnitPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StockMutationItemDto.prototype, "Notes", void 0);
class CreateStockMutationDto {
}
exports.CreateStockMutationDto = CreateStockMutationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Mutation category ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateStockMutationDto.prototype, "MutationCategoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateStockMutationDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Mutation Date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateStockMutationDto.prototype, "MutationDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference number (e.g., Purchase Order, Sales Order)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStockMutationDto.prototype, "ReferenceNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStockMutationDto.prototype, "Notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Items', type: [StockMutationItemDto] }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateStockMutationDto.prototype, "Items", void 0);
class UpdateStockMutationDto {
}
exports.UpdateStockMutationDto = UpdateStockMutationDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateStockMutationDto.prototype, "ReferenceNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateStockMutationDto.prototype, "Notes", void 0);
class StockMutationFilterDto {
}
exports.StockMutationFilterDto = StockMutationFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], StockMutationFilterDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], StockMutationFilterDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Mutation category ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StockMutationFilterDto.prototype, "MutationCategoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StockMutationFilterDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Mutation Type filter (IN, OUT, ADJUSTMENT, TRANSFER)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StockMutationFilterDto.prototype, "MutationType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search by Code or Reference' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StockMutationFilterDto.prototype, "Search", void 0);
class MutationReportDto {
}
exports.MutationReportDto = MutationReportDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], MutationReportDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], MutationReportDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], MutationReportDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Group by: day, week, month' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MutationReportDto.prototype, "GroupBy", void 0);
class MutationSummaryDto {
}
exports.MutationSummaryDto = MutationSummaryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], MutationSummaryDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], MutationSummaryDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], MutationSummaryDto.prototype, "WarehouseId", void 0);
