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
exports.HRMController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const hrm_service_1 = require("./hrm-service");
const hrm_dto_1 = require("./hrm.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../../common/dto/api-response-dto");
let HRMController = class HRMController {
    constructor(hrmService) {
        this.hrmService = hrmService;
    }
    async createEmployee(dto) {
        const userId = 'system';
        const data = await this.hrmService.createEmployee(dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Employee created successfully');
    }
    async listEmployees(dto) {
        const data = await this.hrmService.listEmployees(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getEmployee(id) {
        const data = await this.hrmService.getEmployee(id);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async updateEmployee(id, dto) {
        const userId = 'system';
        const data = await this.hrmService.updateEmployee(id, dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Employee updated successfully');
    }
    async recordAttendance(dto) {
        const userId = 'system';
        const data = await this.hrmService.RecordAttendance(dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Attendance recorded successfully');
    }
    async bulkRecordAttendance(dto) {
        const userId = 'system';
        const data = await this.hrmService.bulkRecordAttendance(dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Bulk attendance processed');
    }
    async listAttendance(dto) {
        const data = await this.hrmService.listAttendance(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getAttendanceSummary(employeeId, startDate, endDate) {
        const data = await this.hrmService.getAttendanceSummary(employeeId, startDate, endDate);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async createLeave(dto) {
        const userId = 'system';
        const data = await this.hrmService.createLeave(dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Leave request created successfully');
    }
    async listLeaves(dto) {
        const data = await this.hrmService.listLeaves(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async approveLeave(id, dto) {
        const userId = 'system';
        const data = await this.hrmService.approveLeave(id, dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Leave approved');
    }
    async rejectLeave(id, dto) {
        const userId = 'system';
        const data = await this.hrmService.rejectLeave(id, dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Leave rejected');
    }
    async initializeLeaveBalance(dto) {
        const userId = 'system';
        const data = await this.hrmService.initializeLeaveBalance(dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Leave balance initialized');
    }
    async listLeaveBalances(dto) {
        const data = await this.hrmService.listLeaveBalances(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async createPayroll(dto) {
        const userId = 'system';
        const data = await this.hrmService.createPayroll(dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Payroll created successfully');
    }
    async listPayroll(dto) {
        const data = await this.hrmService.listPayroll(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getPayrollSummary(period) {
        const data = await this.hrmService.getPayrollSummary(period);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async markPayrollAsPaid(id, body) {
        const userId = 'system';
        const data = await this.hrmService.markPayrollAsPaID(id, body.paymentDate, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Payroll marked as paid');
    }
    async createLoan(dto) {
        const userId = 'system';
        const data = await this.hrmService.createLoan(dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Loan created successfully');
    }
    async listLoans(dto) {
        const data = await this.hrmService.listLoans(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getLoanDetails(id) {
        const data = await this.hrmService.getLoanDetails(id);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async recordLoanPayment(dto) {
        const userId = 'system';
        const data = await this.hrmService.RecordLoanPayment(dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Loan payment recorded');
    }
};
exports.HRMController = HRMController;
__decorate([
    (0, common_1.Post)('employees'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new employee' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [hrm_dto_1.CreateEmployeeDto]),
    __metadata("design:returntype", Promise)
], HRMController.prototype, "createEmployee", null);
__decorate([
    (0, common_1.Get)('employees'),
    (0, swagger_1.ApiOperation)({ summary: 'List employees' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [hrm_dto_1.EmployeeFilterDto]),
    __metadata("design:returntype", Promise)
], HRMController.prototype, "listEmployees", null);
__decorate([
    (0, common_1.Get)('employees/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get employee by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], HRMController.prototype, "getEmployee", null);
__decorate([
    (0, common_1.Put)('employees/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update employee' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, hrm_dto_1.UpdateEmployeeDto]),
    __metadata("design:returntype", Promise)
], HRMController.prototype, "updateEmployee", null);
__decorate([
    (0, common_1.Post)('attendance'),
    (0, swagger_1.ApiOperation)({ summary: 'Record attendance' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [hrm_dto_1.RecordAttendanceDto]),
    __metadata("design:returntype", Promise)
], HRMController.prototype, "recordAttendance", null);
__decorate([
    (0, common_1.Post)('attendance/bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk record attendance' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [hrm_dto_1.BulkAttendanceDto]),
    __metadata("design:returntype", Promise)
], HRMController.prototype, "bulkRecordAttendance", null);
__decorate([
    (0, common_1.Get)('attendance'),
    (0, swagger_1.ApiOperation)({ summary: 'List attendance records' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [hrm_dto_1.AttendanceFilterDto]),
    __metadata("design:returntype", Promise)
], HRMController.prototype, "listAttendance", null);
__decorate([
    (0, common_1.Get)('attendance/summary/:employeeId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get attendance summary for employee' }),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", Promise)
], HRMController.prototype, "getAttendanceSummary", null);
__decorate([
    (0, common_1.Post)('leaves'),
    (0, swagger_1.ApiOperation)({ summary: 'Create leave request' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [hrm_dto_1.CreateLeaveDto]),
    __metadata("design:returntype", Promise)
], HRMController.prototype, "createLeave", null);
__decorate([
    (0, common_1.Get)('leaves'),
    (0, swagger_1.ApiOperation)({ summary: 'List leave requests' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [hrm_dto_1.LeaveFilterDto]),
    __metadata("design:returntype", Promise)
], HRMController.prototype, "listLeaves", null);
__decorate([
    (0, common_1.Put)('leaves/:id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve leave request' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, hrm_dto_1.ApproveLeaveDto]),
    __metadata("design:returntype", Promise)
], HRMController.prototype, "approveLeave", null);
__decorate([
    (0, common_1.Put)('leaves/:id/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject leave request' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, hrm_dto_1.RejectLeaveDto]),
    __metadata("design:returntype", Promise)
], HRMController.prototype, "rejectLeave", null);
__decorate([
    (0, common_1.Post)('leave-balances'),
    (0, swagger_1.ApiOperation)({ summary: 'Initialize leave balance' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [hrm_dto_1.InitializeLeaveBalanceDto]),
    __metadata("design:returntype", Promise)
], HRMController.prototype, "initializeLeaveBalance", null);
__decorate([
    (0, common_1.Get)('leave-balances'),
    (0, swagger_1.ApiOperation)({ summary: 'List leave balances' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [hrm_dto_1.LeaveBalanceFilterDto]),
    __metadata("design:returntype", Promise)
], HRMController.prototype, "listLeaveBalances", null);
__decorate([
    (0, common_1.Post)('payroll'),
    (0, swagger_1.ApiOperation)({ summary: 'Create payroll' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [hrm_dto_1.CreatePayrollDto]),
    __metadata("design:returntype", Promise)
], HRMController.prototype, "createPayroll", null);
__decorate([
    (0, common_1.Get)('payroll'),
    (0, swagger_1.ApiOperation)({ summary: 'List payroll records' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [hrm_dto_1.PayrollFilterDto]),
    __metadata("design:returntype", Promise)
], HRMController.prototype, "listPayroll", null);
__decorate([
    (0, common_1.Get)('payroll/summary/:period'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payroll summary for period' }),
    __param(0, (0, common_1.Param)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HRMController.prototype, "getPayrollSummary", null);
__decorate([
    (0, common_1.Put)('payroll/:id/mark-paid'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark payroll as paid' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], HRMController.prototype, "markPayrollAsPaid", null);
__decorate([
    (0, common_1.Post)('loans'),
    (0, swagger_1.ApiOperation)({ summary: 'Create employee loan' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [hrm_dto_1.CreateLoanDto]),
    __metadata("design:returntype", Promise)
], HRMController.prototype, "createLoan", null);
__decorate([
    (0, common_1.Get)('loans'),
    (0, swagger_1.ApiOperation)({ summary: 'List employee loans' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [hrm_dto_1.LoanFilterDto]),
    __metadata("design:returntype", Promise)
], HRMController.prototype, "listLoans", null);
__decorate([
    (0, common_1.Get)('loans/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get loan details with installments' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], HRMController.prototype, "getLoanDetails", null);
__decorate([
    (0, common_1.Post)('loans/installment-payment'),
    (0, swagger_1.ApiOperation)({ summary: 'Record loan installment payment' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [hrm_dto_1.RecordLoanPaymentDto]),
    __metadata("design:returntype", Promise)
], HRMController.prototype, "recordLoanPayment", null);
exports.HRMController = HRMController = __decorate([
    (0, swagger_1.ApiTags)('HRM - Human Resource Management'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/hrm'),
    __metadata("design:paramtypes", [hrm_service_1.HRMService])
], HRMController);
