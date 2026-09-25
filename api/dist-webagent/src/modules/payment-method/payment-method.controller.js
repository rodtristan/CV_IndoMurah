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
exports.PaymentMethodController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payment_method_service_1 = require("./payment-method.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../common/dto/api-response-dto");
let PaymentMethodController = class PaymentMethodController {
    constructor(paymentMethodService) {
        this.paymentMethodService = paymentMethodService;
    }
    async findAll() {
        const data = await this.paymentMethodService.findAll();
        return api_response_dto_1.ApiResponse.ok(data);
    }
};
exports.PaymentMethodController = PaymentMethodController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get active payment methods (reference list)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentMethodController.prototype, "findAll", null);
exports.PaymentMethodController = PaymentMethodController = __decorate([
    (0, swagger_1.ApiTags)('Payment Methods'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('payment-methods'),
    __metadata("design:paramtypes", [payment_method_service_1.PaymentMethodService])
], PaymentMethodController);
