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
exports.FixBalanceDto = exports.FixBalanceItemDto = exports.DepositBalanceReportDto = exports.CreateOpeningStockDto = exports.OpeningStockItemDto = exports.ValuationReportDto = exports.StockReportDto = exports.StockOpNameDto = exports.StockOpNameItemDto = exports.StockAdjustmentDto = exports.StockAdjustmentItemDto = exports.StockTransferDto = exports.StockTransferItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class StockTransferItemDto {
}
exports.StockTransferItemDto = StockTransferItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StockTransferItemDto.prototype, "ProductId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantity to transfer' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.001),
    __metadata("design:type", Number)
], StockTransferItemDto.prototype, "Quantity", void 0);
class StockTransferDto {
}
exports.StockTransferDto = StockTransferDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'From warehouse ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StockTransferDto.prototype, "FromWarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'To warehouse ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StockTransferDto.prototype, "ToWarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Items to transfer', type: [StockTransferItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => StockTransferItemDto),
    __metadata("design:type", Array)
], StockTransferDto.prototype, "TransferItems", void 0);
class StockAdjustmentItemDto {
}
exports.StockAdjustmentItemDto = StockAdjustmentItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StockAdjustmentItemDto.prototype, "ProductId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantity (positive for add, negative for reduce)' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StockAdjustmentItemDto.prototype, "Quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Unit price for valuation' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StockAdjustmentItemDto.prototype, "UnitPrice", void 0);
class StockAdjustmentDto {
}
exports.StockAdjustmentDto = StockAdjustmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StockAdjustmentDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Adjustment type (STOCK_IN, STOCK_OUT, CORRECTION)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StockAdjustmentDto.prototype, "AdjustmentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reference Type (e.g., PURCHASE, SALE, DAMAGE, EXPIRED)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StockAdjustmentDto.prototype, "ReferenceType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StockAdjustmentDto.prototype, "ReferenceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Adjustment Notes/reason' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StockAdjustmentDto.prototype, "Notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Items to adjust', type: [StockAdjustmentItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => StockAdjustmentItemDto),
    __metadata("design:type", Array)
], StockAdjustmentDto.prototype, "AdjustmentItems", void 0);
class StockOpNameItemDto {
}
exports.StockOpNameItemDto = StockOpNameItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StockOpNameItemDto.prototype, "ProductId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'System stock (expected)' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StockOpNameItemDto.prototype, "SystemStock", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Actual stock counted' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StockOpNameItemDto.prototype, "CountedStock", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StockOpNameItemDto.prototype, "Notes", void 0);
class StockOpNameDto {
}
exports.StockOpNameDto = StockOpNameDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StockOpNameDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'OpName Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], StockOpNameDto.prototype, "OpNameDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StockOpNameDto.prototype, "Notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Items counted during opName', type: [StockOpNameItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => StockOpNameItemDto),
    __metadata("design:type", Array)
], StockOpNameDto.prototype, "OpNameItems", void 0);
class StockReportDto {
}
exports.StockReportDto = StockReportDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StockReportDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StockReportDto.prototype, "CategoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], StockReportDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], StockReportDto.prototype, "EndDate", void 0);
class ValuationReportDto {
}
exports.ValuationReportDto = ValuationReportDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ValuationReportDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ValuationReportDto.prototype, "CategoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Valuation method (FIFO, AVERAGE, LIFO)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ValuationReportDto.prototype, "ValuationMethod", void 0);
class OpeningStockItemDto {
}
exports.OpeningStockItemDto = OpeningStockItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], OpeningStockItemDto.prototype, "ProductId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantity' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.001),
    __metadata("design:type", Number)
], OpeningStockItemDto.prototype, "Quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unit Cost' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], OpeningStockItemDto.prototype, "UnitCost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Expiry Date (YYYY-MM-DD)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], OpeningStockItemDto.prototype, "ExpiryDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Batch Number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OpeningStockItemDto.prototype, "BatchNumber", void 0);
class CreateOpeningStockDto {
}
exports.CreateOpeningStockDto = CreateOpeningStockDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateOpeningStockDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Items to initialize', type: [OpeningStockItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => OpeningStockItemDto),
    __metadata("design:type", Array)
], CreateOpeningStockDto.prototype, "Items", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference/Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOpeningStockDto.prototype, "Notes", void 0);
class DepositBalanceReportDto {
}
exports.DepositBalanceReportDto = DepositBalanceReportDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'As of date (YYYY-MM-DD)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DepositBalanceReportDto.prototype, "AsOfDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customer ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DepositBalanceReportDto.prototype, "CustomerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Supplier ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DepositBalanceReportDto.prototype, "SupplierId", void 0);
class FixBalanceItemDto {
}
exports.FixBalanceItemDto = FixBalanceItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FixBalanceItemDto.prototype, "ProductId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current system stock' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FixBalanceItemDto.prototype, "CurrentStock", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Actual/real stock' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FixBalanceItemDto.prototype, "ActualStock", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes/Reason' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FixBalanceItemDto.prototype, "Notes", void 0);
class FixBalanceDto {
}
exports.FixBalanceDto = FixBalanceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FixBalanceDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Items to fix', type: [FixBalanceItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => FixBalanceItemDto),
    __metadata("design:type", Array)
], FixBalanceDto.prototype, "Items", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference/Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FixBalanceDto.prototype, "Notes", void 0);
