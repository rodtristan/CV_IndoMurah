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
exports.QueryPayrollDto = exports.PayrollResponseDto = exports.UpdatePayrollDto = exports.CreatePayrollDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreatePayrollDto {
}
exports.CreatePayrollDto = CreatePayrollDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'code' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePayrollDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'employeeId' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePayrollDto.prototype, "employeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'period' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePayrollDto.prototype, "period", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'basicSalary' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePayrollDto.prototype, "basicSalary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'allowances' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePayrollDto.prototype, "allowances", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'deductions' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePayrollDto.prototype, "deductions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'overtimePay' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePayrollDto.prototype, "overtimePay", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'totalSalary' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePayrollDto.prototype, "totalSalary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'paymentDate', type: String, format: 'date-time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreatePayrollDto.prototype, "paymentDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePayrollDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'isPaid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePayrollDto.prototype, "isPaid", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'isActive' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePayrollDto.prototype, "isActive", void 0);
class UpdatePayrollDto {
}
exports.UpdatePayrollDto = UpdatePayrollDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'code' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePayrollDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'employeeId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePayrollDto.prototype, "employeeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'period' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePayrollDto.prototype, "period", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'basicSalary' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePayrollDto.prototype, "basicSalary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'allowances' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePayrollDto.prototype, "allowances", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'deductions' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePayrollDto.prototype, "deductions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'overtimePay' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePayrollDto.prototype, "overtimePay", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'totalSalary' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePayrollDto.prototype, "totalSalary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'paymentDate', type: String, format: 'date-time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], UpdatePayrollDto.prototype, "paymentDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePayrollDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'isPaid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePayrollDto.prototype, "isPaid", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'isActive' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePayrollDto.prototype, "isActive", void 0);
class PayrollResponseDto {
}
exports.PayrollResponseDto = PayrollResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'code' }),
    __metadata("design:type", String)
], PayrollResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'employeeId' }),
    __metadata("design:type", Number)
], PayrollResponseDto.prototype, "employeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'period' }),
    __metadata("design:type", String)
], PayrollResponseDto.prototype, "period", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'basicSalary' }),
    __metadata("design:type", Number)
], PayrollResponseDto.prototype, "basicSalary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'allowances' }),
    __metadata("design:type", Number)
], PayrollResponseDto.prototype, "allowances", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'deductions' }),
    __metadata("design:type", Number)
], PayrollResponseDto.prototype, "deductions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'overtimePay' }),
    __metadata("design:type", Number)
], PayrollResponseDto.prototype, "overtimePay", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'totalSalary' }),
    __metadata("design:type", Number)
], PayrollResponseDto.prototype, "totalSalary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'paymentDate' }),
    __metadata("design:type", Date)
], PayrollResponseDto.prototype, "paymentDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'notes' }),
    __metadata("design:type", String)
], PayrollResponseDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'isPaid' }),
    __metadata("design:type", Boolean)
], PayrollResponseDto.prototype, "isPaid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'isActive' }),
    __metadata("design:type", Boolean)
], PayrollResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'employee' }),
    __metadata("design:type", Object)
], PayrollResponseDto.prototype, "employee", void 0);
class QueryPayrollDto {
}
exports.QueryPayrollDto = QueryPayrollDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fields to select' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPayrollDto.prototype, "$select", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Relations to include' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPayrollDto.prototype, "$include", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to skip' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryPayrollDto.prototype, "$skip", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to take' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryPayrollDto.prototype, "$take", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPayrollDto.prototype, "$search", void 0);
