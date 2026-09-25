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
exports.LoyaltyController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const loyalty_service_1 = require("./loyalty-service");
const loyalty_dto_1 = require("./loyalty.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../../common/dto/api-response-dto");
let LoyaltyController = class LoyaltyController {
    constructor(loyaltyService) {
        this.loyaltyService = loyaltyService;
    }
    async getPointSettings() {
        const data = await this.loyaltyService.getPointSettings();
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async updatePointSettings(dto) {
        const userId = 'system';
        const data = await this.loyaltyService.updatePointSettings(dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Point settings updated');
    }
    async calculatePoints(dto) {
        const data = await this.loyaltyService.calculatePoints(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async awardPoints(dto) {
        const userId = 'system';
        const data = await this.loyaltyService.awardPoints(dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Points awarded successfully');
    }
    async getCustomerPoints(customerId) {
        const data = await this.loyaltyService.getCustomerPoints(customerId);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async redeemPoints(customerId, dto) {
        const userId = 'system';
        const data = await this.loyaltyService.redeemPoints(customerId, dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Points redeemed successfully');
    }
    async listRedemptions(dto) {
        const data = await this.loyaltyService.listRedemptions(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getLoyaltyStats(startDate, endDate) {
        const data = await this.loyaltyService.getLoyaltyStats(startDate, endDate);
        return api_response_dto_1.ApiResponse.ok(data);
    }
};
exports.LoyaltyController = LoyaltyController;
__decorate([
    (0, common_1.Get)('settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Get point settings' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LoyaltyController.prototype, "getPointSettings", null);
__decorate([
    (0, common_1.Patch)('settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Update point settings' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [loyalty_dto_1.UpDatePointSettingsDto]),
    __metadata("design:returntype", Promise)
], LoyaltyController.prototype, "updatePointSettings", null);
__decorate([
    (0, common_1.Post)('calculate'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate points for transaction' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [loyalty_dto_1.CalculatePointsDto]),
    __metadata("design:returntype", Promise)
], LoyaltyController.prototype, "calculatePoints", null);
__decorate([
    (0, common_1.Post)('award'),
    (0, swagger_1.ApiOperation)({ summary: 'Award points to customer' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [loyalty_dto_1.AwardPointsDto]),
    __metadata("design:returntype", Promise)
], LoyaltyController.prototype, "awardPoints", null);
__decorate([
    (0, common_1.Get)('customer/:customerId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get customer points summary' }),
    __param(0, (0, common_1.Param)('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], LoyaltyController.prototype, "getCustomerPoints", null);
__decorate([
    (0, common_1.Post)('customer/:customerId/redeem'),
    (0, swagger_1.ApiOperation)({ summary: 'Redeem customer points' }),
    __param(0, (0, common_1.Param)('customerId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, loyalty_dto_1.RedeemPointsDto]),
    __metadata("design:returntype", Promise)
], LoyaltyController.prototype, "redeemPoints", null);
__decorate([
    (0, common_1.Get)('redemptions'),
    (0, swagger_1.ApiOperation)({ summary: 'List point redemptions' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [loyalty_dto_1.RedemptionFilterDto]),
    __metadata("design:returntype", Promise)
], LoyaltyController.prototype, "listRedemptions", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get loyalty program statistics' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LoyaltyController.prototype, "getLoyaltyStats", null);
exports.LoyaltyController = LoyaltyController = __decorate([
    (0, swagger_1.ApiTags)('Loyalty - Loyalty & Poin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/loyalty'),
    __metadata("design:paramtypes", [loyalty_service_1.LoyaltyService])
], LoyaltyController);
