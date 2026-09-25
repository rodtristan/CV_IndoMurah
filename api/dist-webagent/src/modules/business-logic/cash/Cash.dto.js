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
exports.CashSummaryDto = exports.CashBalanceDto = exports.CashFlowFilterDto = exports.TransferCashDto = exports.RecordCashOutDto = exports.RecordCashInDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class RecordCashInDto {
}
exports.RecordCashInDto = RecordCashInDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Account ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecordCashInDto.prototype, "AccountId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Cash in Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], RecordCashInDto.prototype, "Date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], RecordCashInDto.prototype, "Amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Description' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RecordCashInDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference Type (e.g., SALE, DEPOSIT)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordCashInDto.prototype, "ReferenceType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecordCashInDto.prototype, "ReferenceId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordCashInDto.prototype, "Notes", void 0);
class RecordCashOutDto {
}
exports.RecordCashOutDto = RecordCashOutDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Account ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecordCashOutDto.prototype, "AccountId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Cash out Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], RecordCashOutDto.prototype, "Date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], RecordCashOutDto.prototype, "Amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Description' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RecordCashOutDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference Type (e.g., EXPENSE, PURCHASE)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordCashOutDto.prototype, "ReferenceType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecordCashOutDto.prototype, "ReferenceId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordCashOutDto.prototype, "Notes", void 0);
class TransferCashDto {
}
exports.TransferCashDto = TransferCashDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'From account ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TransferCashDto.prototype, "FromAccountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'To account ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TransferCashDto.prototype, "ToAccountId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Transfer Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], TransferCashDto.prototype, "Date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], TransferCashDto.prototype, "Amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Description' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], TransferCashDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransferCashDto.prototype, "Notes", void 0);
class CashFlowFilterDto {
}
exports.CashFlowFilterDto = CashFlowFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Account ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CashFlowFilterDto.prototype, "AccountId", void 0);
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
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference Type filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CashFlowFilterDto.prototype, "ReferenceType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Limit results' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CashFlowFilterDto.prototype, "Limit", void 0);
class CashBalanceDto {
}
exports.CashBalanceDto = CashBalanceDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Account ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CashBalanceDto.prototype, "AccountId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'As of Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CashBalanceDto.prototype, "AsOfDate", void 0);
class CashSummaryDto {
}
exports.CashSummaryDto = CashSummaryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CashSummaryDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CashSummaryDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Account ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CashSummaryDto.prototype, "AccountId", void 0);
