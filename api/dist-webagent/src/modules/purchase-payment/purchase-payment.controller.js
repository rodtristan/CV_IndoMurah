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
exports.PurchasePaymentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const purchase_payment_service_1 = require("./purchase-payment.service");
const purchase_payment_dto_1 = require("./dto/purchase-payment.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth-guard");
const current_user_decorator_1 = require("../../common/decorators/current-user-decorator");
const api_response_dto_1 = require("../../common/dto/api-response-dto");
let PurchasePaymentController = class PurchasePaymentController {
    constructor(purchasePaymentService) {
        this.purchasePaymentService = purchasePaymentService;
    }
    async findAll(query) {
        const { data, total, skip, take } = await this.purchasePaymentService.findAll(query);
        return api_response_dto_1.ApiResponse.paginated(data, total, skip, take);
    }
    async list(query) {
        const { data, total, skip, take } = await this.purchasePaymentService.list(query);
        return api_response_dto_1.ApiResponse.paginated(data, total, skip, take);
    }
    async findOne(id, query) {
        const data = await this.purchasePaymentService.findOne(id, query);
        if (!data)
            throw new common_1.NotFoundException('Purchase payment not found');
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async findByPurchase(purchaseId, query) {
        const { data, total, skip, take } = await this.purchasePaymentService.findByPurchase(purchaseId, query);
        return api_response_dto_1.ApiResponse.paginated(data, total, skip, take);
    }
    async create(dto, user) {
        const data = await this.purchasePaymentService.create(dto, user.id);
        return api_response_dto_1.ApiResponse.ok(data, 'Purchase payment created successfully');
    }
    async update(id, dto, user) {
        const data = await this.purchasePaymentService.update(id, dto, user?.id);
        return api_response_dto_1.ApiResponse.ok(data, 'Purchase payment updated successfully');
    }
    async clear(id, user) {
        const data = await this.purchasePaymentService.clear(id, user?.id);
        return api_response_dto_1.ApiResponse.ok(data, 'Payment cleared');
    }
    async delete(id) {
        await this.purchasePaymentService.delete(id);
        return api_response_dto_1.ApiResponse.ok({ id }, 'Purchase payment deleted successfully');
    }
};
exports.PurchasePaymentController = PurchasePaymentController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all purchase payments (Smart Query supported)' }),
    (0, swagger_1.ApiQuery)({ name: '$select', required: false, description: 'Select fields' }),
    (0, swagger_1.ApiQuery)({ name: '$include', required: false, description: 'Include relations: purchase,creator' }),
    (0, swagger_1.ApiQuery)({ name: '$where[purchase_id]', required: false, description: 'Filter by purchase ID' }),
    (0, swagger_1.ApiQuery)({ name: '$search', required: false, description: 'Search keyword' }),
    (0, swagger_1.ApiQuery)({ name: '$orderBy[createdAt]', required: false, description: 'Sort: asc/desc' }),
    (0, swagger_1.ApiQuery)({ name: '$skip', required: false, description: 'Offset', type: Number }),
    (0, swagger_1.ApiQuery)({ name: '$take', required: false, description: 'Limit', type: Number }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PurchasePaymentController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('list'),
    (0, swagger_1.ApiOperation)({ summary: 'List payments with Purchase+party+method, filters: from,to,methodId,instrumentType,cleared,search,skip,take' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PurchasePaymentController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get purchase payment by ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PurchasePaymentController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('purchase/:purchaseId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payments for a purchase' }),
    __param(0, (0, common_1.Param)('purchaseId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PurchasePaymentController.prototype, "findByPurchase", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create purchase payment' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [purchase_payment_dto_1.CreatePurchasePaymentDto, Object]),
    __metadata("design:returntype", Promise)
], PurchasePaymentController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update purchase payment' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, purchase_payment_dto_1.UpdatePurchasePaymentDto, Object]),
    __metadata("design:returntype", Promise)
], PurchasePaymentController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/clear'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark cek/bg payment as cleared (lunas)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PurchasePaymentController.prototype, "clear", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete purchase payment' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PurchasePaymentController.prototype, "delete", null);
exports.PurchasePaymentController = PurchasePaymentController = __decorate([
    (0, swagger_1.ApiTags)('Purchase Payments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('PurchasePayments'),
    __metadata("design:paramtypes", [purchase_payment_service_1.PurchasePaymentService])
], PurchasePaymentController);
