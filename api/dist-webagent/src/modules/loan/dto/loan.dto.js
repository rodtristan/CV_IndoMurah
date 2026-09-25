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
exports.QueryLoanDto = exports.LoanResponseDto = exports.UpdateLoanDto = exports.CreateLoanDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateLoanDto {
}
exports.CreateLoanDto = CreateLoanDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'code' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLoanDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'employeeId' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLoanDto.prototype, "employeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'LoanType ID' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateLoanDto.prototype, "loanTypeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'principalAmount' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLoanDto.prototype, "principalAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'interestRate' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLoanDto.prototype, "interestRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'tenorMonths' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLoanDto.prototype, "tenorMonths", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'installmentAmount' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLoanDto.prototype, "installmentAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'totalAmount' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLoanDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'remainingAmount' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLoanDto.prototype, "remainingAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'startDate', type: String, format: 'date-time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateLoanDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'LoanStatus ID (default 1)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateLoanDto.prototype, "statusId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLoanDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'isActive' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateLoanDto.prototype, "isActive", void 0);
class UpdateLoanDto {
}
exports.UpdateLoanDto = UpdateLoanDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'code' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLoanDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'employeeId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateLoanDto.prototype, "employeeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'LoanType ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateLoanDto.prototype, "loanTypeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'principalAmount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateLoanDto.prototype, "principalAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'interestRate' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateLoanDto.prototype, "interestRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'tenorMonths' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateLoanDto.prototype, "tenorMonths", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'installmentAmount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateLoanDto.prototype, "installmentAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'totalAmount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateLoanDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'remainingAmount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateLoanDto.prototype, "remainingAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'startDate', type: String, format: 'date-time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], UpdateLoanDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'LoanStatus ID (default 1)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateLoanDto.prototype, "statusId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLoanDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'isActive' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateLoanDto.prototype, "isActive", void 0);
class LoanResponseDto {
}
exports.LoanResponseDto = LoanResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'code' }),
    __metadata("design:type", String)
], LoanResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'employeeId' }),
    __metadata("design:type", Number)
], LoanResponseDto.prototype, "employeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'loanType' }),
    __metadata("design:type", String)
], LoanResponseDto.prototype, "loanType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'principalAmount' }),
    __metadata("design:type", Number)
], LoanResponseDto.prototype, "principalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'interestRate' }),
    __metadata("design:type", Number)
], LoanResponseDto.prototype, "interestRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'tenorMonths' }),
    __metadata("design:type", Number)
], LoanResponseDto.prototype, "tenorMonths", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'installmentAmount' }),
    __metadata("design:type", Number)
], LoanResponseDto.prototype, "installmentAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'totalAmount' }),
    __metadata("design:type", Number)
], LoanResponseDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'remainingAmount' }),
    __metadata("design:type", Number)
], LoanResponseDto.prototype, "remainingAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'startDate' }),
    __metadata("design:type", Date)
], LoanResponseDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'status' }),
    __metadata("design:type", Object)
], LoanResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'notes' }),
    __metadata("design:type", String)
], LoanResponseDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'isActive' }),
    __metadata("design:type", Boolean)
], LoanResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'employee' }),
    __metadata("design:type", Object)
], LoanResponseDto.prototype, "employee", void 0);
class QueryLoanDto {
}
exports.QueryLoanDto = QueryLoanDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fields to select' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryLoanDto.prototype, "$select", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Relations to include' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryLoanDto.prototype, "$include", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to skip' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryLoanDto.prototype, "$skip", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to take' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryLoanDto.prototype, "$take", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryLoanDto.prototype, "$search", void 0);
