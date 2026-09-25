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
exports.QueryLoanInstallmentDto = exports.LoanInstallmentResponseDto = exports.UpdateLoanInstallmentDto = exports.CreateLoanInstallmentDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateLoanInstallmentDto {
}
exports.CreateLoanInstallmentDto = CreateLoanInstallmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'loanId' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLoanInstallmentDto.prototype, "loanId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'period' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLoanInstallmentDto.prototype, "period", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'amount' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLoanInstallmentDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'principal' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLoanInstallmentDto.prototype, "principal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'interest' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLoanInstallmentDto.prototype, "interest", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'remainingBefore' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLoanInstallmentDto.prototype, "remainingBefore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'remainingAfter' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLoanInstallmentDto.prototype, "remainingAfter", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'paymentDate', type: String, format: 'date-time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateLoanInstallmentDto.prototype, "paymentDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLoanInstallmentDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'isActive' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateLoanInstallmentDto.prototype, "isActive", void 0);
class UpdateLoanInstallmentDto {
}
exports.UpdateLoanInstallmentDto = UpdateLoanInstallmentDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'loanId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateLoanInstallmentDto.prototype, "loanId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'period' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLoanInstallmentDto.prototype, "period", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'amount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateLoanInstallmentDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'principal' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateLoanInstallmentDto.prototype, "principal", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'interest' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateLoanInstallmentDto.prototype, "interest", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'remainingBefore' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateLoanInstallmentDto.prototype, "remainingBefore", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'remainingAfter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateLoanInstallmentDto.prototype, "remainingAfter", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'paymentDate', type: String, format: 'date-time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], UpdateLoanInstallmentDto.prototype, "paymentDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLoanInstallmentDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'isActive' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateLoanInstallmentDto.prototype, "isActive", void 0);
class LoanInstallmentResponseDto {
}
exports.LoanInstallmentResponseDto = LoanInstallmentResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'loanId' }),
    __metadata("design:type", Number)
], LoanInstallmentResponseDto.prototype, "loanId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'period' }),
    __metadata("design:type", String)
], LoanInstallmentResponseDto.prototype, "period", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'amount' }),
    __metadata("design:type", Number)
], LoanInstallmentResponseDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'principal' }),
    __metadata("design:type", Number)
], LoanInstallmentResponseDto.prototype, "principal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'interest' }),
    __metadata("design:type", Number)
], LoanInstallmentResponseDto.prototype, "interest", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'remainingBefore' }),
    __metadata("design:type", Number)
], LoanInstallmentResponseDto.prototype, "remainingBefore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'remainingAfter' }),
    __metadata("design:type", Number)
], LoanInstallmentResponseDto.prototype, "remainingAfter", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'paymentDate' }),
    __metadata("design:type", Date)
], LoanInstallmentResponseDto.prototype, "paymentDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'status' }),
    __metadata("design:type", String)
], LoanInstallmentResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'isActive' }),
    __metadata("design:type", Boolean)
], LoanInstallmentResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'loan' }),
    __metadata("design:type", Object)
], LoanInstallmentResponseDto.prototype, "loan", void 0);
class QueryLoanInstallmentDto {
}
exports.QueryLoanInstallmentDto = QueryLoanInstallmentDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fields to select' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryLoanInstallmentDto.prototype, "$select", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Relations to include' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryLoanInstallmentDto.prototype, "$include", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to skip' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryLoanInstallmentDto.prototype, "$skip", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to take' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryLoanInstallmentDto.prototype, "$take", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryLoanInstallmentDto.prototype, "$search", void 0);
