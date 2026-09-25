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
exports.SupplierController = void 0;
const common_1 = require("@nestjs/common");
const supplier_service_1 = require("./supplier-service");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const current_user_decorator_1 = require("../../../common/decorators/current-user-decorator");
const supplier_dto_1 = require("./supplier.dto");
let SupplierController = class SupplierController {
    constructor(supplierService) {
        this.supplierService = supplierService;
    }
    async createSupplier(dto, userId) {
        return this.supplierService.createSupplier(dto, userId);
    }
    async listSuppliers(dto) {
        return this.supplierService.listSuppliers(dto);
    }
    async getSupplierSummary() {
        return this.supplierService.getSupplierSummary();
    }
    async getTopSuppliers(limit) {
        return this.supplierService.getTopSuppliers(limit);
    }
    async getSupplier(id) {
        return this.supplierService.getSupplier(id);
    }
    async updateSupplier(id, dto, userId) {
        return this.supplierService.updateSupplier(id, dto, userId);
    }
    async deleteSupplier(id, userId) {
        return this.supplierService.deleteSupplier(id, userId);
    }
    async addDebt(dto, userId) {
        return this.supplierService.addDebt(dto, userId);
    }
    async paymentDebt(dto, userId) {
        return this.supplierService.paymentDebt(dto, userId);
    }
    async getSupplierDebt(id) {
        return this.supplierService.getSupplierDebt(id);
    }
    async getSupplierStatement(id, dto) {
        return this.supplierService.getSupplierStatement({ ...dto, SupplierId: id });
    }
};
exports.SupplierController = SupplierController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [supplier_dto_1.CreateSupplierDto, String]),
    __metadata("design:returntype", Promise)
], SupplierController.prototype, "createSupplier", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [supplier_dto_1.SupplierFilterDto]),
    __metadata("design:returntype", Promise)
], SupplierController.prototype, "listSuppliers", null);
__decorate([
    (0, common_1.Get)('summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SupplierController.prototype, "getSupplierSummary", null);
__decorate([
    (0, common_1.Get)('top'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SupplierController.prototype, "getTopSuppliers", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SupplierController.prototype, "getSupplier", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, supplier_dto_1.UpDateSupplierDto, String]),
    __metadata("design:returntype", Promise)
], SupplierController.prototype, "updateSupplier", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], SupplierController.prototype, "deleteSupplier", null);
__decorate([
    (0, common_1.Post)('debt/add'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [supplier_dto_1.AddSupplierDebtDto, String]),
    __metadata("design:returntype", Promise)
], SupplierController.prototype, "addDebt", null);
__decorate([
    (0, common_1.Post)('debt/payment'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [supplier_dto_1.PaymentSupplierDebtDto, String]),
    __metadata("design:returntype", Promise)
], SupplierController.prototype, "paymentDebt", null);
__decorate([
    (0, common_1.Get)(':id/debt'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SupplierController.prototype, "getSupplierDebt", null);
__decorate([
    (0, common_1.Get)(':id/statement'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, supplier_dto_1.SupplierStatementDto]),
    __metadata("design:returntype", Promise)
], SupplierController.prototype, "getSupplierStatement", null);
exports.SupplierController = SupplierController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/suppliers'),
    __metadata("design:paramtypes", [supplier_service_1.SupplierService])
], SupplierController);
