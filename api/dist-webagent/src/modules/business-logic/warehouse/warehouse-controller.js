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
exports.WarehouseController = void 0;
const common_1 = require("@nestjs/common");
const warehouse_service_1 = require("./warehouse-service");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const current_user_decorator_1 = require("../../../common/decorators/current-user-decorator");
const warehouse_dto_1 = require("./warehouse.dto");
let WarehouseController = class WarehouseController {
    constructor(warehouseService) {
        this.warehouseService = warehouseService;
    }
    async createWarehouse(dto, userId) {
        return this.warehouseService.createWarehouse(dto, userId);
    }
    async listWarehouses(dto) {
        return this.warehouseService.listWarehouses(dto);
    }
    async getWarehouseSummary() {
        return this.warehouseService.getWarehouseSummary();
    }
    async getWarehouse(id) {
        return this.warehouseService.getWarehouse(id);
    }
    async getWarehouseStock(id, dto) {
        return this.warehouseService.getWarehouseStock(id, dto);
    }
    async updateWarehouse(id, dto, userId) {
        return this.warehouseService.updateWarehouse(id, dto, userId);
    }
    async deleteWarehouse(id) {
        return this.warehouseService.deleteWarehouse(id);
    }
    async createShelf(dto, userId) {
        return this.warehouseService.createShelf(dto, userId);
    }
    async listShelves(warehouseId) {
        return this.warehouseService.listShelves(warehouseId);
    }
    async updateShelf(id, dto) {
        return this.warehouseService.updateShelf(id, dto);
    }
};
exports.WarehouseController = WarehouseController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [warehouse_dto_1.CreateWarehouseDto, String]),
    __metadata("design:returntype", Promise)
], WarehouseController.prototype, "createWarehouse", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [warehouse_dto_1.WarehouseFilterDto]),
    __metadata("design:returntype", Promise)
], WarehouseController.prototype, "listWarehouses", null);
__decorate([
    (0, common_1.Get)('summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WarehouseController.prototype, "getWarehouseSummary", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], WarehouseController.prototype, "getWarehouse", null);
__decorate([
    (0, common_1.Get)(':id/stock'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, warehouse_dto_1.WarehouseStockDto]),
    __metadata("design:returntype", Promise)
], WarehouseController.prototype, "getWarehouseStock", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, warehouse_dto_1.UpdateWarehouseDto, String]),
    __metadata("design:returntype", Promise)
], WarehouseController.prototype, "updateWarehouse", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], WarehouseController.prototype, "deleteWarehouse", null);
__decorate([
    (0, common_1.Post)('shelves'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [warehouse_dto_1.CreateShelfDto, String]),
    __metadata("design:returntype", Promise)
], WarehouseController.prototype, "createShelf", null);
__decorate([
    (0, common_1.Get)('shelves/:warehouseId'),
    __param(0, (0, common_1.Param)('warehouseId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], WarehouseController.prototype, "listShelves", null);
__decorate([
    (0, common_1.Put)('shelves/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, warehouse_dto_1.UpdateShelfDto]),
    __metadata("design:returntype", Promise)
], WarehouseController.prototype, "updateShelf", null);
exports.WarehouseController = WarehouseController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/warehouses'),
    __metadata("design:paramtypes", [warehouse_service_1.WarehouseService])
], WarehouseController);
