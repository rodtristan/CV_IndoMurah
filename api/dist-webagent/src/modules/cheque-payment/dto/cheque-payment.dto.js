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
exports.ChequePaymentFilterDto = exports.BounceChequeDto = exports.ClearChequeDto = exports.UpdateChequePaymentDto = exports.CreateChequePaymentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateChequePaymentDto {
}
exports.CreateChequePaymentDto = CreateChequePaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Type: SALE or PURCHASE' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChequePaymentDto.prototype, "Type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference type: SALE_PAYMENT, PURCHASE_PAYMENT' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChequePaymentDto.prototype, "ReferenceType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateChequePaymentDto.prototype, "ReferenceId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Bank ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateChequePaymentDto.prototype, "BankId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Cheque number' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChequePaymentDto.prototype, "ChequeNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Cheque date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateChequePaymentDto.prototype, "ChequeDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Due date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateChequePaymentDto.prototype, "DueDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], CreateChequePaymentDto.prototype, "Amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChequePaymentDto.prototype, "Notes", void 0);
class UpdateChequePaymentDto {
}
exports.UpdateChequePaymentDto = UpdateChequePaymentDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Bank ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateChequePaymentDto.prototype, "BankId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Cheque number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateChequePaymentDto.prototype, "ChequeNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Due date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateChequePaymentDto.prototype, "DueDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateChequePaymentDto.prototype, "Notes", void 0);
class ClearChequeDto {
}
exports.ClearChequeDto = ClearChequeDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Cleared date (default: today)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ClearChequeDto.prototype, "ClearedDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClearChequeDto.prototype, "Notes", void 0);
class BounceChequeDto {
}
exports.BounceChequeDto = BounceChequeDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Bounced date (default: today)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BounceChequeDto.prototype, "BouncedDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reason for bouncing' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BounceChequeDto.prototype, "Reason", void 0);
class ChequePaymentFilterDto {
}
exports.ChequePaymentFilterDto = ChequePaymentFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Type: SALE, PURCHASE' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChequePaymentFilterDto.prototype, "Type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status: PENDING, CLEARED, BOUNCED, CANCELLED' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChequePaymentFilterDto.prototype, "Status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Bank ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ChequePaymentFilterDto.prototype, "BankId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ChequePaymentFilterDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ChequePaymentFilterDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search: cheque number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChequePaymentFilterDto.prototype, "Search", void 0);
