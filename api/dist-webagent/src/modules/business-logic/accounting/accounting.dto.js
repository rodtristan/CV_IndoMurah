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
exports.OpeningEntryDto = exports.ClosingEntryDto = exports.CalculateDepreciationDto = exports.DepreciationMethodDto = exports.CostOfGoodsSoldDto = exports.EquityChangeDto = exports.CashFlowDto = exports.ProfitLossDto = exports.BalanceSheetDto = exports.TrialBalanceDto = exports.GeneralLedgerFilterDto = exports.JournalEntryFilterDto = exports.CreateJournalEntryDto = exports.JournalEntryItemDto = exports.AccountFilterDto = exports.UpdateAccountDto = exports.CreateAccountDto = void 0;
const class_validator_1 = require("class-validator");
class CreateAccountDto {
}
exports.CreateAccountDto = CreateAccountDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAccountDto.prototype, "Code", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAccountDto.prototype, "Name", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateAccountDto.prototype, "AccountTypeId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateAccountDto.prototype, "ParentId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAccountDto.prototype, "Description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateAccountDto.prototype, "TaxRate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAccountDto.prototype, "IsActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAccountDto.prototype, "DepreciationMethod", void 0);
class UpdateAccountDto {
}
exports.UpdateAccountDto = UpdateAccountDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAccountDto.prototype, "Name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateAccountDto.prototype, "AccountTypeId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateAccountDto.prototype, "ParentId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAccountDto.prototype, "Description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateAccountDto.prototype, "TaxRate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAccountDto.prototype, "IsActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAccountDto.prototype, "DepreciationMethod", void 0);
class AccountFilterDto {
}
exports.AccountFilterDto = AccountFilterDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AccountFilterDto.prototype, "AccountTypeId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AccountFilterDto.prototype, "ParentId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AccountFilterDto.prototype, "IsActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AccountFilterDto.prototype, "Search", void 0);
class JournalEntryItemDto {
}
exports.JournalEntryItemDto = JournalEntryItemDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], JournalEntryItemDto.prototype, "AccountId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], JournalEntryItemDto.prototype, "DebitCredit", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], JournalEntryItemDto.prototype, "Amount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], JournalEntryItemDto.prototype, "Description", void 0);
class CreateJournalEntryDto {
}
exports.CreateJournalEntryDto = CreateJournalEntryDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateJournalEntryDto.prototype, "Date", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJournalEntryDto.prototype, "Reference", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJournalEntryDto.prototype, "Description", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateJournalEntryDto.prototype, "Items", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateJournalEntryDto.prototype, "SourceDocumentId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJournalEntryDto.prototype, "SourceDocumentType", void 0);
class JournalEntryFilterDto {
}
exports.JournalEntryFilterDto = JournalEntryFilterDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], JournalEntryFilterDto.prototype, "StartDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], JournalEntryFilterDto.prototype, "EndDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], JournalEntryFilterDto.prototype, "AccountId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], JournalEntryFilterDto.prototype, "Reference", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], JournalEntryFilterDto.prototype, "SourceDocumentType", void 0);
class GeneralLedgerFilterDto {
}
exports.GeneralLedgerFilterDto = GeneralLedgerFilterDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], GeneralLedgerFilterDto.prototype, "StartDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], GeneralLedgerFilterDto.prototype, "EndDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GeneralLedgerFilterDto.prototype, "AccountId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GeneralLedgerFilterDto.prototype, "AccountTypeId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], GeneralLedgerFilterDto.prototype, "ShowZeroBalance", void 0);
class TrialBalanceDto {
}
exports.TrialBalanceDto = TrialBalanceDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], TrialBalanceDto.prototype, "AsOfDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TrialBalanceDto.prototype, "WarehouseId", void 0);
class BalanceSheetDto {
}
exports.BalanceSheetDto = BalanceSheetDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BalanceSheetDto.prototype, "AsOfDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BalanceSheetDto.prototype, "ComparisonDate", void 0);
class ProfitLossDto {
}
exports.ProfitLossDto = ProfitLossDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ProfitLossDto.prototype, "StartDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ProfitLossDto.prototype, "EndDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProfitLossDto.prototype, "ComparisonStartDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProfitLossDto.prototype, "ComparisonEndDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProfitLossDto.prototype, "ReportType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProfitLossDto.prototype, "WarehouseId", void 0);
class CashFlowDto {
}
exports.CashFlowDto = CashFlowDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CashFlowDto.prototype, "StartDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CashFlowDto.prototype, "EndDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CashFlowDto.prototype, "Method", void 0);
class EquityChangeDto {
}
exports.EquityChangeDto = EquityChangeDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], EquityChangeDto.prototype, "StartDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], EquityChangeDto.prototype, "EndDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], EquityChangeDto.prototype, "AsOfDate", void 0);
class CostOfGoodsSoldDto {
}
exports.CostOfGoodsSoldDto = CostOfGoodsSoldDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CostOfGoodsSoldDto.prototype, "StartDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CostOfGoodsSoldDto.prototype, "EndDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CostOfGoodsSoldDto.prototype, "WarehouseId", void 0);
class DepreciationMethodDto {
}
exports.DepreciationMethodDto = DepreciationMethodDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DepreciationMethodDto.prototype, "AssetId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DepreciationMethodDto.prototype, "Method", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DepreciationMethodDto.prototype, "UsefulLife", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DepreciationMethodDto.prototype, "SalvageValue", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DepreciationMethodDto.prototype, "StartDate", void 0);
class CalculateDepreciationDto {
}
exports.CalculateDepreciationDto = CalculateDepreciationDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CalculateDepreciationDto.prototype, "AsOfDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CalculateDepreciationDto.prototype, "AssetId", void 0);
class ClosingEntryDto {
}
exports.ClosingEntryDto = ClosingEntryDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ClosingEntryDto.prototype, "PeriodEndDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ClosingEntryDto.prototype, "IncludeIncomeSummary", void 0);
class OpeningEntryDto {
}
exports.OpeningEntryDto = OpeningEntryDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], OpeningEntryDto.prototype, "PeriodStartDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OpeningEntryDto.prototype, "Description", void 0);
