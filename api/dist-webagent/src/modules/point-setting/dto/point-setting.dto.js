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
exports.QueryPointSettingDto = exports.PointSettingResponseDto = exports.UpdatePointSettingDto = exports.CreatePointSettingDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreatePointSettingDto {
}
exports.CreatePointSettingDto = CreatePointSettingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Setting name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePointSettingDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Points per Rupiah' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePointSettingDto.prototype, "pointsPerRupiah", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Minimum transaction amount' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePointSettingDto.prototype, "minimumTransaction", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePointSettingDto.prototype, "isActive", void 0);
class UpdatePointSettingDto {
}
exports.UpdatePointSettingDto = UpdatePointSettingDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Setting name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePointSettingDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Points per Rupiah' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePointSettingDto.prototype, "pointsPerRupiah", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Minimum transaction amount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePointSettingDto.prototype, "minimumTransaction", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePointSettingDto.prototype, "isActive", void 0);
class PointSettingResponseDto {
}
exports.PointSettingResponseDto = PointSettingResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID' }),
    __metadata("design:type", Number)
], PointSettingResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Setting name' }),
    __metadata("design:type", String)
], PointSettingResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Points per Rupiah' }),
    __metadata("design:type", Number)
], PointSettingResponseDto.prototype, "pointsPerRupiah", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Minimum transaction amount' }),
    __metadata("design:type", Number)
], PointSettingResponseDto.prototype, "minimumTransaction", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Is active' }),
    __metadata("design:type", Boolean)
], PointSettingResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created at' }),
    __metadata("design:type", Date)
], PointSettingResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Updated at' }),
    __metadata("design:type", Date)
], PointSettingResponseDto.prototype, "updatedAt", void 0);
class QueryPointSettingDto {
}
exports.QueryPointSettingDto = QueryPointSettingDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fields to select' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPointSettingDto.prototype, "$select", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Relations to include' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPointSettingDto.prototype, "$include", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to skip' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryPointSettingDto.prototype, "$skip", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to take' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryPointSettingDto.prototype, "$take", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPointSettingDto.prototype, "$search", void 0);
