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
exports.BalanceRepairController = void 0;
const common_1 = require("@nestjs/common");
const balance_repair_service_1 = require("./balance-repair.service");
const balance_repair_dto_1 = require("./balance-repair.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth-guard");
const current_user_decorator_1 = require("../../common/decorators/current-user-decorator");
let BalanceRepairController = class BalanceRepairController {
    constructor(balanceRepairService) {
        this.balanceRepairService = balanceRepairService;
    }
    async checkDiscrepancies(dto) {
        return this.balanceRepairService.checkDiscrepancies(dto);
    }
    async getAccountBalance(accountId, asOfDate) {
        return this.balanceRepairService.getAccountBalance(accountId, asOfDate);
    }
    async getBalanceHistory(accountId, startDate, endDate) {
        return this.balanceRepairService.getBalanceHistory(accountId, startDate, endDate);
    }
    async repairBalance(dto, userId) {
        return this.balanceRepairService.repairBalance(dto, userId);
    }
};
exports.BalanceRepairController = BalanceRepairController;
__decorate([
    (0, common_1.Get)('balance-discrepancies'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [balance_repair_dto_1.BalanceCheckDto]),
    __metadata("design:returntype", Promise)
], BalanceRepairController.prototype, "checkDiscrepancies", null);
__decorate([
    (0, common_1.Get)('balance/:accountId'),
    __param(0, (0, common_1.Param)('accountId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('asOfDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], BalanceRepairController.prototype, "getAccountBalance", null);
__decorate([
    (0, common_1.Get)('balance-history/:accountId'),
    __param(0, (0, common_1.Param)('accountId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", Promise)
], BalanceRepairController.prototype, "getBalanceHistory", null);
__decorate([
    (0, common_1.Post)('repair-balance'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [balance_repair_dto_1.RepairBalanceDto, String]),
    __metadata("design:returntype", Promise)
], BalanceRepairController.prototype, "repairBalance", null);
exports.BalanceRepairController = BalanceRepairController = __decorate([
    (0, common_1.Controller)('accounting'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [balance_repair_service_1.BalanceRepairService])
], BalanceRepairController);
