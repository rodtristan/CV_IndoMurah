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
exports.StockBalanceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth-guard");
const stock_balance_service_1 = require("./stock-balance.service");
let StockBalanceController = class StockBalanceController {
    constructor(service) {
        this.service = service;
    }
    wh(b) {
        const n = Number(b?.warehouseId);
        return Number.isFinite(n) && n > 0 ? n : undefined;
    }
    async preview(body) {
        return { success: true, data: await this.service.preview(this.wh(body)) };
    }
    async apply(body) {
        return { success: true, data: await this.service.apply(this.wh(body), body?.productIds) };
    }
};
exports.StockBalanceController = StockBalanceController;
__decorate([
    (0, common_1.Post)('preview'),
    (0, swagger_1.ApiOperation)({ summary: 'Dry-run: per-product old vs recalculated stock balance' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StockBalanceController.prototype, "preview", null);
__decorate([
    (0, common_1.Post)('apply'),
    (0, swagger_1.ApiOperation)({ summary: 'Apply recalculated balances to Product.Stock / ProductStock (transaction)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StockBalanceController.prototype, "apply", null);
exports.StockBalanceController = StockBalanceController = __decorate([
    (0, swagger_1.ApiTags)('StockBalance'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('stock-balance'),
    __metadata("design:paramtypes", [stock_balance_service_1.StockBalanceService])
], StockBalanceController);
