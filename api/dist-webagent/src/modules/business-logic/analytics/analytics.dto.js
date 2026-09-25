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
exports.SalesTrendDto = exports.PeriodicReportDto = exports.TaxReportDto = exports.CashFlowReportDto = exports.InventoryReportDto = exports.TopCustomersDto = exports.TopProductsDto = exports.ProfitReportDto = exports.SalesReportDto = exports.DashboardSummaryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class DashboardSummaryDto {
}
exports.DashboardSummaryDto = DashboardSummaryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date (YYYY-MM-DD)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DashboardSummaryDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date (YYYY-MM-DD)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DashboardSummaryDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DashboardSummaryDto.prototype, "WarehouseId", void 0);
class SalesReportDto {
}
exports.SalesReportDto = SalesReportDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SalesReportDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SalesReportDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SalesReportDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Group by (day, week, month)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SalesReportDto.prototype, "GroupBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SalesReportDto.prototype, "CategoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Product ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SalesReportDto.prototype, "ProductId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customer ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SalesReportDto.prototype, "CustomerId", void 0);
class ProfitReportDto {
}
exports.ProfitReportDto = ProfitReportDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ProfitReportDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ProfitReportDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProfitReportDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Include returns in calculation' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ProfitReportDto.prototype, "IncludeReturns", void 0);
class TopProductsDto {
}
exports.TopProductsDto = TopProductsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], TopProductsDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], TopProductsDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TopProductsDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Limit results' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], TopProductsDto.prototype, "Limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sort by (Quantity, revenue, profit)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TopProductsDto.prototype, "SortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TopProductsDto.prototype, "CategoryId", void 0);
class TopCustomersDto {
}
exports.TopCustomersDto = TopCustomersDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], TopCustomersDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], TopCustomersDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TopCustomersDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Limit results' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], TopCustomersDto.prototype, "Limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sort by (Quantity, revenue)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TopCustomersDto.prototype, "SortBy", void 0);
class InventoryReportDto {
}
exports.InventoryReportDto = InventoryReportDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InventoryReportDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InventoryReportDto.prototype, "CategoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Include zero stock products' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], InventoryReportDto.prototype, "IncludeZeroStock", void 0);
class CashFlowReportDto {
}
exports.CashFlowReportDto = CashFlowReportDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CashFlowReportDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CashFlowReportDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Account ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CashFlowReportDto.prototype, "AccountId", void 0);
class TaxReportDto {
}
exports.TaxReportDto = TaxReportDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], TaxReportDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], TaxReportDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Tax rate filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TaxReportDto.prototype, "TaxRate", void 0);
class PeriodicReportDto {
}
exports.PeriodicReportDto = PeriodicReportDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Report Type (daily, weekly, monthly, yearly)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PeriodicReportDto.prototype, "Type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Specific Date for daily report' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], PeriodicReportDto.prototype, "Date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Year for monthly/yearly report' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PeriodicReportDto.prototype, "Year", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Month for monthly report (1-12)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PeriodicReportDto.prototype, "Month", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PeriodicReportDto.prototype, "WarehouseId", void 0);
class SalesTrendDto {
}
exports.SalesTrendDto = SalesTrendDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SalesTrendDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SalesTrendDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Compare with previous period' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SalesTrendDto.prototype, "CompareWithPrevious", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SalesTrendDto.prototype, "CategoryId", void 0);
