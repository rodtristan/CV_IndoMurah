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
exports.POSController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const pos_service_1 = require("./pos-service");
const pos_dto_1 = require("./pos.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../../common/dto/api-response-dto");
let POSController = class POSController {
    constructor(posService) {
        this.posService = posService;
    }
    async searchProducts(dto) {
        const data = await this.posService.searchProducts(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async searchByBarcode(dto) {
        const data = await this.posService.searchByBarcode(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async quickPriceCheck(dto) {
        const data = await this.posService.quickPriceCheck(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async openCart(sessionId, dto) {
        const data = await this.posService.openCart(sessionId, dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Cart opened successfully');
    }
    async addToCart(sessionId, dto) {
        const data = await this.posService.addToCart(sessionId, dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Item added to cart');
    }
    async updateCartItem(sessionId, productId, dto) {
        const data = await this.posService.updateCartItem(sessionId, productId, dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Cart item updated');
    }
    async removeFromCart(sessionId, productId) {
        const data = await this.posService.removeFromCart(sessionId, productId);
        return api_response_dto_1.ApiResponse.ok(data, 'Item removed from cart');
    }
    async getCart(sessionId) {
        const data = await this.posService.getCart(sessionId);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async clearCart(sessionId) {
        const data = await this.posService.clearCart(sessionId);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async holdTransaction(sessionId, dto) {
        const data = await this.posService.holdTransaction(sessionId, dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Transaction held');
    }
    async resumeTransaction(sessionId, dto) {
        const data = await this.posService.resumeTransaction(sessionId, dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Transaction resumed');
    }
    async listHeldTransactions() {
        const data = await this.posService.listHeldTransactions();
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async applyVoucher(dto) {
        const data = await this.posService.applyVoucher(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async completeTransaction(sessionId, dto) {
        const data = await this.posService.completeTransaction(sessionId, dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Transaction completed successfully');
    }
};
exports.POSController = POSController;
__decorate([
    (0, common_1.Get)('products/search'),
    (0, swagger_1.ApiOperation)({ summary: 'Search products for POS display' }),
    (0, swagger_1.ApiHeader)({ name: 'X-Session-Id', description: 'POS session ID for cart operations' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pos_dto_1.ProductSearchDto]),
    __metadata("design:returntype", Promise)
], POSController.prototype, "searchProducts", null);
__decorate([
    (0, common_1.Get)('products/barcode'),
    (0, swagger_1.ApiOperation)({ summary: 'Search product by barcode (Scanner lookup)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pos_dto_1.BarcodeSearchDto]),
    __metadata("design:returntype", Promise)
], POSController.prototype, "searchByBarcode", null);
__decorate([
    (0, common_1.Get)('products/price-check'),
    (0, swagger_1.ApiOperation)({ summary: 'Quick price check with quantity and customer pricing' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pos_dto_1.QuickPriceCheckDto]),
    __metadata("design:returntype", Promise)
], POSController.prototype, "quickPriceCheck", null);
__decorate([
    (0, common_1.Post)('cart/open'),
    (0, swagger_1.ApiOperation)({ summary: 'Open new POS cart session' }),
    (0, swagger_1.ApiHeader)({ name: 'X-Session-Id', description: 'Unique session ID for this POS instance', required: true }),
    __param(0, (0, common_1.Headers)('x-session-id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pos_dto_1.OpenTransactionDto]),
    __metadata("design:returntype", Promise)
], POSController.prototype, "openCart", null);
__decorate([
    (0, common_1.Post)('cart/add'),
    (0, swagger_1.ApiOperation)({ summary: 'Add product to cart' }),
    __param(0, (0, common_1.Headers)('x-session-id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], POSController.prototype, "addToCart", null);
__decorate([
    (0, common_1.Put)('cart/item/:productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update cart item quantity/price' }),
    __param(0, (0, common_1.Headers)('x-session-id')),
    __param(1, (0, common_1.Param)('productId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, pos_dto_1.UpdateCartItemDto]),
    __metadata("design:returntype", Promise)
], POSController.prototype, "updateCartItem", null);
__decorate([
    (0, common_1.Delete)('cart/item/:productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove item from cart' }),
    __param(0, (0, common_1.Headers)('x-session-id')),
    __param(1, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], POSController.prototype, "removeFromCart", null);
__decorate([
    (0, common_1.Get)('cart'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current cart summary' }),
    __param(0, (0, common_1.Headers)('x-session-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], POSController.prototype, "getCart", null);
__decorate([
    (0, common_1.Delete)('cart'),
    (0, swagger_1.ApiOperation)({ summary: 'Clear current cart' }),
    __param(0, (0, common_1.Headers)('x-session-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], POSController.prototype, "clearCart", null);
__decorate([
    (0, common_1.Post)('cart/hold'),
    (0, swagger_1.ApiOperation)({ summary: 'Hold current transaction (Simpan transaksi sementara)' }),
    __param(0, (0, common_1.Headers)('x-session-id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pos_dto_1.HoldTransactionDto]),
    __metadata("design:returntype", Promise)
], POSController.prototype, "holdTransaction", null);
__decorate([
    (0, common_1.Post)('cart/resume'),
    (0, swagger_1.ApiOperation)({ summary: 'Resume held transaction' }),
    __param(0, (0, common_1.Headers)('x-session-id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pos_dto_1.ResumeTransactionDto]),
    __metadata("design:returntype", Promise)
], POSController.prototype, "resumeTransaction", null);
__decorate([
    (0, common_1.Get)('holds'),
    (0, swagger_1.ApiOperation)({ summary: 'List all held transactions' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], POSController.prototype, "listHeldTransactions", null);
__decorate([
    (0, common_1.Post)('voucher/apply'),
    (0, swagger_1.ApiOperation)({ summary: 'Apply voucher code to transaction' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pos_dto_1.ApplyVoucherDto]),
    __metadata("design:returntype", Promise)
], POSController.prototype, "applyVoucher", null);
__decorate([
    (0, common_1.Post)('transaction/complete'),
    (0, swagger_1.ApiOperation)({ summary: 'Complete POS transaction (Finalize sale)' }),
    __param(0, (0, common_1.Headers)('x-session-id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], POSController.prototype, "completeTransaction", null);
exports.POSController = POSController = __decorate([
    (0, swagger_1.ApiTags)('POS - Point of Sale'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/pos'),
    __metadata("design:paramtypes", [pos_service_1.POSService])
], POSController);
