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
exports.ExpenseController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const expense_service_1 = require("./expense-service");
const expense_dto_1 = require("./expense.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../../common/dto/api-response-dto");
let ExpenseController = class ExpenseController {
    constructor(expenseService) {
        this.expenseService = expenseService;
    }
    async createCategory(dto) {
        const data = await this.expenseService.createCategory(dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Category created successfully');
    }
    async listCategories() {
        const data = await this.expenseService.listCategories();
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async createExpense(dto) {
        const userId = 'system';
        const data = await this.expenseService.createExpense(dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Expense created successfully');
    }
    async bulkCreateExpenses(dto) {
        const userId = 'system';
        const data = await this.expenseService.bulkCreateExpenses(dto, userId);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async listExpenses(dto) {
        const data = await this.expenseService.listExpenses(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getExpenseSummary(startDate, endDate) {
        const data = await this.expenseService.getExpenseSummary(startDate, endDate);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getExpense(id) {
        const data = await this.expenseService.getExpense(id);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async approveExpense(id, dto) {
        const userId = 'system';
        const data = await this.expenseService.approveExpense(id, dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Expense approved');
    }
    async bulkApproveExpenses(body) {
        const userId = 'system';
        const data = await this.expenseService.bulkApproveExpenses(body.expenseIds, userId);
        return api_response_dto_1.ApiResponse.ok(data);
    }
};
exports.ExpenseController = ExpenseController;
__decorate([
    (0, common_1.Post)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'Create expense category' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [expense_dto_1.CreateExpenseCategoryDto]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'List expense categories' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "listCategories", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create expense' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [expense_dto_1.CreateExpenseDto]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "createExpense", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk create expenses' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [expense_dto_1.BulkCreateExpenseDto]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "bulkCreateExpenses", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List expenses' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [expense_dto_1.ExpenseFilterDto]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "listExpenses", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get expense summary by category' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "getExpenseSummary", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get expense by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "getExpense", null);
__decorate([
    (0, common_1.Put)(':id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve expense' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, expense_dto_1.ApproveExpenseDto]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "approveExpense", null);
__decorate([
    (0, common_1.Put)('approve-multiple'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk approve expenses' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "bulkApproveExpenses", null);
exports.ExpenseController = ExpenseController = __decorate([
    (0, swagger_1.ApiTags)('Expense - Pengeluaran'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/expense'),
    __metadata("design:paramtypes", [expense_service_1.ExpenseService])
], ExpenseController);
