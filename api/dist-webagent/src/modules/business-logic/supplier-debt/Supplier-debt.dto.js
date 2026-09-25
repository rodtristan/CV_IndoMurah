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
exports.SupplierDebtReportDto = exports.SupplierDebtAgingDto = exports.UseSupplierDepositDto = exports.AddSupplierDepositDto = exports.BulkSupplierPaymentDto = exports.RecordSupplierPaymentDto = exports.SupplierDebtDetailDto = exports.SupplierDebtOverviewDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class SupplierDebtOverviewDto {
}
exports.SupplierDebtOverviewDto = SupplierDebtOverviewDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Supplier ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SupplierDebtOverviewDto.prototype, "SupplierId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status filter (ACTIVE, OVERDUE, PAID, ALL)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SupplierDebtOverviewDto.prototype, "Status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SupplierDebtOverviewDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SupplierDebtOverviewDto.prototype, "EndDate", void 0);
class SupplierDebtDetailDto {
}
exports.SupplierDebtDetailDto = SupplierDebtDetailDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Supplier ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SupplierDebtDetailDto.prototype, "SupplierId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Include fully paid purchases' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SupplierDebtDetailDto.prototype, "IncludePaid", void 0);
class RecordSupplierPaymentDto {
}
exports.RecordSupplierPaymentDto = RecordSupplierPaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Supplier ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecordSupplierPaymentDto.prototype, "SupplierId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Amount to pay' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], RecordSupplierPaymentDto.prototype, "Amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment method ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecordSupplierPaymentDto.prototype, "PaymentMethodId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Purchase IDs to pay (leave empty to pay oldest first)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    __metadata("design:type", Array)
], RecordSupplierPaymentDto.prototype, "PurchaseIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordSupplierPaymentDto.prototype, "ReferenceNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], RecordSupplierPaymentDto.prototype, "PaymentDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordSupplierPaymentDto.prototype, "Notes", void 0);
class BulkSupplierPaymentDto {
}
exports.BulkSupplierPaymentDto = BulkSupplierPaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Supplier ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BulkSupplierPaymentDto.prototype, "SupplierId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total payment Amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], BulkSupplierPaymentDto.prototype, "Amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment method ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BulkSupplierPaymentDto.prototype, "PaymentMethodId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkSupplierPaymentDto.prototype, "ReferenceNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BulkSupplierPaymentDto.prototype, "PaymentDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkSupplierPaymentDto.prototype, "Notes", void 0);
class AddSupplierDepositDto {
}
exports.AddSupplierDepositDto = AddSupplierDepositDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Supplier ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AddSupplierDepositDto.prototype, "SupplierId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Deposit Amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], AddSupplierDepositDto.prototype, "Amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddSupplierDepositDto.prototype, "Notes", void 0);
class UseSupplierDepositDto {
}
exports.UseSupplierDepositDto = UseSupplierDepositDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Purchase ID to use deposit for' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UseSupplierDepositDto.prototype, "PurchaseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Amount to use from deposit' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UseSupplierDepositDto.prototype, "Amount", void 0);
class SupplierDebtAgingDto {
}
exports.SupplierDebtAgingDto = SupplierDebtAgingDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'As of Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SupplierDebtAgingDto.prototype, "AsOfDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Supplier group filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SupplierDebtAgingDto.prototype, "SupplierGroupId", void 0);
class SupplierDebtReportDto {
}
exports.SupplierDebtReportDto = SupplierDebtReportDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SupplierDebtReportDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SupplierDebtReportDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Supplier ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SupplierDebtReportDto.prototype, "SupplierId", void 0);
