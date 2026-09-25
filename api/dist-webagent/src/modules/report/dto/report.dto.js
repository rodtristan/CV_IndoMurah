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
exports.StockMutationResponseDto = exports.ReceivableReportResponseDto = exports.DebtReportResponseDto = exports.ProfitLossReportResponseDto = exports.FinancialReportResponseDto = exports.CashReportResponseDto = exports.InventoryReportResponseDto = exports.PurchaseReportResponseDto = exports.PurchaseReportItemDto = exports.SalesReportResponseDto = exports.SalesReportItemDto = exports.StockMutationFilterDto = exports.InventoryReportFilterDto = exports.PurchaseReportFilterDto = exports.SalesReportFilterDto = exports.DateRangeFilterDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class DateRangeFilterDto {
}
exports.DateRangeFilterDto = DateRangeFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start date (ISO 8601)', example: '2024-01-01' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DateRangeFilterDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End date (ISO 8601)', example: '2024-12-31' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DateRangeFilterDto.prototype, "endDate", void 0);
class SalesReportFilterDto extends DateRangeFilterDto {
}
exports.SalesReportFilterDto = SalesReportFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], SalesReportFilterDto.prototype, "warehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customer ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], SalesReportFilterDto.prototype, "customerId", void 0);
class PurchaseReportFilterDto extends DateRangeFilterDto {
}
exports.PurchaseReportFilterDto = PurchaseReportFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], PurchaseReportFilterDto.prototype, "warehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Supplier ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], PurchaseReportFilterDto.prototype, "supplierId", void 0);
class InventoryReportFilterDto {
}
exports.InventoryReportFilterDto = InventoryReportFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], InventoryReportFilterDto.prototype, "warehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], InventoryReportFilterDto.prototype, "categoryId", void 0);
class StockMutationFilterDto extends DateRangeFilterDto {
}
exports.StockMutationFilterDto = StockMutationFilterDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product ID' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], StockMutationFilterDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], StockMutationFilterDto.prototype, "warehouseId", void 0);
class SalesReportItemDto {
}
exports.SalesReportItemDto = SalesReportItemDto;
class SalesReportResponseDto {
}
exports.SalesReportResponseDto = SalesReportResponseDto;
class PurchaseReportItemDto {
}
exports.PurchaseReportItemDto = PurchaseReportItemDto;
class PurchaseReportResponseDto {
}
exports.PurchaseReportResponseDto = PurchaseReportResponseDto;
class InventoryReportResponseDto {
}
exports.InventoryReportResponseDto = InventoryReportResponseDto;
class CashReportResponseDto {
}
exports.CashReportResponseDto = CashReportResponseDto;
class FinancialReportResponseDto {
}
exports.FinancialReportResponseDto = FinancialReportResponseDto;
class ProfitLossReportResponseDto {
}
exports.ProfitLossReportResponseDto = ProfitLossReportResponseDto;
class DebtReportResponseDto {
}
exports.DebtReportResponseDto = DebtReportResponseDto;
class ReceivableReportResponseDto {
}
exports.ReceivableReportResponseDto = ReceivableReportResponseDto;
class StockMutationResponseDto {
}
exports.StockMutationResponseDto = StockMutationResponseDto;
