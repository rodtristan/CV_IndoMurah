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
const purchase_service_1 = require("./purchase-service");
const purchase_dto_1 = require("./purchase.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../../common/dto/api-response-dto");
let PurchaseController = class PurchaseController {
    constructor(purchaseService) {
        this.purchaseService = purchaseService;
    }
    async createPurchaseOrder(dto) {
        const userId = 'system';
        const data = await this.purchaseService.createPurchaseOrder(dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Purchase order created successfully');
    }
    async listPurchaseOrders(dto) {
        const data = await this.purchaseService.listPurchaseOrders(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getPurchaseOrder(id) {
        const data = await this.purchaseService.getPurchaseOrder(id);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async updatePurchaseOrder(id, dto) {
        const userId = 'system';
        const data = await this.purchaseService.updatePurchaseOrder(id, dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Purchase order updated');
    }
    async updatePurchaseOrderStatus(id, statusCode) {
        const userId = 'system';
        const data = await this.purchaseService.updatePurchaseOrderStatus(id, statusCode, userId);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async createPurchase(dto) {
        const userId = 'system';
        const data = await this.purchaseService.createPurchase(dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Purchase created successfully');
    }
    async listPurchases(dto) {
        const data = await this.purchaseService.listPurchases(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getPurchase(id) {
        const data = await this.purchaseService.getPurchase(id);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async recordPurchasePayment(id, dto) {
        const userId = 'system';
        const data = await this.purchaseService.RecordPurchasePayment(id, dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Payment recorded successfully');
    }
    async recordBulkPurchasePayment(dto) {
        const userId = 'system';
        const data = await this.purchaseService.RecordBulkPurchasePayment(dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Bulk payment recorded successfully');
    }
    async createPurchaseReturn(dto) {
        const userId = 'system';
        const data = await this.purchaseService.createPurchaseReturn(dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Purchase return created successfully');
    }
    async approvePurchaseReturn(id) {
        const userId = 'system';
        const data = await this.purchaseService.approvePurchaseReturn(id, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Purchase return approved');
    }
    async getSupplierDebtSummary(supplierId) {
        const data = await this.purchaseService.getSupplierDebtSummary(supplierId);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async addSupplierDeposit(supplierId, dto) {
        const userId = 'system';
        const data = await this.purchaseService.addSupplierDeposit(supplierId, dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Supplier deposit added');
    }
    async useSupplierDeposit(supplierId, purchaseId, body) {
        const userId = 'system';
        const data = await this.purchaseService.useSupplierDeposit(supplierId, purchaseId, body.amount, userId);
        return api_response_dto_1.ApiResponse.ok(data);
    }
};
exports.PurchaseController = PurchaseController;
__decorate([
    (0, common_1.Post)('orders'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new Purchase Order' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [purchase_dto_1.CreatePurchaseOrderDto]),
    __metadata("design:returntype", Promise)
], PurchaseController.prototype, "createPurchaseOrder", null);
__decorate([
    (0, common_1.Get)('orders'),
    (0, swagger_1.ApiOperation)({ summary: 'List Purchase Orders' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [purchase_dto_1.PurchaseOrderFilterDto]),
    __metadata("design:returntype", Promise)
], PurchaseController.prototype, "listPurchaseOrders", null);
__decorate([
    (0, common_1.Get)('orders/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Purchase Order by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PurchaseController.prototype, "getPurchaseOrder", null);
__decorate([
    (0, common_1.Put)('orders/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update Purchase Order' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, purchase_dto_1.UpdatePurchaseOrderDto]),
    __metadata("design:returntype", Promise)
], PurchaseController.prototype, "updatePurchaseOrder", null);
__decorate([
    (0, common_1.Put)('orders/:id/status/:statusCode'),
    (0, swagger_1.ApiOperation)({ summary: 'Update Purchase Order Status (APPROVED/CANCELLED)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('statusCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], PurchaseController.prototype, "updatePurchaseOrderStatus", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create Purchase (Goods Receipt)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [purchase_dto_1.CreatePurchaseDto]),
    __metadata("design:returntype", Promise)
], PurchaseController.prototype, "createPurchase", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List Purchases' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [purchase_dto_1.PurchaseFilterDto]),
    __metadata("design:returntype", Promise)
], PurchaseController.prototype, "listPurchases", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Purchase by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PurchaseController.prototype, "getPurchase", null);
__decorate([
    (0, common_1.Post)(':id/payment'),
    (0, swagger_1.ApiOperation)({ summary: 'Record payment for purchase' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, purchase_dto_1.RecordPurchasePaymentDto]),
    __metadata("design:returntype", Promise)
], PurchaseController.prototype, "recordPurchasePayment", null);
__decorate([
    (0, common_1.Post)('bulk-payment'),
    (0, swagger_1.ApiOperation)({ summary: 'Record bulk payment for multiple purchases' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [purchase_dto_1.RecordBulkPurchasePaymentDto]),
    __metadata("design:returntype", Promise)
], PurchaseController.prototype, "recordBulkPurchasePayment", null);
__decorate([
    (0, common_1.Post)('returns'),
    (0, swagger_1.ApiOperation)({ summary: 'Create Purchase Return' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [purchase_dto_1.CreatePurchaseReturnDto]),
    __metadata("design:returntype", Promise)
], PurchaseController.prototype, "createPurchaseReturn", null);
__decorate([
    (0, common_1.Put)('returns/:id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve Purchase Return' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PurchaseController.prototype, "approvePurchaseReturn", null);
__decorate([
    (0, common_1.Get)('supplier/:supplierId/debt-summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get supplier debt summary' }),
    __param(0, (0, common_1.Param)('supplierId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PurchaseController.prototype, "getSupplierDebtSummary", null);
__decorate([
    (0, common_1.Post)('supplier/:supplierId/deposit'),
    (0, swagger_1.ApiOperation)({ summary: 'Add supplier deposit (uang muka)' }),
    __param(0, (0, common_1.Param)('supplierId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, purchase_dto_1.AddSupplierDepositDto]),
    __metadata("design:returntype", Promise)
], PurchaseController.prototype, "addSupplierDeposit", null);
__decorate([
    (0, common_1.Post)('supplier/:supplierId/use-deposit/:purchaseId'),
    (0, swagger_1.ApiOperation)({ summary: 'Use supplier deposit for purchase payment' }),
    __param(0, (0, common_1.Param)('supplierId')),
    __param(1, (0, common_1.Param)('purchaseId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], PurchaseController.prototype, "useSupplierDeposit", null);
exports.PurchaseController = PurchaseController = __decorate([
    (0, swagger_1.ApiTags)('Purchase - Pembelian'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/purchase'),
    __metadata("design:paramtypes", [purchase_service_1.PurchaseService])
], PurchaseController);
