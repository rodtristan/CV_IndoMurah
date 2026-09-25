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
exports.PayrollSummaryDto = exports.PaymentPayrollDto = exports.PayrollFilterDto = exports.UpdatePayrollDto = exports.CreatePayrollDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreatePayrollDto {
}
exports.CreatePayrollDto = CreatePayrollDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Employee ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePayrollDto.prototype, "EmployeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payroll period (e.g., 2024-01)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePayrollDto.prototype, "Period", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Basic salary' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePayrollDto.prototype, "BasicSalary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Allowances' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePayrollDto.prototype, "Allowances", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Deductions' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePayrollDto.prototype, "Deductions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Overtime pay' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePayrollDto.prototype, "OvertimePay", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePayrollDto.prototype, "Notes", void 0);
class UpdatePayrollDto {
}
exports.UpdatePayrollDto = UpdatePayrollDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Allowances' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdatePayrollDto.prototype, "Allowances", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Deductions' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdatePayrollDto.prototype, "Deductions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Overtime pay' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdatePayrollDto.prototype, "OvertimePay", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePayrollDto.prototype, "Notes", void 0);
class PayrollFilterDto {
}
exports.PayrollFilterDto = PayrollFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Employee ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PayrollFilterDto.prototype, "EmployeeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Period filter (e.g., 2024-01)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PayrollFilterDto.prototype, "Period", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Show only unpaid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PayrollFilterDto.prototype, "UnpaidOnly", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], PayrollFilterDto.prototype, "Page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page size' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], PayrollFilterDto.prototype, "Limit", void 0);
class PaymentPayrollDto {
}
exports.PaymentPayrollDto = PaymentPayrollDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payroll ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PaymentPayrollDto.prototype, "PayrollId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], PaymentPayrollDto.prototype, "PaymentDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaymentPayrollDto.prototype, "Notes", void 0);
class PayrollSummaryDto {
}
exports.PayrollSummaryDto = PayrollSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Period (e.g., 2024-01)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PayrollSummaryDto.prototype, "Period", void 0);
