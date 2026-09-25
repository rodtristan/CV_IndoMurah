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
exports.StockTransferController = void 0;
const common_1 = require("@nestjs/common");
const stock_transfer_service_1 = require("./stock-transfer-service");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const current_user_decorator_1 = require("../../../common/decorators/current-user-decorator");
const stock_transfer_dto_1 = require("./stock-transfer.dto");
let StockTransferController = class StockTransferController {
    constructor(stockTransferService) {
        this.stockTransferService = stockTransferService;
    }
    async createStockTransfer(dto, userId) {
        return this.stockTransferService.createStockTransfer(dto, userId);
    }
    async listStockTransfers(dto) {
        return this.stockTransferService.listStockTransfers(dto);
    }
    async getStockTransferSummary(dto) {
        return this.stockTransferService.getStockTransferSummary(dto);
    }
    async getStockTransfer(id) {
        return this.stockTransferService.getStockTransfer(id);
    }
    async completeStockTransfer(id, userId) {
        return this.stockTransferService.completeStockTransfer(id, userId);
    }
    async cancelStockTransfer(id, userId) {
        return this.stockTransferService.cancelStockTransfer(id, userId);
    }
};
exports.StockTransferController = StockTransferController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [stock_transfer_dto_1.CreateStockTransferDto, String]),
    __metadata("design:returntype", Promise)
], StockTransferController.prototype, "createStockTransfer", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [stock_transfer_dto_1.StockTransferFilterDto]),
    __metadata("design:returntype", Promise)
], StockTransferController.prototype, "listStockTransfers", null);
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [stock_transfer_dto_1.StockTransferSummaryDto]),
    __metadata("design:returntype", Promise)
], StockTransferController.prototype, "getStockTransferSummary", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StockTransferController.prototype, "getStockTransfer", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], StockTransferController.prototype, "completeStockTransfer", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], StockTransferController.prototype, "cancelStockTransfer", null);
exports.StockTransferController = StockTransferController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/stock-transfers'),
    __metadata("design:paramtypes", [stock_transfer_service_1.StockTransferService])
], StockTransferController);
