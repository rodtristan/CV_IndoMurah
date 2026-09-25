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
exports.SaleReturnController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const sale_return_service_1 = require("./sale-return.service");
const sale_return_dto_1 = require("./dto/sale-return.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth-guard");
const current_user_decorator_1 = require("../../common/decorators/current-user-decorator");
const api_response_dto_1 = require("../../common/dto/api-response-dto");
let SaleReturnController = class SaleReturnController {
    constructor(saleReturnService) {
        this.saleReturnService = saleReturnService;
    }
    async findAll(query) {
        const { data, total, skip, take } = await this.saleReturnService.findAll(query);
        return api_response_dto_1.ApiResponse.paginated(data, total, skip, take);
    }
    async findOne(id, query) {
        const data = await this.saleReturnService.findOne(id, query);
        if (!data)
            throw new common_1.NotFoundException('Sale return not found');
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async create(dto, user) {
        const data = await this.saleReturnService.create(dto, user.id);
        return api_response_dto_1.ApiResponse.ok(data, 'Sale return created successfully');
    }
    async update(id, dto, user) {
        const data = await this.saleReturnService.update(id, dto, user?.id);
        return api_response_dto_1.ApiResponse.ok(data, 'Sale return updated successfully');
    }
    async confirm(id, user) {
        const data = await this.saleReturnService.updateStatus(id, { StatusCode: 'CONFIRMED' }, user?.id);
        return api_response_dto_1.ApiResponse.ok(data, 'Sale return confirmed');
    }
    async complete(id, user) {
        const data = await this.saleReturnService.updateStatus(id, { StatusCode: 'COMPLETED' }, user?.id);
        return api_response_dto_1.ApiResponse.ok(data, 'Sale return completed');
    }
    async cancel(id, user) {
        const data = await this.saleReturnService.updateStatus(id, { StatusCode: 'CANCELLED' }, user?.id);
        return api_response_dto_1.ApiResponse.ok(data, 'Sale return cancelled');
    }
    async updateStatus(id, dto, user) {
        const data = await this.saleReturnService.updateStatus(id, dto, user?.id);
        return api_response_dto_1.ApiResponse.ok(data, 'Status updated successfully');
    }
    async delete(id, user) {
        await this.saleReturnService.delete(id, user?.id);
        return api_response_dto_1.ApiResponse.ok({ id }, 'Sale return deleted successfully');
    }
};
exports.SaleReturnController = SaleReturnController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all sale returns (Smart Query supported)' }),
    (0, swagger_1.ApiQuery)({ name: '$select', required: false, description: 'Select fields' }),
    (0, swagger_1.ApiQuery)({ name: '$include', required: false, description: 'Include relations: sale,customer,returnItems' }),
    (0, swagger_1.ApiQuery)({ name: '$where[status]', required: false, description: 'Filter by status' }),
    (0, swagger_1.ApiQuery)({ name: '$where[customer_id]', required: false, description: 'Filter by customer' }),
    (0, swagger_1.ApiQuery)({ name: '$search', required: false, description: 'Search keyword' }),
    (0, swagger_1.ApiQuery)({ name: '$orderBy[createdAt]', required: false, description: 'Sort: asc/desc' }),
    (0, swagger_1.ApiQuery)({ name: '$skip', required: false, description: 'Offset', type: Number }),
    (0, swagger_1.ApiQuery)({ name: '$take', required: false, description: 'Limit', type: Number }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SaleReturnController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get sale return by ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SaleReturnController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create sale return' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sale_return_dto_1.CreateSaleReturnDto, Object]),
    __metadata("design:returntype", Promise)
], SaleReturnController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update sale return' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, sale_return_dto_1.UpdateSaleReturnDto, Object]),
    __metadata("design:returntype", Promise)
], SaleReturnController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/confirm'),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm sale return' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SaleReturnController.prototype, "confirm", null);
__decorate([
    (0, common_1.Put)(':id/complete'),
    (0, swagger_1.ApiOperation)({ summary: 'Complete sale return' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SaleReturnController.prototype, "complete", null);
__decorate([
    (0, common_1.Put)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel sale return' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SaleReturnController.prototype, "cancel", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update sale return status' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, sale_return_dto_1.UpdateSaleReturnStatusDto, Object]),
    __metadata("design:returntype", Promise)
], SaleReturnController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete draft sale return' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SaleReturnController.prototype, "delete", null);
exports.SaleReturnController = SaleReturnController = __decorate([
    (0, swagger_1.ApiTags)('Sale Returns'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('SaleReturns'),
    __metadata("design:paramtypes", [sale_return_service_1.SaleReturnService])
], SaleReturnController);
