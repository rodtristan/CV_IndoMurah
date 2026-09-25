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
const purchase_return_service_1 = require("./purchase-return-service");
const purchase_return_dto_1 = require("./purchase-return.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../../common/dto/api-response-dto");
let PurchaseReturnController = class PurchaseReturnController {
    constructor(purchaseReturnService) {
        this.purchaseReturnService = purchaseReturnService;
    }
    async create(dto) {
        const data = await this.purchaseReturnService.create(dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Purchase return created successfully');
    }
    async findAll(dto) {
        const data = await this.purchaseReturnService.findAll(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async findById(id) {
        const data = await this.purchaseReturnService.findById(id);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async update(id, dto) {
        const data = await this.purchaseReturnService.update(id, dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Purchase return updated');
    }
    async approve(id, dto) {
        const data = await this.purchaseReturnService.approve(id, dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Purchase return approved');
    }
    async cancel(id, dto) {
        const data = await this.purchaseReturnService.cancel(id, dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Purchase return cancelled');
    }
    async delete(id) {
        await this.purchaseReturnService.delete(id);
        return api_response_dto_1.ApiResponse.ok(null, 'Purchase return deleted');
    }
};
exports.PurchaseReturnController = PurchaseReturnController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new purchase return (Retur Pembelian)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [purchase_return_dto_1.CreatePurchaseReturnDto]),
    __metadata("design:returntype", Promise)
], PurchaseReturnController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all purchase returns' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [purchase_return_dto_1.PurchaseReturnQueryDto]),
    __metadata("design:returntype", Promise)
], PurchaseReturnController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get purchase return by ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PurchaseReturnController.prototype, "findById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update purchase return' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, purchase_return_dto_1.UpDatePurchaseReturnDto]),
    __metadata("design:returntype", Promise)
], PurchaseReturnController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve purchase return (Buat credit note supplier)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, purchase_return_dto_1.ApprovePurchaseReturnDto]),
    __metadata("design:returntype", Promise)
], PurchaseReturnController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel purchase return' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, purchase_return_dto_1.CancelPurchaseReturnDto]),
    __metadata("design:returntype", Promise)
], PurchaseReturnController.prototype, "cancel", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete pending purchase return' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PurchaseReturnController.prototype, "delete", null);
exports.PurchaseReturnController = PurchaseReturnController = __decorate([
    (0, swagger_1.ApiTags)('Purchase Return - Retur Pembelian'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/purchase-return'),
    __metadata("design:paramtypes", [purchase_return_service_1.PurchaseReturnService])
], PurchaseReturnController);
