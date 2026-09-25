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
exports.TransferController = void 0;
const common_1 = require("@nestjs/common");
const transfer_service_1 = require("./transfer-service");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const current_user_decorator_1 = require("../../../common/decorators/current-user-decorator");
const transfer_dto_1 = require("./transfer.dto");
let TransferController = class TransferController {
    constructor(transferService) {
        this.transferService = transferService;
    }
    async createTransfer(dto, userId) {
        return this.transferService.createTransfer(dto, userId);
    }
    async listTransfers(dto) {
        return this.transferService.listTransfers(dto);
    }
    async getTransferSummary(dto) {
        return this.transferService.getTransferSummary(dto);
    }
    async getAccounts() {
        return this.transferService.getAccounts();
    }
    async getTransfer(id) {
        return this.transferService.getTransfer(id);
    }
    async deleteTransfer(id) {
        return this.transferService.deleteTransfer(id);
    }
};
exports.TransferController = TransferController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transfer_dto_1.CreateTransferDto, String]),
    __metadata("design:returntype", Promise)
], TransferController.prototype, "createTransfer", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transfer_dto_1.TransferFilterDto]),
    __metadata("design:returntype", Promise)
], TransferController.prototype, "listTransfers", null);
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transfer_dto_1.TransferSummaryDto]),
    __metadata("design:returntype", Promise)
], TransferController.prototype, "getTransferSummary", null);
__decorate([
    (0, common_1.Get)('accounts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TransferController.prototype, "getAccounts", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TransferController.prototype, "getTransfer", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TransferController.prototype, "deleteTransfer", null);
exports.TransferController = TransferController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/transfers'),
    __metadata("design:paramtypes", [transfer_service_1.TransferService])
], TransferController);
