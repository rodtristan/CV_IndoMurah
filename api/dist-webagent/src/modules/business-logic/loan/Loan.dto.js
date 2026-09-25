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
exports.LoanSummaryDto = exports.LoanFilterDto = exports.RecordInstallmentDto = exports.UpDateLoanDto = exports.CreateLoanDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateLoanDto {
}
exports.CreateLoanDto = CreateLoanDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Employee ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLoanDto.prototype, "EmployeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Loan Type ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLoanDto.prototype, "LoanTypeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Principal Amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateLoanDto.prototype, "PrincipalAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Interest rate (percentage)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateLoanDto.prototype, "InterestRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tenor in months' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateLoanDto.prototype, "TenorMonths", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateLoanDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLoanDto.prototype, "Notes", void 0);
class UpDateLoanDto {
}
exports.UpDateLoanDto = UpDateLoanDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpDateLoanDto.prototype, "Notes", void 0);
class RecordInstallmentDto {
}
exports.RecordInstallmentDto = RecordInstallmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Loan ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecordInstallmentDto.prototype, "LoanId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Installment Amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], RecordInstallmentDto.prototype, "Amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], RecordInstallmentDto.prototype, "PaymentDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordInstallmentDto.prototype, "Notes", void 0);
class LoanFilterDto {
}
exports.LoanFilterDto = LoanFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Employee ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LoanFilterDto.prototype, "EmployeeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Loan Type ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LoanFilterDto.prototype, "LoanTypeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LoanFilterDto.prototype, "StatusId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Show only active loans' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], LoanFilterDto.prototype, "ActiveOnly", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], LoanFilterDto.prototype, "Page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page size' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], LoanFilterDto.prototype, "Limit", void 0);
class LoanSummaryDto {
}
exports.LoanSummaryDto = LoanSummaryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Employee ID (optional)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LoanSummaryDto.prototype, "EmployeeId", void 0);
