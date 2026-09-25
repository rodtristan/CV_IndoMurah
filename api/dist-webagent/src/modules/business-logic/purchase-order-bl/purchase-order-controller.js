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
const purchase_order_service_1 = require("./purchase-order-service");
const purchase_order_dto_1 = require("./purchase-order.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../../common/dto/api-response-dto");
let PurchaseOrderController = class PurchaseOrderController {
    constructor(poService) {
        this.poService = poService;
    }
    async createPurchaseOrder(dto) {
        const userId = 'system';
        const data = await this.poService.createPurchaseOrder(dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Purchase order created successfully');
    }
    async listPurchaseOrders(dto) {
        const data = await this.poService.listPurchaseOrders(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getPurchaseOrder(id) {
        const data = await this.poService.getPurchaseOrder(id);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async approvePurchaseOrder(id) {
        const userId = 'system';
        const data = await this.poService.approvePurchaseOrder(id, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Purchase order approved');
    }
    async cancelPurchaseOrder(id, reason) {
        const userId = 'system';
        const data = await this.poService.cancelPurchaseOrder(id, userId, reason);
        return api_response_dto_1.ApiResponse.ok(data, 'Purchase order cancelled');
    }
    async recordDelivery(id, items) {
        const userId = 'system';
        const data = await this.poService.recordDelivery(id, items, userId);
        return api_response_dto_1.ApiResponse.ok(data);
    }
};
exports.PurchaseOrderController = PurchaseOrderController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create purchase order' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [purchase_order_dto_1.CreatePurchaseOrderDto]),
    __metadata("design:returntype", Promise)
], PurchaseOrderController.prototype, "createPurchaseOrder", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List purchase orders' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [purchase_order_dto_1.PurchaseOrderFilterDto]),
    __metadata("design:returntype", Promise)
], PurchaseOrderController.prototype, "listPurchaseOrders", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get purchase order by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PurchaseOrderController.prototype, "getPurchaseOrder", null);
__decorate([
    (0, common_1.Put)(':id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve purchase order' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PurchaseOrderController.prototype, "approvePurchaseOrder", null);
__decorate([
    (0, common_1.Put)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel purchase order' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], PurchaseOrderController.prototype, "cancelPurchaseOrder", null);
__decorate([
    (0, common_1.Post)(':id/delivery'),
    (0, swagger_1.ApiOperation)({ summary: 'Record delivery for purchase order' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('items')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Array]),
    __metadata("design:returntype", Promise)
], PurchaseOrderController.prototype, "recordDelivery", null);
exports.PurchaseOrderController = PurchaseOrderController = __decorate([
    (0, swagger_1.ApiTags)('Business Logic - Purchase Order'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/purchase-order'),
    __metadata("design:paramtypes", [purchase_order_service_1.PurchaseOrderService])
], PurchaseOrderController);
