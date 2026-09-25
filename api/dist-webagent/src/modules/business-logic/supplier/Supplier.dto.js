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
exports.PaymentSupplierDebtDto = exports.AddSupplierDebtDto = exports.SupplierStatementDto = exports.SupplierFilterDto = exports.UpDateSupplierDto = exports.CreateSupplierDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateSupplierDto {
}
exports.CreateSupplierDto = CreateSupplierDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Supplier Code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSupplierDto.prototype, "Code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Supplier Name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSupplierDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Contact person Name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSupplierDto.prototype, "ContactPerson", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Phone number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSupplierDto.prototype, "Phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Email address' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateSupplierDto.prototype, "Email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Full address' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSupplierDto.prototype, "Address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Initial debt Amount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateSupplierDto.prototype, "TotalDebt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSupplierDto.prototype, "Notes", void 0);
class UpDateSupplierDto {
}
exports.UpDateSupplierDto = UpDateSupplierDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Supplier Name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpDateSupplierDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Contact person Name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpDateSupplierDto.prototype, "ContactPerson", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Phone number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpDateSupplierDto.prototype, "Phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Email address' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UpDateSupplierDto.prototype, "Email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Full address' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpDateSupplierDto.prototype, "Address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpDateSupplierDto.prototype, "Notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is active status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpDateSupplierDto.prototype, "IsActive", void 0);
class SupplierFilterDto {
}
exports.SupplierFilterDto = SupplierFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword (Name, Code, phone)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SupplierFilterDto.prototype, "Search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by active status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SupplierFilterDto.prototype, "IsActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Show only suppliers with outstanding debt' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SupplierFilterDto.prototype, "HasDebt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SupplierFilterDto.prototype, "Page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page size' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SupplierFilterDto.prototype, "Limit", void 0);
class SupplierStatementDto {
}
exports.SupplierStatementDto = SupplierStatementDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Supplier ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SupplierStatementDto.prototype, "SupplierId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Start Date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SupplierStatementDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'End Date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SupplierStatementDto.prototype, "EndDate", void 0);
class AddSupplierDebtDto {
}
exports.AddSupplierDebtDto = AddSupplierDebtDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Supplier ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AddSupplierDebtDto.prototype, "SupplierId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Amount to add' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], AddSupplierDebtDto.prototype, "Amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference Type' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddSupplierDebtDto.prototype, "ReferenceType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AddSupplierDebtDto.prototype, "ReferenceId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddSupplierDebtDto.prototype, "Notes", void 0);
class PaymentSupplierDebtDto {
}
exports.PaymentSupplierDebtDto = PaymentSupplierDebtDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Supplier ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PaymentSupplierDebtDto.prototype, "SupplierId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment Amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], PaymentSupplierDebtDto.prototype, "Amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment method ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PaymentSupplierDebtDto.prototype, "PaymentMethodId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaymentSupplierDebtDto.prototype, "ReferenceNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaymentSupplierDebtDto.prototype, "Notes", void 0);
