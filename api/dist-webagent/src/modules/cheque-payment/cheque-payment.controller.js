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
exports.ChequePaymentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cheque_payment_service_1 = require("./cheque-payment.service");
const cheque_payment_dto_1 = require("./dto/cheque-payment.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth-guard");
const current_user_decorator_1 = require("../../common/decorators/current-user-decorator");
const api_response_dto_1 = require("../../common/dto/api-response-dto");
let ChequePaymentController = class ChequePaymentController {
    constructor(chequePaymentService) {
        this.chequePaymentService = chequePaymentService;
    }
    async create(dto, user) {
        const data = await this.chequePaymentService.create(dto, user.id);
        return api_response_dto_1.ApiResponse.ok(data, 'Cheque payment created successfully');
    }
    async findAll(dto) {
        const data = await this.chequePaymentService.findAll(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getCount(dto) {
        const data = await this.chequePaymentService.findAll(dto);
        return api_response_dto_1.ApiResponse.ok({ count: data.count });
    }
    async findById(id) {
        const data = await this.chequePaymentService.findById(id);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async update(id, dto) {
        const data = await this.chequePaymentService.update(id, dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Cheque payment updated successfully');
    }
    async clearCheque(id, dto, user) {
        const data = await this.chequePaymentService.clearCheque(id, dto, user.id);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async bounceCheque(id, dto, user) {
        const data = await this.chequePaymentService.bounceCheque(id, dto, user.id);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async cancelCheque(id, body, user) {
        const data = await this.chequePaymentService.cancelCheque(id, body.reason, user.id);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async delete(id) {
        const data = await this.chequePaymentService.delete(id);
        return api_response_dto_1.ApiResponse.ok(data);
    }
};
exports.ChequePaymentController = ChequePaymentController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new cheque payment' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cheque_payment_dto_1.CreateChequePaymentDto, Object]),
    __metadata("design:returntype", Promise)
], ChequePaymentController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all cheque payments with filters' }),
    (0, swagger_1.ApiQuery)({ name: 'Type', required: false, description: 'SALE or PURCHASE' }),
    (0, swagger_1.ApiQuery)({ name: 'Status', required: false, description: 'PENDING, CLEARED, BOUNCED, CANCELLED' }),
    (0, swagger_1.ApiQuery)({ name: 'BankId', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'StartDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'EndDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'Search', required: false }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cheque_payment_dto_1.ChequePaymentFilterDto]),
    __metadata("design:returntype", Promise)
], ChequePaymentController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('count'),
    (0, swagger_1.ApiOperation)({ summary: 'Get count of cheque payments' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cheque_payment_dto_1.ChequePaymentFilterDto]),
    __metadata("design:returntype", Promise)
], ChequePaymentController.prototype, "getCount", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get cheque payment by ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ChequePaymentController.prototype, "findById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update cheque payment' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, cheque_payment_dto_1.UpdateChequePaymentDto]),
    __metadata("design:returntype", Promise)
], ChequePaymentController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/clear'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark cheque as cleared' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, cheque_payment_dto_1.ClearChequeDto, Object]),
    __metadata("design:returntype", Promise)
], ChequePaymentController.prototype, "clearCheque", null);
__decorate([
    (0, common_1.Put)(':id/bounce'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark cheque as bounced' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, cheque_payment_dto_1.BounceChequeDto, Object]),
    __metadata("design:returntype", Promise)
], ChequePaymentController.prototype, "bounceCheque", null);
__decorate([
    (0, common_1.Put)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel cheque payment' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], ChequePaymentController.prototype, "cancelCheque", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete cheque payment' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ChequePaymentController.prototype, "delete", null);
exports.ChequePaymentController = ChequePaymentController = __decorate([
    (0, swagger_1.ApiTags)('Cheque Payment - Pembayaran Cek/Giro'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('cheque-payment'),
    __metadata("design:paramtypes", [cheque_payment_service_1.ChequePaymentService])
], ChequePaymentController);
