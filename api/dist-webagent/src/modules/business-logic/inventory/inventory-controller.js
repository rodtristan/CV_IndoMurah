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
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const inventory_service_1 = require("./inventory-service");
const inventory_dto_1 = require("./inventory.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const current_user_decorator_1 = require("../../../common/decorators/current-user-decorator");
const api_response_dto_1 = require("../../../common/dto/api-response-dto");
let InventoryController = class InventoryController {
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    async createOpeningStock(dto, user) {
        const data = await this.inventoryService.createOpeningStock(dto, user.ID);
        return api_response_dto_1.ApiResponse.ok(data, 'Opening stock created successfully');
    }
    async transferStock(dto, user) {
        const data = await this.inventoryService.TransferStock(dto, user.ID);
        return api_response_dto_1.ApiResponse.ok(data, 'Stock transferred successfully');
    }
    async adjustStock(dto, user) {
        const data = await this.inventoryService.adjustStock(dto, user.ID);
        return api_response_dto_1.ApiResponse.ok(data, 'Stock adjusted successfully');
    }
    async performStockOpname(dto, user) {
        const data = await this.inventoryService.performStockOpName(dto, user.ID);
        return api_response_dto_1.ApiResponse.ok(data, 'Stock opname completed');
    }
    async getStockReport(dto) {
        const data = await this.inventoryService.getStockReport(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getStockValuation(dto) {
        const data = await this.inventoryService.getStockValuation(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async fixBalance(dto, user) {
        const data = await this.inventoryService.fixBalance(dto, user.ID);
        return api_response_dto_1.ApiResponse.ok(data, 'Stock balance fixed successfully');
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Post)('opening-stock'),
    (0, swagger_1.ApiOperation)({ summary: 'Initialize opening stock for products in a warehouse' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inventory_dto_1.CreateOpeningStockDto, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "createOpeningStock", null);
__decorate([
    (0, common_1.Post)('transfer'),
    (0, swagger_1.ApiOperation)({ summary: 'Transfer stock between warehouses' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inventory_dto_1.StockTransferDto, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "transferStock", null);
__decorate([
    (0, common_1.Post)('adjustment'),
    (0, swagger_1.ApiOperation)({ summary: 'Adjust stock (STOCK_IN, STOCK_OUT, CORRECTION)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inventory_dto_1.StockAdjustmentDto, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "adjustStock", null);
__decorate([
    (0, common_1.Post)('opname'),
    (0, swagger_1.ApiOperation)({ summary: 'Perform stock opname (stock take)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inventory_dto_1.StockOpNameDto, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "performStockOpname", null);
__decorate([
    (0, common_1.Get)('stock-report'),
    (0, swagger_1.ApiOperation)({ summary: 'Get stock movement report' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inventory_dto_1.StockReportDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getStockReport", null);
__decorate([
    (0, common_1.Get)('valuation-report'),
    (0, swagger_1.ApiOperation)({ summary: 'Get stock valuation report' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inventory_dto_1.ValuationReportDto]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getStockValuation", null);
__decorate([
    (0, common_1.Post)('fix-balance'),
    (0, swagger_1.ApiOperation)({ summary: 'Fix stock balance discrepancies' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inventory_dto_1.FixBalanceDto, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "fixBalance", null);
exports.InventoryController = InventoryController = __decorate([
    (0, swagger_1.ApiTags)('Inventory - Manajemen Stok'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/inventory'),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], InventoryController);
