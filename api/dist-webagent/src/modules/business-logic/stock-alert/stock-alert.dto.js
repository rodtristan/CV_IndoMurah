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
exports.AutoReorderSettingDto = exports.StockLevelReportDto = exports.ReorderStockDto = exports.BulkResolveAlertDto = exports.ResolveStockAlertDto = exports.StockAlertFilterDto = exports.UpDateStockAlertDto = exports.CreateStockAlertDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateStockAlertDto {
}
exports.CreateStockAlertDto = CreateStockAlertDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateStockAlertDto.prototype, "ProductId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Alert Type ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateStockAlertDto.prototype, "AlertTypeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Threshold Quantity' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateStockAlertDto.prototype, "Threshold", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStockAlertDto.prototype, "Notes", void 0);
class UpDateStockAlertDto {
}
exports.UpDateStockAlertDto = UpDateStockAlertDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'New threshold' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpDateStockAlertDto.prototype, "Threshold", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpDateStockAlertDto.prototype, "Notes", void 0);
class StockAlertFilterDto {
}
exports.StockAlertFilterDto = StockAlertFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Alert Type ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StockAlertFilterDto.prototype, "AlertTypeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StockAlertFilterDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StockAlertFilterDto.prototype, "CategoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Show unread only' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], StockAlertFilterDto.prototype, "UnreadOnly", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Show unresolved only' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], StockAlertFilterDto.prototype, "UnresolvedOnly", void 0);
class ResolveStockAlertDto {
}
exports.ResolveStockAlertDto = ResolveStockAlertDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Resolution Notes' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResolveStockAlertDto.prototype, "Notes", void 0);
class BulkResolveAlertDto {
}
exports.BulkResolveAlertDto = BulkResolveAlertDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Alert IDs to resolve', type: [Number] }),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    __metadata("design:type", Array)
], BulkResolveAlertDto.prototype, "AlertIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Resolution Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkResolveAlertDto.prototype, "Notes", void 0);
class ReorderStockDto {
}
exports.ReorderStockDto = ReorderStockDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReorderStockDto.prototype, "ProductId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Suggested reorder Quantity' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ReorderStockDto.prototype, "ReorderQuantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Supplier ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReorderStockDto.prototype, "SupplierId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReorderStockDto.prototype, "Notes", void 0);
class StockLevelReportDto {
}
exports.StockLevelReportDto = StockLevelReportDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StockLevelReportDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StockLevelReportDto.prototype, "CategoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Show only low stock' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], StockLevelReportDto.prototype, "LowStockOnly", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Show only out of stock' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], StockLevelReportDto.prototype, "OutOfStockOnly", void 0);
class AutoReorderSettingDto {
}
exports.AutoReorderSettingDto = AutoReorderSettingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Enable auto reorder' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AutoReorderSettingDto.prototype, "Enabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Default reorder Quantity multiplier (e.g., 2 = reorder 2x minimum)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], AutoReorderSettingDto.prototype, "ReorderMultiplier", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Preferred supplier ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AutoReorderSettingDto.prototype, "PreferredSupplierId", void 0);
