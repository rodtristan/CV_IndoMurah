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
exports.SaleController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const sale_service_1 = require("./sale.service");
const sale_dto_1 = require("./dto/sale.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth-guard");
const current_user_decorator_1 = require("../../common/decorators/current-user-decorator");
const api_response_dto_1 = require("../../common/dto/api-response-dto");
let SaleController = class SaleController {
    constructor(saleService) {
        this.saleService = saleService;
    }
    async findAll(query) {
        const { data, total, skip, take } = await this.saleService.findAll(query);
        return api_response_dto_1.ApiResponse.paginated(data, total, skip, take);
    }
    async findOne(id, query) {
        const data = await this.saleService.findOne(id, query);
        if (!data)
            throw new common_1.NotFoundException('Sale not found');
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async create(dto, user) {
        const data = await this.saleService.create(dto, user.id);
        return api_response_dto_1.ApiResponse.ok(data, 'Sale created successfully');
    }
    async update(id, dto, user) {
        const data = await this.saleService.update(id, dto, user?.id);
        return api_response_dto_1.ApiResponse.ok(data, 'Sale updated successfully');
    }
    async payment(id, dto, user) {
        const data = await this.saleService.payment(id, dto, user.id);
        return api_response_dto_1.ApiResponse.ok(data, 'Payment recorded successfully');
    }
    async updateStatus(id, dto, user) {
        const data = await this.saleService.updateStatus(id, dto, user?.id);
        return api_response_dto_1.ApiResponse.ok(data, 'Sale status updated');
    }
    async updateShipping(id, dto) {
        const data = await this.saleService.updateShipping(id, dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Shipping info updated');
    }
    async cancel(id, user) {
        const data = await this.saleService.cancel(id, user?.id);
        return api_response_dto_1.ApiResponse.ok(data, 'Sale cancelled');
    }
    async delete(id, user) {
        await this.saleService.delete(id, user?.id);
        return api_response_dto_1.ApiResponse.ok({ id }, 'Sale deleted successfully');
    }
};
exports.SaleController = SaleController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all sales (Smart Query supported)' }),
    (0, swagger_1.ApiQuery)({ name: '$select', required: false, description: 'Select fields' }),
    (0, swagger_1.ApiQuery)({ name: '$include', required: false, description: 'Include relations: customer,salesPerson,saleItems,payments' }),
    (0, swagger_1.ApiQuery)({ name: '$where[paymentStatus]', required: false, description: 'Filter by status: PENDING,PAID,PARTIAL,INSTALMENT,CANCELLED' }),
    (0, swagger_1.ApiQuery)({ name: '$where[customerId]', required: false, description: 'Filter by customer ID', type: Number }),
    (0, swagger_1.ApiQuery)({ name: '$where[salesPersonId]', required: false, description: 'Filter by sales person ID', type: Number }),
    (0, swagger_1.ApiQuery)({ name: '$where[salePointId]', required: false, description: 'Filter by sale point ID', type: Number }),
    (0, swagger_1.ApiQuery)({ name: '$where[warehouseId]', required: false, description: 'Filter by warehouse ID', type: Number }),
    (0, swagger_1.ApiQuery)({ name: '$search', required: false, description: 'Search keyword' }),
    (0, swagger_1.ApiQuery)({ name: '$orderBy[createdAt]', required: false, description: 'Sort: asc/desc' }),
    (0, swagger_1.ApiQuery)({ name: '$skip', required: false, description: 'Offset', type: Number }),
    (0, swagger_1.ApiQuery)({ name: '$take', required: false, description: 'Limit', type: Number }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SaleController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get sale by ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SaleController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create sale (POS transaction)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sale_dto_1.CreateSaleDto, Object]),
    __metadata("design:returntype", Promise)
], SaleController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update sale' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, sale_dto_1.UpdateSaleDto, Object]),
    __metadata("design:returntype", Promise)
], SaleController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/payment'),
    (0, swagger_1.ApiOperation)({ summary: 'Add payment to sale' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, sale_dto_1.PaymentDto, Object]),
    __metadata("design:returntype", Promise)
], SaleController.prototype, "payment", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update sale payment status' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, sale_dto_1.UpdateStatusDto, Object]),
    __metadata("design:returntype", Promise)
], SaleController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Put)(':id/shipping'),
    (0, swagger_1.ApiOperation)({ summary: 'Update sale shipping info (Data Pengiriman)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, sale_dto_1.UpdateShippingDto]),
    __metadata("design:returntype", Promise)
], SaleController.prototype, "updateShipping", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel sale' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SaleController.prototype, "cancel", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete pending sale' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SaleController.prototype, "delete", null);
exports.SaleController = SaleController = __decorate([
    (0, swagger_1.ApiTags)('Sales'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('sales'),
    __metadata("design:paramtypes", [sale_service_1.SaleService])
], SaleController);
