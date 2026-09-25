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
exports.CustomerDepositController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const customer_deposit_service_1 = require("./customer-deposit-service");
const customer_deposit_dto_1 = require("./customer-deposit.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../../common/dto/api-response-dto");
let CustomerDepositController = class CustomerDepositController {
    constructor(customerDepositService) {
        this.customerDepositService = customerDepositService;
    }
    async create(dto) {
        const data = await this.customerDepositService.create(dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Customer deposit created successfully');
    }
    async findAll(dto) {
        const data = await this.customerDepositService.findAll(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getCustomerSummary(customerId) {
        const data = await this.customerDepositService.getCustomerSummary({ CustomerId: customerId });
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async findById(id) {
        const data = await this.customerDepositService.findById(id);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async useDeposit(dto) {
        const data = await this.customerDepositService.useDeposit(dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Deposit used successfully');
    }
    async refundDeposit(id, dto) {
        const data = await this.customerDepositService.refundDeposit(id, dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Deposit refunded successfully');
    }
    async update(id, dto) {
        const data = await this.customerDepositService.update(id, dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Deposit updated');
    }
};
exports.CustomerDepositController = CustomerDepositController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new customer deposit (Deposit/Titipan Pelanggan)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [customer_deposit_dto_1.CreateCustomerDepositDto]),
    __metadata("design:returntype", Promise)
], CustomerDepositController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all customer deposits' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [customer_deposit_dto_1.CustomerDepositQueryDto]),
    __metadata("design:returntype", Promise)
], CustomerDepositController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('summary/:customerId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get customer deposit summary/balance' }),
    __param(0, (0, common_1.Param)('customerId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CustomerDepositController.prototype, "getCustomerSummary", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get deposit by ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CustomerDepositController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)('use'),
    (0, swagger_1.ApiOperation)({ summary: 'Use customer deposit for payment (Potong deposit saat bayar)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [customer_deposit_dto_1.UseCustomerDepositDto]),
    __metadata("design:returntype", Promise)
], CustomerDepositController.prototype, "useDeposit", null);
__decorate([
    (0, common_1.Post)(':id/refund'),
    (0, swagger_1.ApiOperation)({ summary: 'Refund customer deposit (Kembalikan uang deposit)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], CustomerDepositController.prototype, "refundDeposit", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update deposit notes' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, customer_deposit_dto_1.UpdateCustomerDepositDto]),
    __metadata("design:returntype", Promise)
], CustomerDepositController.prototype, "update", null);
exports.CustomerDepositController = CustomerDepositController = __decorate([
    (0, swagger_1.ApiTags)('Customer Deposit - Deposit Pelanggan'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/customer-deposit'),
    __metadata("design:paramtypes", [customer_deposit_service_1.CustomerDepositService])
], CustomerDepositController);
