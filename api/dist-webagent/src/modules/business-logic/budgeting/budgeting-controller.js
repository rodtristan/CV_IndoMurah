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
exports.BudgetingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const budgeting_service_1 = require("./budgeting-service");
const budgeting_dto_1 = require("./budgeting.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../../common/dto/api-response-dto");
let BudgetingController = class BudgetingController {
    constructor(budgetingService) {
        this.budgetingService = budgetingService;
    }
    async createBudget(dto) {
        const data = await this.budgetingService.createBudget(dto, 'system');
        return api_response_dto_1.ApiResponse.ok(data, 'Budget created successfully');
    }
    async listBudgets(dto) {
        const data = await this.budgetingService.listBudgets(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getBudget(id) {
        const data = await this.budgetingService.getBudget(id);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async updateBudget(id, dto) {
        const data = await this.budgetingService.updateBudget(id, dto, 'system');
        return api_response_dto_1.ApiResponse.ok(data, 'Budget updated successfully');
    }
    async deleteBudget(id) {
        const data = await this.budgetingService.deleteBudget(id, 'system');
        return api_response_dto_1.ApiResponse.ok(data, 'Budget deleted successfully');
    }
    async copyBudget(dto) {
        const data = await this.budgetingService.copyBudget(dto, 'system');
        return api_response_dto_1.ApiResponse.ok(data, 'Budget copied successfully');
    }
    async createSalesTarget(dto) {
        const data = await this.budgetingService.createSalesTarget(dto, 'system');
        return api_response_dto_1.ApiResponse.ok(data, 'Sales target created successfully');
    }
    async listSalesTargets(dto) {
        const data = await this.budgetingService.listSalesTargets(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getSalesTarget(id) {
        const data = await this.budgetingService.getSalesTarget(id);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async updateSalesTarget(id, dto) {
        const data = await this.budgetingService.updateSalesTarget(id, dto, 'system');
        return api_response_dto_1.ApiResponse.ok(data, 'Sales target updated successfully');
    }
    async recalculateTarget(id) {
        const data = await this.budgetingService.recalculateTargets(id);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getBudgetComparison(dto) {
        const data = await this.budgetingService.getBudgetComparison(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getSalesTargetReport(dto) {
        const data = await this.budgetingService.getSalesTargetReport(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getBudgetAlerts(dto) {
        const data = await this.budgetingService.getBudgetAlerts(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
};
exports.BudgetingController = BudgetingController;
__decorate([
    (0, common_1.Post)('budget'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new budget' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [budgeting_dto_1.CreateBudgetDto]),
    __metadata("design:returntype", Promise)
], BudgetingController.prototype, "createBudget", null);
__decorate([
    (0, common_1.Get)('budget'),
    (0, swagger_1.ApiOperation)({ summary: 'List budgets' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [budgeting_dto_1.BudgetFilterDto]),
    __metadata("design:returntype", Promise)
], BudgetingController.prototype, "listBudgets", null);
__decorate([
    (0, common_1.Get)('budget/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get budget by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BudgetingController.prototype, "getBudget", null);
__decorate([
    (0, common_1.Put)('budget/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update budget' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, budgeting_dto_1.UpdateBudgetDto]),
    __metadata("design:returntype", Promise)
], BudgetingController.prototype, "updateBudget", null);
__decorate([
    (0, common_1.Delete)('budget/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete budget' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BudgetingController.prototype, "deleteBudget", null);
__decorate([
    (0, common_1.Post)('budget/copy'),
    (0, swagger_1.ApiOperation)({ summary: 'Copy budget to new period' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [budgeting_dto_1.CopyBudgetDto]),
    __metadata("design:returntype", Promise)
], BudgetingController.prototype, "copyBudget", null);
__decorate([
    (0, common_1.Post)('target'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new sales target' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [budgeting_dto_1.CreateSalesTargetDto]),
    __metadata("design:returntype", Promise)
], BudgetingController.prototype, "createSalesTarget", null);
__decorate([
    (0, common_1.Get)('target'),
    (0, swagger_1.ApiOperation)({ summary: 'List sales targets' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [budgeting_dto_1.SalesTargetFilterDto]),
    __metadata("design:returntype", Promise)
], BudgetingController.prototype, "listSalesTargets", null);
__decorate([
    (0, common_1.Get)('target/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get sales target by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BudgetingController.prototype, "getSalesTarget", null);
__decorate([
    (0, common_1.Put)('target/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update sales target' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, budgeting_dto_1.UpdateSalesTargetDto]),
    __metadata("design:returntype", Promise)
], BudgetingController.prototype, "updateSalesTarget", null);
__decorate([
    (0, common_1.Post)('target/:id/recalculate'),
    (0, swagger_1.ApiOperation)({ summary: 'Recalculate target actual values' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BudgetingController.prototype, "recalculateTarget", null);
__decorate([
    (0, common_1.Get)('reports/comparison'),
    (0, swagger_1.ApiOperation)({ summary: 'Get budget vs actual comparison' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [budgeting_dto_1.BudgetComparisonDto]),
    __metadata("design:returntype", Promise)
], BudgetingController.prototype, "getBudgetComparison", null);
__decorate([
    (0, common_1.Get)('reports/target-performance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get sales target performance report' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [budgeting_dto_1.SalesTargetReportDto]),
    __metadata("design:returntype", Promise)
], BudgetingController.prototype, "getSalesTargetReport", null);
__decorate([
    (0, common_1.Get)('reports/alerts'),
    (0, swagger_1.ApiOperation)({ summary: 'Get budget alerts' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [budgeting_dto_1.BudgetAlertDto]),
    __metadata("design:returntype", Promise)
], BudgetingController.prototype, "getBudgetAlerts", null);
exports.BudgetingController = BudgetingController = __decorate([
    (0, swagger_1.ApiTags)('Budgeting - Penganggaran'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/budgeting'),
    __metadata("design:paramtypes", [budgeting_service_1.BudgetingService])
], BudgetingController);
