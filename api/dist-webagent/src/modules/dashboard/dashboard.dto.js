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
exports.DashboardResponseDto = exports.SalesByBranchDto = exports.RecentTransactionDto = exports.LowStockItemDto = exports.TopSupplierDto = exports.TopCustomerDto = exports.TopProductDto = exports.DashboardSummaryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class DashboardSummaryDto {
}
exports.DashboardSummaryDto = DashboardSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total sales amount' }),
    __metadata("design:type", Number)
], DashboardSummaryDto.prototype, "totalSales", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total purchase amount' }),
    __metadata("design:type", Number)
], DashboardSummaryDto.prototype, "totalPurchases", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Gross profit (revenue - COGS)' }),
    __metadata("design:type", Number)
], DashboardSummaryDto.prototype, "grossProfit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Net profit (gross profit - expenses)' }),
    __metadata("design:type", Number)
], DashboardSummaryDto.prototype, "netProfit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total sales transactions count' }),
    __metadata("design:type", Number)
], DashboardSummaryDto.prototype, "salesCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total purchase transactions count' }),
    __metadata("design:type", Number)
], DashboardSummaryDto.prototype, "purchasesCount", void 0);
class TopProductDto {
}
exports.TopProductDto = TopProductDto;
class TopCustomerDto {
}
exports.TopCustomerDto = TopCustomerDto;
class TopSupplierDto {
}
exports.TopSupplierDto = TopSupplierDto;
class LowStockItemDto {
}
exports.LowStockItemDto = LowStockItemDto;
class RecentTransactionDto {
}
exports.RecentTransactionDto = RecentTransactionDto;
class SalesByBranchDto {
}
exports.SalesByBranchDto = SalesByBranchDto;
class DashboardResponseDto {
}
exports.DashboardResponseDto = DashboardResponseDto;
