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
exports.TrialBalanceDto = exports.AccountBalanceDto = exports.CancelJournalEntryDto = exports.JournalEntryQueryDto = exports.UpDateJournalEntryDto = exports.CreateJournalEntryDto = exports.JournalEntryItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class JournalEntryItemDto {
}
exports.JournalEntryItemDto = JournalEntryItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Account ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], JournalEntryItemDto.prototype, "AccountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Debit Amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], JournalEntryItemDto.prototype, "Debit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Credit Amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], JournalEntryItemDto.prototype, "Credit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description for this line' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], JournalEntryItemDto.prototype, "Description", void 0);
class CreateJournalEntryDto {
}
exports.CreateJournalEntryDto = CreateJournalEntryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Entry Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateJournalEntryDto.prototype, "Date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Entry Type: GENERAL, ADJUSTMENT, CLOSING', example: 'GENERAL' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateJournalEntryDto.prototype, "Type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference Type (SALE, PURCHASE, etc)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJournalEntryDto.prototype, "ReferenceType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateJournalEntryDto.prototype, "ReferenceId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJournalEntryDto.prototype, "ReferenceNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJournalEntryDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Created by user ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateJournalEntryDto.prototype, "CreatedById", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Journal entry Items', type: [JournalEntryItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => JournalEntryItemDto),
    __metadata("design:type", Array)
], CreateJournalEntryDto.prototype, "Items", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJournalEntryDto.prototype, "Notes", void 0);
class UpDateJournalEntryDto {
}
exports.UpDateJournalEntryDto = UpDateJournalEntryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Entry Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpDateJournalEntryDto.prototype, "Date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpDateJournalEntryDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpDateJournalEntryDto.prototype, "Notes", void 0);
class JournalEntryQueryDto {
}
exports.JournalEntryQueryDto = JournalEntryQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], JournalEntryQueryDto.prototype, "Search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Entry Type' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], JournalEntryQueryDto.prototype, "Type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference Type' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], JournalEntryQueryDto.prototype, "ReferenceType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Account ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], JournalEntryQueryDto.prototype, "AccountId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], JournalEntryQueryDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], JournalEntryQueryDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page number', default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], JournalEntryQueryDto.prototype, "Page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Items per page', default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], JournalEntryQueryDto.prototype, "Limit", void 0);
class CancelJournalEntryDto {
}
exports.CancelJournalEntryDto = CancelJournalEntryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Cancellation reason' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CancelJournalEntryDto.prototype, "Reason", void 0);
class AccountBalanceDto {
}
exports.AccountBalanceDto = AccountBalanceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Account ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AccountBalanceDto.prototype, "AccountId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'As of Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AccountBalanceDto.prototype, "AsOfDate", void 0);
class TrialBalanceDto {
}
exports.TrialBalanceDto = TrialBalanceDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], TrialBalanceDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], TrialBalanceDto.prototype, "EndDate", void 0);
