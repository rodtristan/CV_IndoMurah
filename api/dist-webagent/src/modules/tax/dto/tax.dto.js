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
exports.QueryTaxDto = exports.TaxResponseDto = exports.UpdateTaxDto = exports.CreateTaxDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateTaxDto {
}
exports.CreateTaxDto = CreateTaxDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'code' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTaxDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTaxDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'rate' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTaxDto.prototype, "rate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTaxDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'isActive' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateTaxDto.prototype, "isActive", void 0);
class UpdateTaxDto {
}
exports.UpdateTaxDto = UpdateTaxDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'code' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTaxDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTaxDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'rate' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateTaxDto.prototype, "rate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTaxDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'isActive' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateTaxDto.prototype, "isActive", void 0);
class TaxResponseDto {
}
exports.TaxResponseDto = TaxResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'code' }),
    __metadata("design:type", String)
], TaxResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'name' }),
    __metadata("design:type", String)
], TaxResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'rate' }),
    __metadata("design:type", Number)
], TaxResponseDto.prototype, "rate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'description' }),
    __metadata("design:type", String)
], TaxResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'isActive' }),
    __metadata("design:type", Boolean)
], TaxResponseDto.prototype, "isActive", void 0);
class QueryTaxDto {
}
exports.QueryTaxDto = QueryTaxDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fields to select' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryTaxDto.prototype, "$select", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Relations to include' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryTaxDto.prototype, "$include", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to skip' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryTaxDto.prototype, "$skip", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to take' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryTaxDto.prototype, "$take", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryTaxDto.prototype, "$search", void 0);
