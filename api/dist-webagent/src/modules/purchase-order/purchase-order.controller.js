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
exports.PurchaseOrderController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const purchase_order_service_1 = require("./purchase-order.service");
const purchase_order_dto_1 = require("./dto/purchase-order.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../common/dto/api-response-dto");
const current_user_decorator_1 = require("../../common/decorators/current-user-decorator");
let PurchaseOrderController = class PurchaseOrderController {
    constructor(purchaseOrderService) {
        this.purchaseOrderService = purchaseOrderService;
    }
    async findAll(query) {
        const { data, total, skip, take } = await this.purchaseOrderService.findAll(query);
        return api_response_dto_1.ApiResponse.paginated(data, total, skip, take);
    }
    async findOne(id, query) {
        const data = await this.purchaseOrderService.findOne(id, query);
        if (!data)
            throw new common_1.NotFoundException('Purchase order not found');
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async create(dto, user) {
        const data = await this.purchaseOrderService.create(dto, user.id);
        return api_response_dto_1.ApiResponse.ok(data, 'Purchase order created successfully');
    }
    async update(id, dto) {
        const data = await this.purchaseOrderService.update(id, dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Purchase order updated successfully');
    }
    async delete(id) {
        await this.purchaseOrderService.delete(id);
        return api_response_dto_1.ApiResponse.ok({ id }, 'Purchase order deleted successfully');
    }
    async addItem(id, dto) {
        const data = await this.purchaseOrderService.addItem(id, dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Item added successfully');
    }
    async removeItem(id, itemId) {
        const data = await this.purchaseOrderService.removeItem(id, itemId);
        return api_response_dto_1.ApiResponse.ok(data, 'Item removed successfully');
    }
    async confirm(id) {
        const data = await this.purchaseOrderService.updateStatus(id, { StatusCode: 'CONFIRMED' });
        return api_response_dto_1.ApiResponse.ok(data, 'Purchase order confirmed');
    }
    async complete(id) {
        const data = await this.purchaseOrderService.updateStatus(id, { StatusCode: 'COMPLETED' });
        return api_response_dto_1.ApiResponse.ok(data, 'Purchase order completed');
    }
    async cancel(id) {
        const data = await this.purchaseOrderService.updateStatus(id, { StatusCode: 'CANCELLED' });
        return api_response_dto_1.ApiResponse.ok(data, 'Purchase order cancelled');
    }
    async updateStatus(id, dto) {
        const data = await this.purchaseOrderService.updateStatus(id, dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Status updated successfully');
    }
};
exports.PurchaseOrderController = PurchaseOrderController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all purchase orders (Smart Query supported)' }),
    (0, swagger_1.ApiQuery)({ name: '$select', required: false, description: 'Select fields' }),
    (0, swagger_1.ApiQuery)({ name: '$include', required: false, description: 'Include relations: supplier,items,creator' }),
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
], PurchaseOrderController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get purchase order by ID (Smart Query supported)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PurchaseOrderController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new purchase order' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [purchase_order_dto_1.CreatePurchaseOrderDto, Object]),
    __metadata("design:returntype", Promise)
], PurchaseOrderController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update purchase order' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, purchase_order_dto_1.UpdatePurchaseOrderDto]),
    __metadata("design:returntype", Promise)
], PurchaseOrderController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete draft purchase order' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PurchaseOrderController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/items'),
    (0, swagger_1.ApiOperation)({ summary: 'Add item to purchase order' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, purchase_order_dto_1.AddPurchaseOrderItemDto]),
    __metadata("design:returntype", Promise)
], PurchaseOrderController.prototype, "addItem", null);
__decorate([
    (0, common_1.Delete)(':id/items/:itemId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove item from purchase order' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('itemId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], PurchaseOrderController.prototype, "removeItem", null);
__decorate([
    (0, common_1.Put)(':id/confirm'),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm purchase order' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PurchaseOrderController.prototype, "confirm", null);
__decorate([
    (0, common_1.Put)(':id/complete'),
    (0, swagger_1.ApiOperation)({ summary: 'Complete purchase order' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PurchaseOrderController.prototype, "complete", null);
__decorate([
    (0, common_1.Put)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel purchase order' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PurchaseOrderController.prototype, "cancel", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update purchase order status' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, purchase_order_dto_1.UpdatePurchaseOrderStatusDto]),
    __metadata("design:returntype", Promise)
], PurchaseOrderController.prototype, "updateStatus", null);
exports.PurchaseOrderController = PurchaseOrderController = __decorate([
    (0, swagger_1.ApiTags)('Purchase Orders'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('PurchaseOrders'),
    __metadata("design:paramtypes", [purchase_order_service_1.PurchaseOrderService])
], PurchaseOrderController);
