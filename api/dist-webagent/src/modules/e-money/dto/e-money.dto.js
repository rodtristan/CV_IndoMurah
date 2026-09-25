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
exports.UpdateEMoneyDto = exports.CreateEMoneyDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateEMoneyDto {
}
exports.CreateEMoneyDto = CreateEMoneyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'EMN001' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEMoneyDto.prototype, "Code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'GoPay' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEMoneyDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '081234567890' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEMoneyDto.prototype, "AccountNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'John Doe' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEMoneyDto.prototype, "AccountName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'E-Money provider for digital payments' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEMoneyDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateEMoneyDto.prototype, "IsActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateEMoneyDto.prototype, "SortOrder", void 0);
class UpdateEMoneyDto {
}
exports.UpdateEMoneyDto = UpdateEMoneyDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'GoPay' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateEMoneyDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '081234567890' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateEMoneyDto.prototype, "AccountNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'John Doe' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateEMoneyDto.prototype, "AccountName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'E-Money provider for digital payments' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateEMoneyDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateEMoneyDto.prototype, "IsActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateEMoneyDto.prototype, "SortOrder", void 0);
