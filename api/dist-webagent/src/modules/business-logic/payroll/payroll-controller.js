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
exports.PayrollController = void 0;
const common_1 = require("@nestjs/common");
const payroll_service_1 = require("./payroll-service");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const current_user_decorator_1 = require("../../../common/decorators/current-user-decorator");
const payroll_dto_1 = require("./payroll.dto");
let PayrollController = class PayrollController {
    constructor(payrollService) {
        this.payrollService = payrollService;
    }
    async createPayroll(dto, userId) {
        return this.payrollService.createPayroll(dto, userId);
    }
    async listPayrolls(dto) {
        return this.payrollService.listPayrolls(dto);
    }
    async getPayrollSummary(dto) {
        return this.payrollService.getPayrollSummary(dto);
    }
    async getPayroll(id) {
        return this.payrollService.getPayroll(id);
    }
    async getEmployeePayrollHistory(employeeId) {
        return this.payrollService.getEmployeePayrollHistory(employeeId);
    }
    async updatePayroll(id, dto, userId) {
        return this.payrollService.updatePayroll(id, dto, userId);
    }
    async paymentPayroll(dto, userId) {
        return this.payrollService.paymentPayroll(dto, userId);
    }
    async deletePayroll(id) {
        return this.payrollService.deletePayroll(id);
    }
};
exports.PayrollController = PayrollController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payroll_dto_1.CreatePayrollDto, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "createPayroll", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payroll_dto_1.PayrollFilterDto]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "listPayrolls", null);
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payroll_dto_1.PayrollSummaryDto]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getPayrollSummary", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getPayroll", null);
__decorate([
    (0, common_1.Get)('employee/:employeeId/history'),
    __param(0, (0, common_1.Param)('employeeId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getEmployeePayrollHistory", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, payroll_dto_1.UpdatePayrollDto, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "updatePayroll", null);
__decorate([
    (0, common_1.Post)('payment'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payroll_dto_1.PaymentPayrollDto, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "paymentPayroll", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "deletePayroll", null);
exports.PayrollController = PayrollController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/payroll'),
    __metadata("design:paramtypes", [payroll_service_1.PayrollService])
], PayrollController);
