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
exports.VoucherFilterDto = exports.ValiDateVoucherDto = exports.UpDateVoucherDto = exports.CreateVoucherDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateVoucherDto {
}
exports.CreateVoucherDto = CreateVoucherDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Voucher Code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "Code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Voucher Name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Voucher Type ID (1=Percent, 2=Fixed Amount)' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateVoucherDto.prototype, "TypeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Voucher value (percentage or fixed Amount)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], CreateVoucherDto.prototype, "Value", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Minimum purchase Amount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateVoucherDto.prototype, "MinPurchaseAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum discount Amount (for percentage)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateVoucherDto.prototype, "MaxDiscountAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Start Date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'End Date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Usage limit (how many times can be used)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateVoucherDto.prototype, "UsageLimit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Voucher Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "Description", void 0);
class UpDateVoucherDto {
}
exports.UpDateVoucherDto = UpDateVoucherDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Voucher Name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpDateVoucherDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpDateVoucherDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Usage limit' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpDateVoucherDto.prototype, "UsageLimit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpDateVoucherDto.prototype, "IsActive", void 0);
class ValiDateVoucherDto {
}
exports.ValiDateVoucherDto = ValiDateVoucherDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Voucher Code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ValiDateVoucherDto.prototype, "Code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Purchase Amount to valiDate against' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ValiDateVoucherDto.prototype, "PurchaseAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customer ID (for customer-specific vouchers)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ValiDateVoucherDto.prototype, "CustomerId", void 0);
class VoucherFilterDto {
}
exports.VoucherFilterDto = VoucherFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Active only' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], VoucherFilterDto.prototype, "ActiveOnly", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Valid only (within Date range)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], VoucherFilterDto.prototype, "ValidOnly", void 0);
