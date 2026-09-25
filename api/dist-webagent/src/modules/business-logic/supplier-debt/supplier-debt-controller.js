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
exports.SupplierDebtController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const supplier_debt_service_1 = require("./supplier-debt-service");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const supplier_debt_dto_1 = require("./supplier-debt.dto");
let SupplierDebtController = class SupplierDebtController {
    constructor(supplierDebtService) {
        this.supplierDebtService = supplierDebtService;
    }
    async getDebtOverview(dto) {
        return this.supplierDebtService.getDebtOverview(dto);
    }
    async getSupplierDebt(supplierId, dto) {
        dto.SupplierId = supplierId;
        return this.supplierDebtService.getSupplierDebt(dto);
    }
    async recordPayment(dto) {
        return this.supplierDebtService.recordPayment(dto, 'system');
    }
    async bulkPayment(dto) {
        return this.supplierDebtService.bulkPayment(dto, 'system');
    }
    async addDeposit(dto) {
        return this.supplierDebtService.addDeposit(dto, 'system');
    }
    async useDeposit(dto) {
        return this.supplierDebtService.useDeposit(dto, 'system');
    }
    async getDeposits(supplierId) {
        return this.supplierDebtService.getDeposits(supplierId);
    }
    async getDebtAging(dto) {
        return this.supplierDebtService.getDebtAging(dto);
    }
    async getDebtReport(dto) {
        return this.supplierDebtService.getDebtReport(dto);
    }
};
exports.SupplierDebtController = SupplierDebtController;
__decorate([
    (0, common_1.Get)('overview'),
    (0, swagger_1.ApiOperation)({ summary: 'Get supplier debt overview' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [supplier_debt_dto_1.SupplierDebtOverviewDto]),
    __metadata("design:returntype", Promise)
], SupplierDebtController.prototype, "getDebtOverview", null);
__decorate([
    (0, common_1.Get)('supplier/:supplierId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get supplier debt details' }),
    __param(0, (0, common_1.Param)('supplierId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, supplier_debt_dto_1.SupplierDebtDetailDto]),
    __metadata("design:returntype", Promise)
], SupplierDebtController.prototype, "getSupplierDebt", null);
__decorate([
    (0, common_1.Post)('payment'),
    (0, swagger_1.ApiOperation)({ summary: 'Record payment for supplier debt' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [supplier_debt_dto_1.RecordSupplierPaymentDto]),
    __metadata("design:returntype", Promise)
], SupplierDebtController.prototype, "recordPayment", null);
__decorate([
    (0, common_1.Post)('bulk-payment'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk payment for supplier' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [supplier_debt_dto_1.BulkSupplierPaymentDto]),
    __metadata("design:returntype", Promise)
], SupplierDebtController.prototype, "bulkPayment", null);
__decorate([
    (0, common_1.Post)('deposit'),
    (0, swagger_1.ApiOperation)({ summary: 'Add supplier deposit' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [supplier_debt_dto_1.AddSupplierDepositDto]),
    __metadata("design:returntype", Promise)
], SupplierDebtController.prototype, "addDeposit", null);
__decorate([
    (0, common_1.Post)('deposit/use'),
    (0, swagger_1.ApiOperation)({ summary: 'Use supplier deposit for purchase' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [supplier_debt_dto_1.UseSupplierDepositDto]),
    __metadata("design:returntype", Promise)
], SupplierDebtController.prototype, "useDeposit", null);
__decorate([
    (0, common_1.Get)('deposit/:supplierId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get supplier deposits' }),
    __param(0, (0, common_1.Param)('supplierId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SupplierDebtController.prototype, "getDeposits", null);
__decorate([
    (0, common_1.Get)('reports/aging'),
    (0, swagger_1.ApiOperation)({ summary: 'Get debt aging report' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [supplier_debt_dto_1.SupplierDebtAgingDto]),
    __metadata("design:returntype", Promise)
], SupplierDebtController.prototype, "getDebtAging", null);
__decorate([
    (0, common_1.Get)('reports/debt'),
    (0, swagger_1.ApiOperation)({ summary: 'Get supplier debt report' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [supplier_debt_dto_1.SupplierDebtReportDto]),
    __metadata("design:returntype", Promise)
], SupplierDebtController.prototype, "getDebtReport", null);
exports.SupplierDebtController = SupplierDebtController = __decorate([
    (0, swagger_1.ApiTags)('Business Logic - Supplier Debt'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/supplier-debt'),
    __metadata("design:paramtypes", [supplier_debt_service_1.SupplierDebtService])
], SupplierDebtController);
