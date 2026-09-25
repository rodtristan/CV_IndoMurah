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
exports.QueryNumberingDto = exports.NumberingResponseDto = exports.UpdateNumberingDto = exports.CreateNumberingDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateNumberingDto {
}
exports.CreateNumberingDto = CreateNumberingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Numbering type (e.g., sale, purchase, invoice)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNumberingDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Prefix before number (e.g., INV-)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNumberingDto.prototype, "prefix", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Last used number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateNumberingDto.prototype, "lastNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Suffix after number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNumberingDto.prototype, "suffix", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of digits (e.g., 4 = 0001)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateNumberingDto.prototype, "digitCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateNumberingDto.prototype, "isActive", void 0);
class UpdateNumberingDto {
}
exports.UpdateNumberingDto = UpdateNumberingDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Numbering type' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateNumberingDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Prefix before number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateNumberingDto.prototype, "prefix", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Last used number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateNumberingDto.prototype, "lastNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Suffix after number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateNumberingDto.prototype, "suffix", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of digits' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateNumberingDto.prototype, "digitCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateNumberingDto.prototype, "isActive", void 0);
class NumberingResponseDto {
}
exports.NumberingResponseDto = NumberingResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID' }),
    __metadata("design:type", Number)
], NumberingResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Numbering type' }),
    __metadata("design:type", String)
], NumberingResponseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Prefix' }),
    __metadata("design:type", String)
], NumberingResponseDto.prototype, "prefix", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last used number' }),
    __metadata("design:type", Number)
], NumberingResponseDto.prototype, "lastNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Suffix' }),
    __metadata("design:type", String)
], NumberingResponseDto.prototype, "suffix", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of digits' }),
    __metadata("design:type", Number)
], NumberingResponseDto.prototype, "digitCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Is active' }),
    __metadata("design:type", Boolean)
], NumberingResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created at' }),
    __metadata("design:type", Date)
], NumberingResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Updated at' }),
    __metadata("design:type", Date)
], NumberingResponseDto.prototype, "updatedAt", void 0);
class QueryNumberingDto {
}
exports.QueryNumberingDto = QueryNumberingDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fields to select' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryNumberingDto.prototype, "$select", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Relations to include' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryNumberingDto.prototype, "$include", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to skip' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryNumberingDto.prototype, "$skip", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to take' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryNumberingDto.prototype, "$take", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryNumberingDto.prototype, "$search", void 0);
