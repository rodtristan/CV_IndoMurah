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
exports.UpdateCashOutDto = exports.CreateCashOutDto = exports.CashOutLineDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CashOutLineDto {
}
exports.CashOutLineDto = CashOutLineDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Kode akun rincian (penggunaan dana)' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CashOutLineDto.prototype, "accountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Jumlah rincian' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CashOutLineDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Keterangan rincian' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CashOutLineDto.prototype, "description", void 0);
class CreateCashOutDto {
}
exports.CreateCashOutDto = CreateCashOutDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Kode kas keluar (auto bila kosong)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCashOutDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Akun kas/bank sumber' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateCashOutDto.prototype, "accountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Jumlah' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCashOutDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Tanggal transaksi (ISO)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCashOutDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCashOutDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCashOutDto.prototype, "referenceType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateCashOutDto.prototype, "referenceId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [CashOutLineDto], description: 'Rincian akun lawan; total harus = amount. Default: Setting Perkiraan Biaya Lain' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CashOutLineDto),
    __metadata("design:type", Array)
], CreateCashOutDto.prototype, "lines", void 0);
class UpdateCashOutDto {
}
exports.UpdateCashOutDto = UpdateCashOutDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCashOutDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateCashOutDto.prototype, "accountId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateCashOutDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateCashOutDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCashOutDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCashOutDto.prototype, "referenceType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateCashOutDto.prototype, "referenceId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [CashOutLineDto] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CashOutLineDto),
    __metadata("design:type", Array)
], UpdateCashOutDto.prototype, "lines", void 0);
