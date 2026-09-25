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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountingController = void 0;
const common_1 = require("@nestjs/common");
const accounting_service_1 = require("./accounting-service");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const accounting_dto_1 = require("./accounting.dto");
let AccountingController = class AccountingController {
    constructor(accountingService) {
        this.accountingService = accountingService;
    }
    async createAccount(dto, req) {
        return this.accountingService.createAccount(dto, req.user?.id || '1');
    }
    async getAccount(id) {
        return this.accountingService.getAccount(parseInt(id));
    }
    async listAccounts(dto) {
        return this.accountingService.listAccounts(dto);
    }
    async updateAccount(id, dto, req) {
        return this.accountingService.updateAccount(parseInt(id), dto, req.user?.id || '1');
    }
    async getAccountTree() {
        return this.accountingService.getAccountTree();
    }
    async createJournalEntry(dto, req) {
        return this.accountingService.createJournalEntry(dto, req.user?.id || '1');
    }
    async getJournalEntry(id) {
        return this.accountingService.getJournalEntry(parseInt(id));
    }
    async listJournalEntries(dto) {
        return this.accountingService.listJournalEntries(dto);
    }
    async reverseJournalEntry(id, reversalDate, req) {
        return this.accountingService.reverseJournalEntry(parseInt(id), reversalDate, req.user?.id || '1');
    }
    async getGeneralLedger(dto) {
        return this.accountingService.getGeneralLedger(dto);
    }
    async getTrialBalance(dto) {
        return this.accountingService.getTrialBalance(dto);
    }
    async getBalanceSheet(dto) {
        return this.accountingService.getBalanceSheet(dto);
    }
    async getProfitAndLoss(dto) {
        return this.accountingService.getProfitAndLoss(dto);
    }
    async getCashFlowStatement(dto) {
        return this.accountingService.getCashFlowStatement(dto);
    }
    async getEquityChanges(dto) {
        return this.accountingService.getEquityChanges(dto);
    }
    async getCostOfGoodsSold(dto) {
        return this.accountingService.getCostOfGoodsSold(dto);
    }
    async calculateDepreciation(dto) {
        return this.accountingService.calculateDepreciation(dto);
    }
    async createClosingEntries(dto, req) {
        return this.accountingService.createClosingEntries(dto, req.user?.id || '1');
    }
    async createOpeningEntries(dto, req) {
        return this.accountingService.createOpeningEntries(dto, req.user?.id || '1');
    }
};
exports.AccountingController = AccountingController;
__decorate([
    (0, common_1.Post)('accounts'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [accounting_dto_1.CreateAccountDto, Object]),
    __metadata("design:returntype", Promise)
], AccountingController.prototype, "createAccount", null);
__decorate([
    (0, common_1.Get)('accounts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AccountingController.prototype, "getAccount", null);
__decorate([
    (0, common_1.Get)('accounts'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [accounting_dto_1.AccountFilterDto]),
    __metadata("design:returntype", Promise)
], AccountingController.prototype, "listAccounts", null);
__decorate([
    (0, common_1.Put)('accounts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, accounting_dto_1.UpdateAccountDto, Object]),
    __metadata("design:returntype", Promise)
], AccountingController.prototype, "updateAccount", null);
__decorate([
    (0, common_1.Get)('accounts/tree'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AccountingController.prototype, "getAccountTree", null);
__decorate([
    (0, common_1.Post)('journal'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [accounting_dto_1.CreateJournalEntryDto, Object]),
    __metadata("design:returntype", Promise)
], AccountingController.prototype, "createJournalEntry", null);
__decorate([
    (0, common_1.Get)('journal/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AccountingController.prototype, "getJournalEntry", null);
__decorate([
    (0, common_1.Get)('journal'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [accounting_dto_1.JournalEntryFilterDto]),
    __metadata("design:returntype", Promise)
], AccountingController.prototype, "listJournalEntries", null);
__decorate([
    (0, common_1.Post)('journal/:id/reverse'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reversalDate')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AccountingController.prototype, "reverseJournalEntry", null);
__decorate([
    (0, common_1.Get)('general-ledger'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [accounting_dto_1.GeneralLedgerFilterDto]),
    __metadata("design:returntype", Promise)
], AccountingController.prototype, "getGeneralLedger", null);
__decorate([
    (0, common_1.Get)('trial-balance'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [accounting_dto_1.TrialBalanceDto]),
    __metadata("design:returntype", Promise)
], AccountingController.prototype, "getTrialBalance", null);
__decorate([
    (0, common_1.Get)('balance-sheet'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [accounting_dto_1.BalanceSheetDto]),
    __metadata("design:returntype", Promise)
], AccountingController.prototype, "getBalanceSheet", null);
__decorate([
    (0, common_1.Get)('profit-loss'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [accounting_dto_1.ProfitLossDto]),
    __metadata("design:returntype", Promise)
], AccountingController.prototype, "getProfitAndLoss", null);
__decorate([
    (0, common_1.Get)('cash-flow'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [accounting_dto_1.CashFlowDto]),
    __metadata("design:returntype", Promise)
], AccountingController.prototype, "getCashFlowStatement", null);
__decorate([
    (0, common_1.Get)('equity-changes'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [accounting_dto_1.EquityChangeDto]),
    __metadata("design:returntype", Promise)
], AccountingController.prototype, "getEquityChanges", null);
__decorate([
    (0, common_1.Get)('cogs'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [accounting_dto_1.CostOfGoodsSoldDto]),
    __metadata("design:returntype", Promise)
], AccountingController.prototype, "getCostOfGoodsSold", null);
__decorate([
    (0, common_1.Get)('depreciation'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [accounting_dto_1.CalculateDepreciationDto]),
    __metadata("design:returntype", Promise)
], AccountingController.prototype, "calculateDepreciation", null);
__decorate([
    (0, common_1.Post)('closing'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [accounting_dto_1.ClosingEntryDto, Object]),
    __metadata("design:returntype", Promise)
], AccountingController.prototype, "createClosingEntries", null);
__decorate([
    (0, common_1.Post)('opening'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [accounting_dto_1.OpeningEntryDto, Object]),
    __metadata("design:returntype", Promise)
], AccountingController.prototype, "createOpeningEntries", null);
exports.AccountingController = AccountingController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/accounting'),
    __metadata("design:paramtypes", [accounting_service_1.AccountingService])
], AccountingController);
