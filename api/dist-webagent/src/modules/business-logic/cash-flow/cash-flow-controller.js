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
exports.CashFlowController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cash_flow_service_1 = require("./cash-flow-service");
const cash_flow_dto_1 = require("./cash-flow.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../../common/dto/api-response-dto");
const common_2 = require("@nestjs/common");
let CashFlowController = class CashFlowController {
    constructor(cashFlowService) {
        this.cashFlowService = cashFlowService;
    }
    async createCashFlowCategory(dto, req) {
        const data = await this.cashFlowService.createCashFlowCategory(dto, req.user?.id || '1');
        return api_response_dto_1.ApiResponse.ok(data, 'Cash flow category created successfully');
    }
    async listCashFlowCategories(isActive) {
        const data = await this.cashFlowService.listCashFlowCategories(isActive === 'true' ? true : isActive === 'false' ? false : undefined);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getCashFlowCategory(id) {
        const data = await this.cashFlowService.getCashFlowCategory(parseInt(id));
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async updateCashFlowCategory(id, dto) {
        const data = await this.cashFlowService.updateCashFlowCategory(parseInt(id), dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Cash flow category updated successfully');
    }
    async deleteCashFlowCategory(id) {
        const data = await this.cashFlowService.deleteCashFlowCategory(parseInt(id));
        return api_response_dto_1.ApiResponse.ok(data, 'Cash flow category deleted successfully');
    }
    async createCashFlowTransaction(dto, req) {
        const data = await this.cashFlowService.createCashFlowTransaction(dto, req.user?.id || '1');
        return api_response_dto_1.ApiResponse.ok(data, 'Cash flow transaction created successfully');
    }
    async listCashFlowTransactions(dto) {
        const data = await this.cashFlowService.listCashFlowTransactions(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getCashFlowTransaction(id) {
        const data = await this.cashFlowService.getCashFlowTransaction(parseInt(id));
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async updateCashFlowTransaction(id, dto) {
        const data = await this.cashFlowService.updateCashFlowTransaction(parseInt(id), dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Cash flow transaction updated successfully');
    }
    async deleteCashFlowTransaction(id) {
        const data = await this.cashFlowService.deleteCashFlowTransaction(parseInt(id));
        return api_response_dto_1.ApiResponse.ok(data, 'Cash flow transaction deleted successfully');
    }
    async getCashFlowSummary(dto) {
        const data = await this.cashFlowService.getCashFlowSummary(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getCashFlowReport(dto) {
        const data = await this.cashFlowService.getCashFlowReport(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getCashFlowProjection(dto) {
        const data = await this.cashFlowService.getCashFlowProjection(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getCashFlowByAccount(accountId, startDate, endDate) {
        const data = await this.cashFlowService.getCashFlowByAccount(parseInt(accountId), startDate, endDate);
        return api_response_dto_1.ApiResponse.ok(data);
    }
};
exports.CashFlowController = CashFlowController;
__decorate([
    (0, common_1.Post)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'Create cash flow category' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cash_flow_dto_1.CreateCashFlowCategoryDto, Object]),
    __metadata("design:returntype", Promise)
], CashFlowController.prototype, "createCashFlowCategory", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'List cash flow categories' }),
    __param(0, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CashFlowController.prototype, "listCashFlowCategories", null);
__decorate([
    (0, common_1.Get)('categories/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get cash flow category by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CashFlowController.prototype, "getCashFlowCategory", null);
__decorate([
    (0, common_1.Patch)('categories/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update cash flow category' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cash_flow_dto_1.UpdateCashFlowCategoryDto]),
    __metadata("design:returntype", Promise)
], CashFlowController.prototype, "updateCashFlowCategory", null);
__decorate([
    (0, common_1.Delete)('categories/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete cash flow category' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CashFlowController.prototype, "deleteCashFlowCategory", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create cash flow transaction' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cash_flow_dto_1.CreateCashFlowTransactionDto, Object]),
    __metadata("design:returntype", Promise)
], CashFlowController.prototype, "createCashFlowTransaction", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List cash flow transactions' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cash_flow_dto_1.CashFlowFilterDto]),
    __metadata("design:returntype", Promise)
], CashFlowController.prototype, "listCashFlowTransactions", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get cash flow transaction by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CashFlowController.prototype, "getCashFlowTransaction", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update cash flow transaction' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cash_flow_dto_1.UpdateCashFlowTransactionDto]),
    __metadata("design:returntype", Promise)
], CashFlowController.prototype, "updateCashFlowTransaction", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete cash flow transaction' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CashFlowController.prototype, "deleteCashFlowTransaction", null);
__decorate([
    (0, common_1.Get)('report/summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get cash flow summary' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cash_flow_dto_1.CashFlowSummaryDto]),
    __metadata("design:returntype", Promise)
], CashFlowController.prototype, "getCashFlowSummary", null);
__decorate([
    (0, common_1.Get)('report/detail'),
    (0, swagger_1.ApiOperation)({ summary: 'Get cash flow report' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cash_flow_dto_1.CashFlowReportDto]),
    __metadata("design:returntype", Promise)
], CashFlowController.prototype, "getCashFlowReport", null);
__decorate([
    (0, common_1.Get)('report/projection'),
    (0, swagger_1.ApiOperation)({ summary: 'Get cash flow projection' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cash_flow_dto_1.CashFlowProjectionDto]),
    __metadata("design:returntype", Promise)
], CashFlowController.prototype, "getCashFlowProjection", null);
__decorate([
    (0, common_1.Get)('account/:accountId/detail'),
    (0, swagger_1.ApiOperation)({ summary: 'Get cash flow by account' }),
    __param(0, (0, common_1.Param)('accountId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CashFlowController.prototype, "getCashFlowByAccount", null);
exports.CashFlowController = CashFlowController = __decorate([
    (0, swagger_1.ApiTags)('Cash Flow - Arus Kas'),
    (0, swagger_1.ApiBearerAuth)(),
    UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/cash-flow'),
    __metadata("design:paramtypes", [cash_flow_service_1.CashFlowService])
], CashFlowController);
function UseGuards(guard) {
    return (0, common_2.UseGuards)(guard);
}
