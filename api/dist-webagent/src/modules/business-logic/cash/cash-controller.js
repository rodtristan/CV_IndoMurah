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
exports.CashController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cash_service_1 = require("./cash-service");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const cash_dto_1 = require("./cash.dto");
let CashController = class CashController {
    constructor(cashService) {
        this.cashService = cashService;
    }
    async recordCashIn(dto) {
        return this.cashService.recordCashIn(dto, 'system');
    }
    async listCashIn(dto) {
        return this.cashService.listCashIn(dto);
    }
    async recordCashOut(dto) {
        return this.cashService.recordCashOut(dto, 'system');
    }
    async listCashOut(dto) {
        return this.cashService.listCashOut(dto);
    }
    async transferCash(dto) {
        return this.cashService.transferCash(dto, 'system');
    }
    async listCashTransfers(dto) {
        return this.cashService.listCashTransfers(dto);
    }
    async getCashBalance(dto) {
        return this.cashService.getCashBalance(dto);
    }
    async getCashFlowReport(dto) {
        return this.cashService.getCashFlowReport(dto);
    }
};
exports.CashController = CashController;
__decorate([
    (0, common_1.Post)('in'),
    (0, swagger_1.ApiOperation)({ summary: 'Record cash in' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cash_dto_1.RecordCashInDto]),
    __metadata("design:returntype", Promise)
], CashController.prototype, "recordCashIn", null);
__decorate([
    (0, common_1.Get)('in/list'),
    (0, swagger_1.ApiOperation)({ summary: 'List cash in records' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cash_dto_1.CashFlowFilterDto]),
    __metadata("design:returntype", Promise)
], CashController.prototype, "listCashIn", null);
__decorate([
    (0, common_1.Post)('out'),
    (0, swagger_1.ApiOperation)({ summary: 'Record cash out' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cash_dto_1.RecordCashOutDto]),
    __metadata("design:returntype", Promise)
], CashController.prototype, "recordCashOut", null);
__decorate([
    (0, common_1.Get)('out/list'),
    (0, swagger_1.ApiOperation)({ summary: 'List cash out records' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cash_dto_1.CashFlowFilterDto]),
    __metadata("design:returntype", Promise)
], CashController.prototype, "listCashOut", null);
__decorate([
    (0, common_1.Post)('transfer'),
    (0, swagger_1.ApiOperation)({ summary: 'Transfer cash between accounts' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cash_dto_1.TransferCashDto]),
    __metadata("design:returntype", Promise)
], CashController.prototype, "transferCash", null);
__decorate([
    (0, common_1.Get)('transfer/list'),
    (0, swagger_1.ApiOperation)({ summary: 'List cash transfers' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cash_dto_1.CashFlowFilterDto]),
    __metadata("design:returntype", Promise)
], CashController.prototype, "listCashTransfers", null);
__decorate([
    (0, common_1.Get)('balance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get cash balance for accounts' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cash_dto_1.CashBalanceDto]),
    __metadata("design:returntype", Promise)
], CashController.prototype, "getCashBalance", null);
__decorate([
    (0, common_1.Get)('report/flow'),
    (0, swagger_1.ApiOperation)({ summary: 'Get cash flow report' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cash_dto_1.CashSummaryDto]),
    __metadata("design:returntype", Promise)
], CashController.prototype, "getCashFlowReport", null);
exports.CashController = CashController = __decorate([
    (0, swagger_1.ApiTags)('Business Logic - Cash Management'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/cash'),
    __metadata("design:paramtypes", [cash_service_1.CashService])
], CashController);
