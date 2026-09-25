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
exports.LoanController = void 0;
const common_1 = require("@nestjs/common");
const loan_service_1 = require("./loan-service");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const current_user_decorator_1 = require("../../../common/decorators/current-user-decorator");
const loan_dto_1 = require("./loan.dto");
let LoanController = class LoanController {
    constructor(loanService) {
        this.loanService = loanService;
    }
    async createLoan(dto, userId) {
        return this.loanService.createLoan(dto, userId);
    }
    async listLoans(dto) {
        return this.loanService.listLoans(dto);
    }
    async getLoanSummary(dto) {
        return this.loanService.getLoanSummary(dto);
    }
    async getLoanTypes() {
        return this.loanService.getLoanTypes();
    }
    async getLoanStatuses() {
        return this.loanService.getLoanStatuses();
    }
    async getLoan(id) {
        return this.loanService.getLoan(id);
    }
    async getEmployeeLoanHistory(employeeId) {
        return this.loanService.getEmployeeLoanHistory(employeeId);
    }
    async updateLoan(id, dto) {
        return this.loanService.updateLoan(id, dto);
    }
    async recordInstallment(dto, userId) {
        return this.loanService.RecordInstallment(dto, userId);
    }
};
exports.LoanController = LoanController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [loan_dto_1.CreateLoanDto, String]),
    __metadata("design:returntype", Promise)
], LoanController.prototype, "createLoan", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [loan_dto_1.LoanFilterDto]),
    __metadata("design:returntype", Promise)
], LoanController.prototype, "listLoans", null);
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [loan_dto_1.LoanSummaryDto]),
    __metadata("design:returntype", Promise)
], LoanController.prototype, "getLoanSummary", null);
__decorate([
    (0, common_1.Get)('types'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LoanController.prototype, "getLoanTypes", null);
__decorate([
    (0, common_1.Get)('statuses'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LoanController.prototype, "getLoanStatuses", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], LoanController.prototype, "getLoan", null);
__decorate([
    (0, common_1.Get)('employee/:employeeId/history'),
    __param(0, (0, common_1.Param)('employeeId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], LoanController.prototype, "getEmployeeLoanHistory", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, loan_dto_1.UpDateLoanDto]),
    __metadata("design:returntype", Promise)
], LoanController.prototype, "updateLoan", null);
__decorate([
    (0, common_1.Post)('installment'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [loan_dto_1.RecordInstallmentDto, String]),
    __metadata("design:returntype", Promise)
], LoanController.prototype, "recordInstallment", null);
exports.LoanController = LoanController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/loans'),
    __metadata("design:paramtypes", [loan_service_1.LoanService])
], LoanController);
