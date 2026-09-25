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
exports.CashFlowProjectionDto = exports.CashFlowSummaryDto = exports.CashFlowReportDto = exports.CashFlowFilterDto = exports.UpdateCashFlowTransactionDto = exports.BulkCashFlowTransactionDto = exports.CreateCashFlowTransactionDto = exports.CashFlowTransactionItemDto = exports.UpdateCashFlowCategoryDto = exports.CreateCashFlowCategoryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class CreateCashFlowCategoryDto {
}
exports.CreateCashFlowCategoryDto = CreateCashFlowCategoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Category Name', example: 'Penjualan Tunai' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCashFlowCategoryDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Type: INFLOW or OUTFLOW', example: 'INFLOW' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCashFlowCategoryDto.prototype, "Type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCashFlowCategoryDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Color for UI', example: '#4CAF50' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCashFlowCategoryDto.prototype, "Color", void 0);
class UpdateCashFlowCategoryDto {
}
exports.UpdateCashFlowCategoryDto = UpdateCashFlowCategoryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category Name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCashFlowCategoryDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCashFlowCategoryDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Color for UI' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCashFlowCategoryDto.prototype, "Color", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateCashFlowCategoryDto.prototype, "IsActive", void 0);
class CashFlowTransactionItemDto {
}
exports.CashFlowTransactionItemDto = CashFlowTransactionItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Account ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CashFlowTransactionItemDto.prototype, "AccountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Amount' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CashFlowTransactionItemDto.prototype, "Amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CashFlowTransactionItemDto.prototype, "Description", void 0);
class CreateCashFlowTransactionDto {
}
exports.CreateCashFlowTransactionDto = CreateCashFlowTransactionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Cash flow category ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCashFlowTransactionDto.prototype, "CategoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Account ID (cash/bank account)' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCashFlowTransactionDto.prototype, "AccountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction Date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCashFlowTransactionDto.prototype, "TransactionDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Amount' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCashFlowTransactionDto.prototype, "Amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCashFlowTransactionDto.prototype, "ReferenceNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCashFlowTransactionDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Linked sale ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCashFlowTransactionDto.prototype, "SaleId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Linked purchase ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCashFlowTransactionDto.prototype, "PurchaseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Linked expense ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCashFlowTransactionDto.prototype, "ExpenseId", void 0);
class BulkCashFlowTransactionDto {
}
exports.BulkCashFlowTransactionDto = BulkCashFlowTransactionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction Date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BulkCashFlowTransactionDto.prototype, "TransactionDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Account ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BulkCashFlowTransactionDto.prototype, "AccountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transactions to create', type: [CreateCashFlowTransactionDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateCashFlowTransactionDto),
    __metadata("design:type", Array)
], BulkCashFlowTransactionDto.prototype, "Transactions", void 0);
class UpdateCashFlowTransactionDto {
}
exports.UpdateCashFlowTransactionDto = UpdateCashFlowTransactionDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCashFlowTransactionDto.prototype, "ReferenceNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCashFlowTransactionDto.prototype, "Description", void 0);
class CashFlowFilterDto {
}
exports.CashFlowFilterDto = CashFlowFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CashFlowFilterDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CashFlowFilterDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CashFlowFilterDto.prototype, "CategoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Account ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CashFlowFilterDto.prototype, "AccountId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Type: INFLOW or OUTFLOW' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CashFlowFilterDto.prototype, "Type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search by Code or Reference' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CashFlowFilterDto.prototype, "Search", void 0);
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
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Group by: day, week, month, category' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CashFlowReportDto.prototype, "GroupBy", void 0);
class CashFlowSummaryDto {
}
exports.CashFlowSummaryDto = CashFlowSummaryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CashFlowSummaryDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CashFlowSummaryDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Account ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CashFlowSummaryDto.prototype, "AccountId", void 0);
class CashFlowProjectionDto {
}
exports.CashFlowProjectionDto = CashFlowProjectionDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CashFlowProjectionDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CashFlowProjectionDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Account ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CashFlowProjectionDto.prototype, "AccountId", void 0);
