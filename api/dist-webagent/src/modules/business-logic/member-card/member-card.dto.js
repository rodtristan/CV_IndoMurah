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
exports.BulkCardDeactivationDto = exports.BulkCardActivationDto = exports.CardBalanceReportDto = exports.CardTransactionFilterDto = exports.MemberCardFilterDto = exports.ReplaceCardDto = exports.CardTransferDto = exports.CardWithdrawDto = exports.CardTopUpDto = exports.UpdateMemberCardDto = exports.CreateMemberCardDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateMemberCardDto {
}
exports.CreateMemberCardDto = CreateMemberCardDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Card number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateMemberCardDto.prototype, "CardNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateMemberCardDto.prototype, "CustomerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Card Type: STANDARD, SILVER, GOLD, PLATINUM' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMemberCardDto.prototype, "CardType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Initial deposit Amount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateMemberCardDto.prototype, "InitialDeposit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMemberCardDto.prototype, "Notes", void 0);
class UpdateMemberCardDto {
}
exports.UpdateMemberCardDto = UpdateMemberCardDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Card Type' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMemberCardDto.prototype, "CardType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateMemberCardDto.prototype, "IsActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMemberCardDto.prototype, "Notes", void 0);
class CardTopUpDto {
}
exports.CardTopUpDto = CardTopUpDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Top-up Amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CardTopUpDto.prototype, "Amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment method ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CardTopUpDto.prototype, "PaymentMethodId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CardTopUpDto.prototype, "ReferenceNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CardTopUpDto.prototype, "Notes", void 0);
class CardWithdrawDto {
}
exports.CardWithdrawDto = CardWithdrawDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Withdrawal Amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CardWithdrawDto.prototype, "Amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CardWithdrawDto.prototype, "ReferenceNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CardWithdrawDto.prototype, "Notes", void 0);
class CardTransferDto {
}
exports.CardTransferDto = CardTransferDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Target card ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CardTransferDto.prototype, "TargetCardId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transfer Amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CardTransferDto.prototype, "Amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CardTransferDto.prototype, "Notes", void 0);
class ReplaceCardDto {
}
exports.ReplaceCardDto = ReplaceCardDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reason for replacement' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ReplaceCardDto.prototype, "Reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReplaceCardDto.prototype, "Notes", void 0);
class MemberCardFilterDto {
}
exports.MemberCardFilterDto = MemberCardFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword (card number, customer Name)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MemberCardFilterDto.prototype, "Search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Card Type' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MemberCardFilterDto.prototype, "CardType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Active only' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], MemberCardFilterDto.prototype, "ActiveOnly", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customer group ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], MemberCardFilterDto.prototype, "CustomerGroupId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Low balance only (below minimum)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], MemberCardFilterDto.prototype, "LowBalanceOnly", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Minimum balance threshold for low balance filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], MemberCardFilterDto.prototype, "MinBalance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], MemberCardFilterDto.prototype, "Page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Items per page' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], MemberCardFilterDto.prototype, "Limit", void 0);
class CardTransactionFilterDto {
}
exports.CardTransactionFilterDto = CardTransactionFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Transaction Type: TOP_UP, WITHDRAW, PURCHASE, REFUND, TRANSFER_IN, TRANSFER_OUT' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CardTransactionFilterDto.prototype, "TransactionType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CardTransactionFilterDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CardTransactionFilterDto.prototype, "EndDate", void 0);
class CardBalanceReportDto {
}
exports.CardBalanceReportDto = CardBalanceReportDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'As of Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CardBalanceReportDto.prototype, "AsOfDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customer group ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CardBalanceReportDto.prototype, "CustomerGroupId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Minimum balance filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CardBalanceReportDto.prototype, "MinBalance", void 0);
class BulkCardActivationDto {
}
exports.BulkCardActivationDto = BulkCardActivationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Card IDs to activate', type: [Number] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    __metadata("design:type", Array)
], BulkCardActivationDto.prototype, "CardIds", void 0);
class BulkCardDeactivationDto {
}
exports.BulkCardDeactivationDto = BulkCardDeactivationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Card IDs to deactivate', type: [Number] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    __metadata("design:type", Array)
], BulkCardDeactivationDto.prototype, "CardIds", void 0);
