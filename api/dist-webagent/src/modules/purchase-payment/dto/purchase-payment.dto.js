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
exports.UpdatePurchasePaymentDto = exports.CreatePurchasePaymentDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreatePurchasePaymentDto {
}
exports.CreatePurchasePaymentDto = CreatePurchasePaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Purchase ID' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePurchasePaymentDto.prototype, "PurchaseID", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment method ID (tidak wajib bila InstrumentType DEPOSIT / UseDeposit)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePurchasePaymentDto.prototype, "MethodID", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment amount' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchasePaymentDto.prototype, "Amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchasePaymentDto.prototype, "ReferenceNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment date', type: String }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePurchasePaymentDto.prototype, "Date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'CASH | CEK | BG | DEPOSIT (DEPOSIT = bayar memakai saldo deposit)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['CASH', 'CEK', 'BG', 'DEPOSIT']),
    __metadata("design:type", String)
], CreatePurchasePaymentDto.prototype, "InstrumentType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'true = bayar memakai saldo deposit (sama dengan InstrumentType DEPOSIT)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePurchasePaymentDto.prototype, "UseDeposit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Due date (cek/bg)', type: String }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePurchasePaymentDto.prototype, "DueDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchasePaymentDto.prototype, "Notes", void 0);
class UpdatePurchasePaymentDto {
}
exports.UpdatePurchasePaymentDto = UpdatePurchasePaymentDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment method ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdatePurchasePaymentDto.prototype, "MethodID", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment amount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePurchasePaymentDto.prototype, "Amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePurchasePaymentDto.prototype, "ReferenceNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment date', type: String }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdatePurchasePaymentDto.prototype, "Date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'CASH | CEK | BG | DEPOSIT (DEPOSIT = bayar memakai saldo deposit)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['CASH', 'CEK', 'BG', 'DEPOSIT']),
    __metadata("design:type", String)
], UpdatePurchasePaymentDto.prototype, "InstrumentType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'true = bayar memakai saldo deposit (sama dengan InstrumentType DEPOSIT)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePurchasePaymentDto.prototype, "UseDeposit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Due date (cek/bg)', type: String }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdatePurchasePaymentDto.prototype, "DueDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePurchasePaymentDto.prototype, "Notes", void 0);
