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
exports.SalePaymentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const sale_payment_service_1 = require("./sale-payment.service");
const sale_payment_dto_1 = require("./dto/sale-payment.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth-guard");
const current_user_decorator_1 = require("../../common/decorators/current-user-decorator");
const api_response_dto_1 = require("../../common/dto/api-response-dto");
let SalePaymentController = class SalePaymentController {
    constructor(salePaymentService) {
        this.salePaymentService = salePaymentService;
    }
    async findAll(query) {
        const { data, total, skip, take } = await this.salePaymentService.findAll(query);
        return api_response_dto_1.ApiResponse.paginated(data, total, skip, take);
    }
    async list(query) {
        const { data, total, skip, take } = await this.salePaymentService.list(query);
        return api_response_dto_1.ApiResponse.paginated(data, total, skip, take);
    }
    async findOne(id, query) {
        const data = await this.salePaymentService.findOne(id, query);
        if (!data)
            throw new common_1.NotFoundException('Sale payment not found');
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async findBySale(saleId, query) {
        const { data, total, skip, take } = await this.salePaymentService.findBySale(saleId, query);
        return api_response_dto_1.ApiResponse.paginated(data, total, skip, take);
    }
    async create(dto, user) {
        const data = await this.salePaymentService.create(dto, user.id);
        return api_response_dto_1.ApiResponse.ok(data, 'Sale payment created successfully');
    }
    async update(id, dto, user) {
        const data = await this.salePaymentService.update(id, dto, user?.id);
        return api_response_dto_1.ApiResponse.ok(data, 'Sale payment updated successfully');
    }
    async clear(id, user) {
        const data = await this.salePaymentService.clear(id, user?.id);
        return api_response_dto_1.ApiResponse.ok(data, 'Payment cleared');
    }
    async delete(id) {
        await this.salePaymentService.delete(id);
        return api_response_dto_1.ApiResponse.ok({ id }, 'Sale payment deleted successfully');
    }
};
exports.SalePaymentController = SalePaymentController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all sale payments (Smart Query supported)' }),
    (0, swagger_1.ApiQuery)({ name: '$select', required: false, description: 'Select fields' }),
    (0, swagger_1.ApiQuery)({ name: '$include', required: false, description: 'Include relations: sale,creator' }),
    (0, swagger_1.ApiQuery)({ name: '$where[sale_id]', required: false, description: 'Filter by sale ID' }),
    (0, swagger_1.ApiQuery)({ name: '$search', required: false, description: 'Search keyword' }),
    (0, swagger_1.ApiQuery)({ name: '$orderBy[createdAt]', required: false, description: 'Sort: asc/desc' }),
    (0, swagger_1.ApiQuery)({ name: '$skip', required: false, description: 'Offset', type: Number }),
    (0, swagger_1.ApiQuery)({ name: '$take', required: false, description: 'Limit', type: Number }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SalePaymentController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('list'),
    (0, swagger_1.ApiOperation)({ summary: 'List payments with Sale+party+method, filters: from,to,methodId,instrumentType,cleared,search,skip,take' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SalePaymentController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get sale payment by ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SalePaymentController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('sale/:saleId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payments for a sale' }),
    __param(0, (0, common_1.Param)('saleId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SalePaymentController.prototype, "findBySale", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create sale payment' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sale_payment_dto_1.CreateSalePaymentDto, Object]),
    __metadata("design:returntype", Promise)
], SalePaymentController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update sale payment' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, sale_payment_dto_1.UpdateSalePaymentDto, Object]),
    __metadata("design:returntype", Promise)
], SalePaymentController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/clear'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark cek/bg payment as cleared (lunas)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SalePaymentController.prototype, "clear", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete sale payment' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SalePaymentController.prototype, "delete", null);
exports.SalePaymentController = SalePaymentController = __decorate([
    (0, swagger_1.ApiTags)('Sale Payments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('SalePayments'),
    __metadata("design:paramtypes", [sale_payment_service_1.SalePaymentService])
], SalePaymentController);
