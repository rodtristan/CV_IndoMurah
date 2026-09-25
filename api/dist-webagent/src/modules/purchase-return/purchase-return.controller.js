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
exports.PurchaseReturnController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const purchase_return_service_1 = require("./purchase-return.service");
const purchase_return_dto_1 = require("./dto/purchase-return.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth-guard");
const current_user_decorator_1 = require("../../common/decorators/current-user-decorator");
const api_response_dto_1 = require("../../common/dto/api-response-dto");
let PurchaseReturnController = class PurchaseReturnController {
    constructor(purchaseReturnService) {
        this.purchaseReturnService = purchaseReturnService;
    }
    async findAll(query) {
        const { data, total, skip, take } = await this.purchaseReturnService.findAll(query);
        return api_response_dto_1.ApiResponse.paginated(data, total, skip, take);
    }
    async findOne(id, query) {
        const data = await this.purchaseReturnService.findOne(id, query);
        if (!data)
            throw new common_1.NotFoundException('Purchase return not found');
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async create(dto, user) {
        const data = await this.purchaseReturnService.create(dto, user.id);
        return api_response_dto_1.ApiResponse.ok(data, 'Purchase return created successfully');
    }
    async update(id, dto, user) {
        const data = await this.purchaseReturnService.update(id, dto, user?.id);
        return api_response_dto_1.ApiResponse.ok(data, 'Purchase return updated successfully');
    }
    async confirm(id, user) {
        const data = await this.purchaseReturnService.updateStatus(id, { StatusCode: 'CONFIRMED' }, user?.id);
        return api_response_dto_1.ApiResponse.ok(data, 'Purchase return confirmed');
    }
    async complete(id, user) {
        const data = await this.purchaseReturnService.updateStatus(id, { StatusCode: 'COMPLETED' }, user?.id);
        return api_response_dto_1.ApiResponse.ok(data, 'Purchase return completed');
    }
    async cancel(id, user) {
        const data = await this.purchaseReturnService.updateStatus(id, { StatusCode: 'CANCELLED' }, user?.id);
        return api_response_dto_1.ApiResponse.ok(data, 'Purchase return cancelled');
    }
    async updateStatus(id, dto, user) {
        const data = await this.purchaseReturnService.updateStatus(id, dto, user?.id);
        return api_response_dto_1.ApiResponse.ok(data, 'Status updated successfully');
    }
    async delete(id, user) {
        await this.purchaseReturnService.delete(id, user?.id);
        return api_response_dto_1.ApiResponse.ok({ id }, 'Purchase return deleted successfully');
    }
};
exports.PurchaseReturnController = PurchaseReturnController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all purchase returns (Smart Query supported)' }),
    (0, swagger_1.ApiQuery)({ name: '$select', required: false, description: 'Select fields' }),
    (0, swagger_1.ApiQuery)({ name: '$include', required: false, description: 'Include relations: purchase,supplier,returnItems' }),
    (0, swagger_1.ApiQuery)({ name: '$where[status]', required: false, description: 'Filter by status' }),
    (0, swagger_1.ApiQuery)({ name: '$where[supplier_id]', required: false, description: 'Filter by supplier' }),
    (0, swagger_1.ApiQuery)({ name: '$search', required: false, description: 'Search keyword' }),
    (0, swagger_1.ApiQuery)({ name: '$orderBy[createdAt]', required: false, description: 'Sort: asc/desc' }),
    (0, swagger_1.ApiQuery)({ name: '$skip', required: false, description: 'Offset', type: Number }),
    (0, swagger_1.ApiQuery)({ name: '$take', required: false, description: 'Limit', type: Number }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PurchaseReturnController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get purchase return by ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PurchaseReturnController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create purchase return' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [purchase_return_dto_1.CreatePurchaseReturnDto, Object]),
    __metadata("design:returntype", Promise)
], PurchaseReturnController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update purchase return' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, purchase_return_dto_1.UpdatePurchaseReturnDto, Object]),
    __metadata("design:returntype", Promise)
], PurchaseReturnController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/confirm'),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm purchase return' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PurchaseReturnController.prototype, "confirm", null);
__decorate([
    (0, common_1.Put)(':id/complete'),
    (0, swagger_1.ApiOperation)({ summary: 'Complete purchase return' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PurchaseReturnController.prototype, "complete", null);
__decorate([
    (0, common_1.Put)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel purchase return' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PurchaseReturnController.prototype, "cancel", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update purchase return status' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, purchase_return_dto_1.UpdatePurchaseReturnStatusDto, Object]),
    __metadata("design:returntype", Promise)
], PurchaseReturnController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete draft purchase return' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PurchaseReturnController.prototype, "delete", null);
exports.PurchaseReturnController = PurchaseReturnController = __decorate([
    (0, swagger_1.ApiTags)('Purchase Returns'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('PurchaseReturns'),
    __metadata("design:paramtypes", [purchase_return_service_1.PurchaseReturnService])
], PurchaseReturnController);
