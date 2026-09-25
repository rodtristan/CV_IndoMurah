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
exports.QueryVoucherDto = exports.VoucherResponseDto = exports.UpdateVoucherDto = exports.CreateVoucherDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateVoucherDto {
}
exports.CreateVoucherDto = CreateVoucherDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'code' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'typeId (VoucherType)' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateVoucherDto.prototype, "typeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'value' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateVoucherDto.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'minPurchaseAmount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateVoucherDto.prototype, "minPurchaseAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'maxDiscountAmount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateVoucherDto.prototype, "maxDiscountAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'startDate' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'endDate' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'usageLimit' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateVoucherDto.prototype, "usageLimit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'usedCount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateVoucherDto.prototype, "usedCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'isActive' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateVoucherDto.prototype, "isActive", void 0);
class UpdateVoucherDto {
}
exports.UpdateVoucherDto = UpdateVoucherDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'code' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVoucherDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVoucherDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'typeId (VoucherType)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateVoucherDto.prototype, "typeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'value' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateVoucherDto.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'minPurchaseAmount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateVoucherDto.prototype, "minPurchaseAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'maxDiscountAmount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateVoucherDto.prototype, "maxDiscountAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'startDate' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], UpdateVoucherDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'endDate' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], UpdateVoucherDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'usageLimit' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateVoucherDto.prototype, "usageLimit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'usedCount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateVoucherDto.prototype, "usedCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'isActive' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateVoucherDto.prototype, "isActive", void 0);
class VoucherResponseDto {
}
exports.VoucherResponseDto = VoucherResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'code' }),
    __metadata("design:type", String)
], VoucherResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'name' }),
    __metadata("design:type", String)
], VoucherResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'typeId (VoucherType)' }),
    __metadata("design:type", Number)
], VoucherResponseDto.prototype, "typeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'value' }),
    __metadata("design:type", Number)
], VoucherResponseDto.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'minPurchaseAmount' }),
    __metadata("design:type", Number)
], VoucherResponseDto.prototype, "minPurchaseAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'maxDiscountAmount' }),
    __metadata("design:type", Number)
], VoucherResponseDto.prototype, "maxDiscountAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'startDate' }),
    __metadata("design:type", Date)
], VoucherResponseDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'endDate' }),
    __metadata("design:type", Date)
], VoucherResponseDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'usageLimit' }),
    __metadata("design:type", Number)
], VoucherResponseDto.prototype, "usageLimit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'usedCount' }),
    __metadata("design:type", Number)
], VoucherResponseDto.prototype, "usedCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'isActive' }),
    __metadata("design:type", Boolean)
], VoucherResponseDto.prototype, "isActive", void 0);
class QueryVoucherDto {
}
exports.QueryVoucherDto = QueryVoucherDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fields to select' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryVoucherDto.prototype, "$select", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Relations to include' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryVoucherDto.prototype, "$include", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to skip' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryVoucherDto.prototype, "$skip", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to take' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryVoucherDto.prototype, "$take", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryVoucherDto.prototype, "$search", void 0);
