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
exports.PurchaseController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const purchase_service_1 = require("./purchase.service");
const purchase_dto_1 = require("./dto/purchase.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth-guard");
const current_user_decorator_1 = require("../../common/decorators/current-user-decorator");
const api_response_dto_1 = require("../../common/dto/api-response-dto");
let PurchaseController = class PurchaseController {
    constructor(purchaseService) {
        this.purchaseService = purchaseService;
    }
    async findAll(query) {
        const { data, total, skip, take } = await this.purchaseService.findAll(query);
        return api_response_dto_1.ApiResponse.paginated(data, total, skip, take);
    }
    async findOne(id, query) {
        const data = await this.purchaseService.findOne(id, query);
        if (!data)
            throw new common_1.NotFoundException('Purchase not found');
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getReport(query) {
        const result = await this.purchaseService.getReport(query);
        return api_response_dto_1.ApiResponse.ok(result);
    }
    async create(dto, user) {
        const data = await this.purchaseService.create(dto, user.id);
        return api_response_dto_1.ApiResponse.ok(data, 'Purchase created successfully');
    }
    async update(id, dto, user) {
        const data = await this.purchaseService.update(id, dto, user?.id);
        return api_response_dto_1.ApiResponse.ok(data, 'Purchase updated successfully');
    }
    async confirm(id, user) {
        const data = await this.purchaseService.updateStatus(id, { StatusCode: 'CONFIRMED' }, user?.id);
        return api_response_dto_1.ApiResponse.ok(data, 'Purchase confirmed');
    }
    async complete(id, user) {
        const data = await this.purchaseService.updateStatus(id, { StatusCode: 'COMPLETED' }, user?.id);
        return api_response_dto_1.ApiResponse.ok(data, 'Purchase completed');
    }
    async cancel(id, user) {
        const data = await this.purchaseService.updateStatus(id, { StatusCode: 'CANCELLED' }, user?.id);
        return api_response_dto_1.ApiResponse.ok(data, 'Purchase cancelled');
    }
    async updateStatus(id, dto, user) {
        const data = await this.purchaseService.updateStatus(id, dto, user?.id);
        return api_response_dto_1.ApiResponse.ok(data, 'Status updated successfully');
    }
    async delete(id, user) {
        await this.purchaseService.delete(id, user?.id);
        return api_response_dto_1.ApiResponse.ok({ id }, 'Purchase deleted successfully');
    }
};
exports.PurchaseController = PurchaseController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all purchases (Smart Query supported)' }),
    (0, swagger_1.ApiQuery)({ name: '$select', required: false, description: 'Select fields' }),
    (0, swagger_1.ApiQuery)({ name: '$include', required: false, description: 'Include relations: supplier,warehouse,items' }),
    (0, swagger_1.ApiQuery)({ name: '$where[status]', required: false, description: 'Filter by status' }),
    (0, swagger_1.ApiQuery)({ name: '$where[paymentStatus]', required: false, description: 'Filter by payment status' }),
    (0, swagger_1.ApiQuery)({ name: '$where[supplier_id]', required: false, description: 'Filter by supplier' }),
    (0, swagger_1.ApiQuery)({ name: '$search', required: false, description: 'Search keyword' }),
    (0, swagger_1.ApiQuery)({ name: '$orderBy[createdAt]', required: false, description: 'Sort: asc/desc' }),
    (0, swagger_1.ApiQuery)({ name: '$skip', required: false, description: 'Offset', type: Number }),
    (0, swagger_1.ApiQuery)({ name: '$take', required: false, description: 'Limit', type: Number }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PurchaseController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get purchase by ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PurchaseController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('report/summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get purchase summary report' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PurchaseController.prototype, "getReport", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create purchase' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [purchase_dto_1.CreatePurchaseDto, Object]),
    __metadata("design:returntype", Promise)
], PurchaseController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update purchase' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, purchase_dto_1.UpdatePurchaseDto, Object]),
    __metadata("design:returntype", Promise)
], PurchaseController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/confirm'),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm purchase' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PurchaseController.prototype, "confirm", null);
__decorate([
    (0, common_1.Put)(':id/complete'),
    (0, swagger_1.ApiOperation)({ summary: 'Complete purchase' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PurchaseController.prototype, "complete", null);
__decorate([
    (0, common_1.Put)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel purchase' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PurchaseController.prototype, "cancel", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update purchase status' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, purchase_dto_1.UpdateStatusDto, Object]),
    __metadata("design:returntype", Promise)
], PurchaseController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete draft purchase' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PurchaseController.prototype, "delete", null);
exports.PurchaseController = PurchaseController = __decorate([
    (0, swagger_1.ApiTags)('Purchases'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('purchases'),
    __metadata("design:paramtypes", [purchase_service_1.PurchaseService])
], PurchaseController);
