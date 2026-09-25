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
exports.MemberCardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const member_card_service_1 = require("./member-card-service");
const member_card_dto_1 = require("./member-card.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../../common/dto/api-response-dto");
let MemberCardController = class MemberCardController {
    constructor(memberCardService) {
        this.memberCardService = memberCardService;
    }
    async createCard(dto) {
        const data = await this.memberCardService.createCard(dto, 'system');
        return api_response_dto_1.ApiResponse.ok(data, 'Member card created successfully');
    }
    async listCards(dto) {
        const data = await this.memberCardService.listCards(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getCardStats() {
        const data = await this.memberCardService.getCardStats();
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getCard(id) {
        const data = await this.memberCardService.getCard(id);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getCardByNumber(cardNumber) {
        const data = await this.memberCardService.getCardByNumber(cardNumber);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async updateCard(id, dto) {
        const data = await this.memberCardService.updateCard(id, dto, 'system');
        return api_response_dto_1.ApiResponse.ok(data, 'Card updated successfully');
    }
    async activateCard(id) {
        const data = await this.memberCardService.activateCard(id, 'system');
        return api_response_dto_1.ApiResponse.ok(data, 'Card activated successfully');
    }
    async deactivateCard(id) {
        const data = await this.memberCardService.deactivateCard(id, 'system');
        return api_response_dto_1.ApiResponse.ok(data, 'Card deactivated successfully');
    }
    async replaceCard(id, dto) {
        const data = await this.memberCardService.replaceCard(id, dto, 'system');
        return api_response_dto_1.ApiResponse.ok(data, 'Card replaced successfully');
    }
    async getBalance(id) {
        const data = await this.memberCardService.getBalance(id);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async topUp(id, dto) {
        const data = await this.memberCardService.topUp(id, dto, 'system');
        return api_response_dto_1.ApiResponse.ok(data, 'Top-up successful');
    }
    async withdraw(id, dto) {
        const data = await this.memberCardService.withdraw(id, dto, 'system');
        return api_response_dto_1.ApiResponse.ok(data, 'Withdrawal successful');
    }
    async transfer(id, dto) {
        const data = await this.memberCardService.transfer(id, dto, 'system');
        return api_response_dto_1.ApiResponse.ok(data, 'Transfer successful');
    }
    async getTransactions(id, dto) {
        const data = await this.memberCardService.getTransactions(id, dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getBalanceReport(dto) {
        const data = await this.memberCardService.getBalanceReport(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
};
exports.MemberCardController = MemberCardController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new member card' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [member_card_dto_1.CreateMemberCardDto]),
    __metadata("design:returntype", Promise)
], MemberCardController.prototype, "createCard", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List member cards' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [member_card_dto_1.MemberCardFilterDto]),
    __metadata("design:returntype", Promise)
], MemberCardController.prototype, "listCards", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get card statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MemberCardController.prototype, "getCardStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get card by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MemberCardController.prototype, "getCard", null);
__decorate([
    (0, common_1.Get)('number/:cardNumber'),
    (0, swagger_1.ApiOperation)({ summary: 'Get card by card number' }),
    __param(0, (0, common_1.Param)('cardNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MemberCardController.prototype, "getCardByNumber", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update member card' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, member_card_dto_1.UpdateMemberCardDto]),
    __metadata("design:returntype", Promise)
], MemberCardController.prototype, "updateCard", null);
__decorate([
    (0, common_1.Post)(':id/activate'),
    (0, swagger_1.ApiOperation)({ summary: 'Activate member card' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MemberCardController.prototype, "activateCard", null);
__decorate([
    (0, common_1.Post)(':id/deactivate'),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate member card' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MemberCardController.prototype, "deactivateCard", null);
__decorate([
    (0, common_1.Post)(':id/replace'),
    (0, swagger_1.ApiOperation)({ summary: 'Replace lost/damaged card' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, member_card_dto_1.ReplaceCardDto]),
    __metadata("design:returntype", Promise)
], MemberCardController.prototype, "replaceCard", null);
__decorate([
    (0, common_1.Get)(':id/balance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get card balance' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MemberCardController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Post)(':id/top-up'),
    (0, swagger_1.ApiOperation)({ summary: 'Top-up card balance' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, member_card_dto_1.CardTopUpDto]),
    __metadata("design:returntype", Promise)
], MemberCardController.prototype, "topUp", null);
__decorate([
    (0, common_1.Post)(':id/withdraw'),
    (0, swagger_1.ApiOperation)({ summary: 'Withdraw from card' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, member_card_dto_1.CardWithdrawDto]),
    __metadata("design:returntype", Promise)
], MemberCardController.prototype, "withdraw", null);
__decorate([
    (0, common_1.Post)(':id/transfer'),
    (0, swagger_1.ApiOperation)({ summary: 'Transfer balance to another card' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, member_card_dto_1.CardTransferDto]),
    __metadata("design:returntype", Promise)
], MemberCardController.prototype, "transfer", null);
__decorate([
    (0, common_1.Get)(':id/transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get card transaction history' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, member_card_dto_1.CardTransactionFilterDto]),
    __metadata("design:returntype", Promise)
], MemberCardController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Get)('reports/balance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get card balance report' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [member_card_dto_1.CardBalanceReportDto]),
    __metadata("design:returntype", Promise)
], MemberCardController.prototype, "getBalanceReport", null);
exports.MemberCardController = MemberCardController = __decorate([
    (0, swagger_1.ApiTags)('Member Card - Kartu Anggota'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/member-card'),
    __metadata("design:paramtypes", [member_card_service_1.MemberCardService])
], MemberCardController);
