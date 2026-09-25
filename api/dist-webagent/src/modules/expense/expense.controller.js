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
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const base_controller_1 = require("../../common/templates/base.controller");
const expense_service_1 = require("./expense.service");
const expense_dto_1 = require("./dto/expense.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth-guard");
let ExpenseController = class ExpenseController extends base_controller_1.BaseController {
    constructor(expenseService) {
        super(expenseService, {
            modelName: 'Expense',
            pluralName: 'Expenses',
            primaryKeyType: 'number',
            paramId: 'id',
            routePrefix: 'expenses',
        });
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
    async create(dto) {
        return super.create(dto);
    }
    async createBulk(dtos) {
        return super.createBulk(dtos);
    }
    async patchById(id, dto) {
        return super.patchById(id, dto);
    }
    async patchByFilterReference(field, value, dto) {
        return super.patchByFilterReference(field, value, dto);
    }
    async patchBulk(body) {
        return super.patchBulk(body);
    }
    async upsert(body) {
        return super.upsert(body);
    }
    async upsertByFilterReference(field, body) {
        return super.upsertByFilterReference(field, body);
    }
    async upsertBulk(body) {
        return super.upsertBulk(body);
    }
    async deleteById(id) {
        return super.deleteById(id);
    }
    async deleteByFilterReference(field, value) {
        return super.deleteByFilterReference(field, value);
    }
    async deleteBulk(body) {
        return super.deleteBulk(body);
    }
};
exports.ExpenseController = ExpenseController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all expenses with OData query support' }),
    (0, swagger_1.ApiQuery)({ name: '$select', required: false, description: 'Select fields' }),
    (0, swagger_1.ApiQuery)({ name: '$include', required: false, description: 'Include relations' }),
    (0, swagger_1.ApiQuery)({ name: '$where[field]', required: false, description: 'Filter by field' }),
    (0, swagger_1.ApiQuery)({ name: '$orderBy[field]', required: false, description: 'Sort: asc/desc' }),
    (0, swagger_1.ApiQuery)({ name: '$skip', required: false, type: Number, description: 'Offset' }),
    (0, swagger_1.ApiQuery)({ name: '$take', required: false, type: Number, description: 'Limit' }),
    (0, swagger_1.ApiQuery)({ name: '$search', required: false, description: 'Search keyword' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('count'),
    (0, swagger_1.ApiOperation)({ summary: 'Get count of expenses' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "getCount", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get expense by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "findById", null);
__decorate([
    (0, common_1.Get)('by/:field/:value'),
    (0, swagger_1.ApiOperation)({ summary: 'Get expense by field reference' }),
    __param(0, (0, common_1.Param)('field')),
    __param(1, (0, common_1.Param)('value')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "findByField", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new expense' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [expense_dto_1.CreateExpenseDto]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Create multiple expenses' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "createBulk", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update expense by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "patchById", null);
__decorate([
    (0, common_1.Patch)('by/:field/:value'),
    (0, swagger_1.ApiOperation)({ summary: 'Update expenses by field reference' }),
    __param(0, (0, common_1.Param)('field')),
    __param(1, (0, common_1.Param)('value')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "patchByFilterReference", null);
__decorate([
    (0, common_1.Patch)('bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Update multiple expenses' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "patchBulk", null);
__decorate([
    (0, common_1.Put)(),
    (0, swagger_1.ApiOperation)({ summary: 'Upsert expense' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "upsert", null);
__decorate([
    (0, common_1.Put)('by/:field'),
    (0, swagger_1.ApiOperation)({ summary: 'Upsert expense by field reference' }),
    __param(0, (0, common_1.Param)('field')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "upsertByFilterReference", null);
__decorate([
    (0, common_1.Put)('bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk upsert expenses' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "upsertBulk", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete expense by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "deleteById", null);
__decorate([
    (0, common_1.Delete)('by/:field/:value'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete expenses by field reference' }),
    __param(0, (0, common_1.Param)('field')),
    __param(1, (0, common_1.Param)('value')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "deleteByFilterReference", null);
__decorate([
    (0, common_1.Delete)('bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete multiple expenses' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "deleteBulk", null);
exports.ExpenseController = ExpenseController = __decorate([
    (0, swagger_1.ApiTags)('Expenses'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('expenses'),
    __metadata("design:paramtypes", [expense_service_1.ExpenseService])
], ExpenseController);
