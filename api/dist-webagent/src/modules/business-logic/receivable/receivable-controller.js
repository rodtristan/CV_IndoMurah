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
exports.ReceivableController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const receivable_service_1 = require("./receivable-service");
const receivable_dto_1 = require("./receivable.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const current_user_decorator_1 = require("../../../common/decorators/current-user-decorator");
const api_response_dto_1 = require("../../../common/dto/api-response-dto");
let ReceivableController = class ReceivableController {
    constructor(receivableService) {
        this.receivableService = receivableService;
    }
    async getReceivablesOverview(dto) {
        const data = await this.receivableService.getReceivablesOverview(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getCustomerReceivables(customerId) {
        const data = await this.receivableService.getCustomerReceivables(customerId);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getAgingReport(dto) {
        const data = await this.receivableService.getAgingReport(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async recordPayment(saleId, dto, user) {
        const data = await this.receivableService.RecordPayment(saleId, dto, user.ID);
        return api_response_dto_1.ApiResponse.ok(data, 'Payment recorded successfully');
    }
    async recordBulkPayment(dto, user) {
        const data = await this.receivableService.RecordBulkPayment(dto, user.ID);
        return api_response_dto_1.ApiResponse.ok(data, 'Bulk payment recorded successfully');
    }
    async addCustomerDeposit(customerId, dto, user) {
        const data = await this.receivableService.addCustomerDeposit(customerId, dto, user.ID);
        return api_response_dto_1.ApiResponse.ok(data, 'Deposit added successfully');
    }
    async useCustomerDeposit(customerId, saleId, dto, user) {
        const data = await this.receivableService.useCustomerDeposit(customerId, saleId, dto.Amount, user.ID);
        return api_response_dto_1.ApiResponse.ok(data, 'Deposit used for payment');
    }
    async checkCreditAvailability(customerId, amount) {
        const data = await this.receivableService.CheckCreditAvailability(customerId, parseFloat(amount));
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async updateCreditLimit(customerId, dto, user) {
        const data = await this.receivableService.updateCreditLimit(customerId, dto, user.ID);
        return api_response_dto_1.ApiResponse.ok(data, 'Credit limit updated');
    }
    async sendPaymentReminder(dto, user) {
        const data = await this.receivableService.sendPaymentReminder(dto, user.ID);
        return api_response_dto_1.ApiResponse.ok(data, 'Reminder sent');
    }
    async writeOffReceivable(dto, user) {
        const data = await this.receivableService.writeOffReceivable(dto, user.ID);
        return api_response_dto_1.ApiResponse.ok(data, 'Receivable written off');
    }
};
exports.ReceivableController = ReceivableController;
__decorate([
    (0, common_1.Get)('overview'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all customers with outstanding receivables' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [receivable_dto_1.ReceivableFilterDto]),
    __metadata("design:returntype", Promise)
], ReceivableController.prototype, "getReceivablesOverview", null);
__decorate([
    (0, common_1.Get)('customer/:customerId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get detailed receivable history for a customer' }),
    __param(0, (0, common_1.Param)('customerId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ReceivableController.prototype, "getCustomerReceivables", null);
__decorate([
    (0, common_1.Get)('aging-report'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate aging report for receivables' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [receivable_dto_1.AgingReportDto]),
    __metadata("design:returntype", Promise)
], ReceivableController.prototype, "getAgingReport", null);
__decorate([
    (0, common_1.Post)('sale/:saleId/payment'),
    (0, swagger_1.ApiOperation)({ summary: 'Record payment for a sale' }),
    __param(0, (0, common_1.Param)('saleId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, receivable_dto_1.RecordPaymentDto, Object]),
    __metadata("design:returntype", Promise)
], ReceivableController.prototype, "recordPayment", null);
__decorate([
    (0, common_1.Post)('bulk-payment'),
    (0, swagger_1.ApiOperation)({ summary: 'Record bulk payment for multiple sales' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [receivable_dto_1.RecordBulkPaymentDto, Object]),
    __metadata("design:returntype", Promise)
], ReceivableController.prototype, "recordBulkPayment", null);
__decorate([
    (0, common_1.Post)('customer/:customerId/deposit'),
    (0, swagger_1.ApiOperation)({ summary: 'Add customer deposit (Uang muka pelanggan)' }),
    __param(0, (0, common_1.Param)('customerId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], ReceivableController.prototype, "addCustomerDeposit", null);
__decorate([
    (0, common_1.Post)('customer/:customerId/use-deposit/:saleId'),
    (0, swagger_1.ApiOperation)({ summary: 'Use customer deposit for payment' }),
    __param(0, (0, common_1.Param)('customerId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('saleId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object, Object]),
    __metadata("design:returntype", Promise)
], ReceivableController.prototype, "useCustomerDeposit", null);
__decorate([
    (0, common_1.Get)('customer/:customerId/credit-check'),
    (0, swagger_1.ApiOperation)({ summary: 'Check if customer can make purchase on credit' }),
    __param(0, (0, common_1.Param)('customerId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('amount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], ReceivableController.prototype, "checkCreditAvailability", null);
__decorate([
    (0, common_1.Put)('customer/:customerId/credit-limit'),
    (0, swagger_1.ApiOperation)({ summary: 'Update customer credit limit' }),
    __param(0, (0, common_1.Param)('customerId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, receivable_dto_1.CustomerCreditLimitDto, Object]),
    __metadata("design:returntype", Promise)
], ReceivableController.prototype, "updateCreditLimit", null);
__decorate([
    (0, common_1.Post)('reminder'),
    (0, swagger_1.ApiOperation)({ summary: 'Send payment reminder to customer' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [receivable_dto_1.SendReminderDto, Object]),
    __metadata("design:returntype", Promise)
], ReceivableController.prototype, "sendPaymentReminder", null);
__decorate([
    (0, common_1.Post)('write-off'),
    (0, swagger_1.ApiOperation)({ summary: 'Write off uncollectible receivable' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [receivable_dto_1.WriteOffReceivableDto, Object]),
    __metadata("design:returntype", Promise)
], ReceivableController.prototype, "writeOffReceivable", null);
exports.ReceivableController = ReceivableController = __decorate([
    (0, swagger_1.ApiTags)('Receivable - Piutang Pelanggan'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/receivable'),
    __metadata("design:paramtypes", [receivable_service_1.ReceivableService])
], ReceivableController);
