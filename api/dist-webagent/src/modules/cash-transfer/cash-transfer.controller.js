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
exports.CashTransferController = void 0;
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const base_controller_1 = require("../../common/templates/base.controller");
const cash_transfer_service_1 = require("./cash-transfer.service");
const cash_transfer_dto_1 = require("./dto/cash-transfer.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth-guard");
const current_user_decorator_1 = require("../../common/decorators/current-user-decorator");
const api_response_dto_1 = require("../../common/dto/api-response-dto");
let CashTransferController = class CashTransferController extends base_controller_1.BaseController {
    constructor(svc) {
        super(svc, {
            modelName: 'CashTransfer',
            pluralName: 'CashTransfers',
            primaryKeyType: 'number',
            paramId: 'id',
            routePrefix: 'cash-transfer',
        });
        this.svc = svc;
    }
    async findAll(query) {
        return super.findAll(query);
    }
    async getCount(query) {
        return super.getCount(query);
    }
    async findById(id, query) {
        return super.findById(id, query);
    }
    async findByField(field, value, query) {
        return super.findByField(field, value, query);
    }
    async create(dto, user) {
        return api_response_dto_1.ApiResponse.ok(await this.svc.createDoc(dto, user.id), 'Kas Transfer tersimpan');
    }
    async patchById(id, dto, user) {
        return api_response_dto_1.ApiResponse.ok(await this.svc.updateDoc(Number(id), dto, user.id), 'Kas Transfer diperbarui');
    }
    async deleteById(id) {
        return api_response_dto_1.ApiResponse.ok(await this.svc.deleteDoc(Number(id)), 'Kas Transfer dihapus');
    }
};
exports.CashTransferController = CashTransferController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all CashTransfers with OData query support' }),
    (0, swagger_1.ApiQuery)({ name: '$include', required: false, description: 'Include relations: account' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CashTransferController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('count'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CashTransferController.prototype, "getCount", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CashTransferController.prototype, "findById", null);
__decorate([
    (0, common_1.Get)('by/:field/:value'),
    __param(0, (0, common_1.Param)('field')),
    __param(1, (0, common_1.Param)('value')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CashTransferController.prototype, "findByField", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create CashTransfer + jurnal otomatis' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cash_transfer_dto_1.CreateCashTransferDto, Object]),
    __metadata("design:returntype", Promise)
], CashTransferController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update CashTransfer + posting ulang jurnal' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cash_transfer_dto_1.UpdateCashTransferDto, Object]),
    __metadata("design:returntype", Promise)
], CashTransferController.prototype, "patchById", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete CashTransfer + hapus jurnal otomatis' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CashTransferController.prototype, "deleteById", null);
exports.CashTransferController = CashTransferController = __decorate([
    (0, swagger_1.ApiTags)('CashTransfer'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('cash-transfer'),
    __metadata("design:paramtypes", [cash_transfer_service_1.CashTransferService])
], CashTransferController);
