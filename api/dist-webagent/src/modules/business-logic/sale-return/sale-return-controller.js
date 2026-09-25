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
const sale_return_service_1 = require("./sale-return-service");
const sale_return_dto_1 = require("./sale-return.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../../common/dto/api-response-dto");
let SaleReturnController = class SaleReturnController {
    constructor(saleReturnService) {
        this.saleReturnService = saleReturnService;
    }
    async lookupSales(dto) {
        const data = await this.saleReturnService.lookupSales(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getSaleItemsForReturn(saleId) {
        const data = await this.saleReturnService.getSaleItemsForReturn(saleId);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async createSaleReturn(dto) {
        const userId = 'system';
        const data = await this.saleReturnService.createSaleReturn(dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Sale return created successfully');
    }
    async listSaleReturns(dto) {
        const data = await this.saleReturnService.listSaleReturns(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getSaleReturnSummary(startDate, endDate) {
        const data = await this.saleReturnService.getSaleReturnSummary(startDate, endDate);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getSaleReturn(id) {
        const data = await this.saleReturnService.getSaleReturn(id);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async approveSaleReturn(id, dto) {
        const userId = 'system';
        const data = await this.saleReturnService.approveSaleReturn(id, dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Sale return approved');
    }
    async rejectSaleReturn(id, dto) {
        const userId = 'system';
        const data = await this.saleReturnService.rejectSaleReturn(id, dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Sale return rejected');
    }
};
exports.SaleReturnController = SaleReturnController;
__decorate([
    (0, common_1.Get)('lookup'),
    (0, swagger_1.ApiOperation)({ summary: 'Search/lookup sales eligible for return' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sale_return_dto_1.LookupSaleDto]),
    __metadata("design:returntype", Promise)
], SaleReturnController.prototype, "lookupSales", null);
__decorate([
    (0, common_1.Get)('sale/:saleId/items'),
    (0, swagger_1.ApiOperation)({ summary: 'Get sale items for return selection' }),
    __param(0, (0, common_1.Param)('saleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SaleReturnController.prototype, "getSaleItemsForReturn", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new sale return' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sale_return_dto_1.CreateSaleReturnDto]),
    __metadata("design:returntype", Promise)
], SaleReturnController.prototype, "createSaleReturn", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List sale returns' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sale_return_dto_1.SaleReturnFilterDto]),
    __metadata("design:returntype", Promise)
], SaleReturnController.prototype, "listSaleReturns", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get sale return summary report' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SaleReturnController.prototype, "getSaleReturnSummary", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get sale return by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SaleReturnController.prototype, "getSaleReturn", null);
__decorate([
    (0, common_1.Put)(':id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve sale return' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, sale_return_dto_1.ApproveSaleReturnDto]),
    __metadata("design:returntype", Promise)
], SaleReturnController.prototype, "approveSaleReturn", null);
__decorate([
    (0, common_1.Put)(':id/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject sale return' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, sale_return_dto_1.RejectSaleReturnDto]),
    __metadata("design:returntype", Promise)
], SaleReturnController.prototype, "rejectSaleReturn", null);
exports.SaleReturnController = SaleReturnController = __decorate([
    (0, swagger_1.ApiTags)('Sale Return - Retur Penjualan'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/sale-return'),
    __metadata("design:paramtypes", [sale_return_service_1.SaleReturnService])
], SaleReturnController);
