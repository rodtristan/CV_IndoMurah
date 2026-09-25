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
exports.SupplierDepositController = void 0;
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const base_controller_1 = require("../../common/templates/base.controller");
const supplier_deposit_service_1 = require("./supplier-deposit.service");
const supplier_deposit_dto_1 = require("./dto/supplier-deposit.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth-guard");
const current_user_decorator_1 = require("../../common/decorators/current-user-decorator");
const api_response_dto_1 = require("../../common/dto/api-response-dto");
let SupplierDepositController = class SupplierDepositController extends base_controller_1.BaseController {
    constructor(svc) {
        super(svc, {
            modelName: 'SupplierDeposit',
            pluralName: 'SupplierDeposits',
            primaryKeyType: 'number',
            paramId: 'id',
            routePrefix: 'supplier-deposit',
        });
        this.svc = svc;
    }
    async findAll(query) {
        return super.findAll(query);
    }
    async getCount(query) {
        return super.getCount(query);
    }
    async balance(partyId) {
        return api_response_dto_1.ApiResponse.ok({ balance: await this.svc.balance(partyId) });
    }
    async findById(id, query) {
        return super.findById(id, query);
    }
    async findByField(field, value, query) {
        return super.findByField(field, value, query);
    }
    async create(dto, user) {
        return api_response_dto_1.ApiResponse.ok(await this.svc.createDoc(dto, user.id), 'Deposit Supplier tersimpan');
    }
    async patchById(id, dto, user) {
        return api_response_dto_1.ApiResponse.ok(await this.svc.updateDoc(Number(id), dto, user.id), 'Deposit Supplier diperbarui');
    }
    async deleteById(id) {
        return api_response_dto_1.ApiResponse.ok(await this.svc.deleteDoc(Number(id)), 'Deposit Supplier dihapus');
    }
};
exports.SupplierDepositController = SupplierDepositController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all SupplierDeposits with OData query support' }),
    (0, swagger_1.ApiQuery)({ name: '$include', required: false, description: 'Include relations: account' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SupplierDepositController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('count'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SupplierDepositController.prototype, "getCount", null);
__decorate([
    (0, common_1.Get)('balance/:partyId'),
    (0, swagger_1.ApiOperation)({ summary: 'Saldo deposit supplier' }),
    __param(0, (0, common_1.Param)('partyId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SupplierDepositController.prototype, "balance", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SupplierDepositController.prototype, "findById", null);
__decorate([
    (0, common_1.Get)('by/:field/:value'),
    __param(0, (0, common_1.Param)('field')),
    __param(1, (0, common_1.Param)('value')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], SupplierDepositController.prototype, "findByField", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create SupplierDeposit + jurnal otomatis' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [supplier_deposit_dto_1.CreateSupplierDepositDto, Object]),
    __metadata("design:returntype", Promise)
], SupplierDepositController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update SupplierDeposit + posting ulang jurnal' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, supplier_deposit_dto_1.UpdateSupplierDepositDto, Object]),
    __metadata("design:returntype", Promise)
], SupplierDepositController.prototype, "patchById", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete SupplierDeposit + hapus jurnal otomatis' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SupplierDepositController.prototype, "deleteById", null);
exports.SupplierDepositController = SupplierDepositController = __decorate([
    (0, swagger_1.ApiTags)('SupplierDeposit'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('supplier-deposit'),
    __metadata("design:paramtypes", [supplier_deposit_service_1.SupplierDepositService])
], SupplierDepositController);
