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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveBalanceFilterDto = exports.InitializeLeaveBalanceDto = exports.EmployeeFilterDto = exports.UpdateEmployeeDto = exports.CreateEmployeeDto = exports.LoanFilterDto = exports.RecordLoanPaymentDto = exports.CreateLoanDto = exports.PayrollFilterDto = exports.CreatePayrollDto = exports.LeaveFilterDto = exports.RejectLeaveDto = exports.ApproveLeaveDto = exports.CreateLeaveDto = exports.AttendanceFilterDto = exports.BulkAttendanceDto = exports.RecordAttendanceDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class RecordAttendanceDto {
}
exports.RecordAttendanceDto = RecordAttendanceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Employee ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecordAttendanceDto.prototype, "EmployeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Attendance Date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], RecordAttendanceDto.prototype, "Date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Check in time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordAttendanceDto.prototype, "CheckIn", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Check out time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordAttendanceDto.prototype, "CheckOut", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status ID (1=Present, 2=Sick, 3=Leave, etc)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecordAttendanceDto.prototype, "StatusId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordAttendanceDto.prototype, "Notes", void 0);
class BulkAttendanceDto {
}
exports.BulkAttendanceDto = BulkAttendanceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Attendance records', type: [RecordAttendanceDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => RecordAttendanceDto),
    __metadata("design:type", Array)
], BulkAttendanceDto.prototype, "Records", void 0);
class AttendanceFilterDto {
}
exports.AttendanceFilterDto = AttendanceFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Employee ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AttendanceFilterDto.prototype, "EmployeeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Department ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AttendanceFilterDto.prototype, "DepartmentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AttendanceFilterDto.prototype, "StatusId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AttendanceFilterDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AttendanceFilterDto.prototype, "EndDate", void 0);
class CreateLeaveDto {
}
exports.CreateLeaveDto = CreateLeaveDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Employee ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLeaveDto.prototype, "EmployeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Leave Type ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLeaveDto.prototype, "TypeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Start Date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateLeaveDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'End Date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateLeaveDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total days' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateLeaveDto.prototype, "TotalDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Leave reason' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLeaveDto.prototype, "Reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLeaveDto.prototype, "Notes", void 0);
class ApproveLeaveDto {
}
exports.ApproveLeaveDto = ApproveLeaveDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Approval Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApproveLeaveDto.prototype, "Notes", void 0);
class RejectLeaveDto {
}
exports.RejectLeaveDto = RejectLeaveDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Rejection reason' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RejectLeaveDto.prototype, "Reason", void 0);
class LeaveFilterDto {
}
exports.LeaveFilterDto = LeaveFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Employee ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LeaveFilterDto.prototype, "EmployeeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Leave Type ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LeaveFilterDto.prototype, "TypeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LeaveFilterDto.prototype, "StatusId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Year filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LeaveFilterDto.prototype, "Year", void 0);
class CreatePayrollDto {
}
exports.CreatePayrollDto = CreatePayrollDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Employee ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePayrollDto.prototype, "EmployeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payroll period (e.g., "2026-09")' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePayrollDto.prototype, "Period", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Basic salary' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePayrollDto.prototype, "BasicSalary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Allowances' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePayrollDto.prototype, "Allowances", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Deductions' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePayrollDto.prototype, "Deductions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Overtime pay' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePayrollDto.prototype, "OvertimePay", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePayrollDto.prototype, "PaymentDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePayrollDto.prototype, "Notes", void 0);
class PayrollFilterDto {
}
exports.PayrollFilterDto = PayrollFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Employee ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PayrollFilterDto.prototype, "EmployeeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Period filter (e.g., "2026-09")' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PayrollFilterDto.prototype, "Period", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Paid status filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PayrollFilterDto.prototype, "IsPaid", void 0);
class CreateLoanDto {
}
exports.CreateLoanDto = CreateLoanDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Employee ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLoanDto.prototype, "EmployeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Loan Type ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLoanDto.prototype, "LoanTypeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Principal Amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], CreateLoanDto.prototype, "PrincipalAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Interest rate (percentage)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateLoanDto.prototype, "InterestRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Tenor in months' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateLoanDto.prototype, "TenorMonths", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateLoanDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLoanDto.prototype, "Notes", void 0);
class RecordLoanPaymentDto {
}
exports.RecordLoanPaymentDto = RecordLoanPaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Loan installment ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecordLoanPaymentDto.prototype, "InstallmentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], RecordLoanPaymentDto.prototype, "PaymentDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordLoanPaymentDto.prototype, "Notes", void 0);
class LoanFilterDto {
}
exports.LoanFilterDto = LoanFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Employee ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LoanFilterDto.prototype, "EmployeeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Loan Type ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LoanFilterDto.prototype, "LoanTypeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LoanFilterDto.prototype, "StatusId", void 0);
class CreateEmployeeDto {
}
exports.CreateEmployeeDto = CreateEmployeeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Employee Code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "Code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Employee Name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Department ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateEmployeeDto.prototype, "DepartmentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Position ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateEmployeeDto.prototype, "PositionId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Join Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "JoinDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Birth Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "BirthDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Gender' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "Gender", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Phone' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "Phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Email' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "Email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Address' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "Address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Emergency contact' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "EmergencyContact", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Emergency phone' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "EmergencyPhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Basic salary' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateEmployeeDto.prototype, "BasicSalary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "Notes", void 0);
class UpdateEmployeeDto {
}
exports.UpdateEmployeeDto = UpdateEmployeeDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Department ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateEmployeeDto.prototype, "DepartmentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Position ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateEmployeeDto.prototype, "PositionId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date (for resigned employees)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateEmployeeDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Phone' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateEmployeeDto.prototype, "Phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Email' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateEmployeeDto.prototype, "Email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Address' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateEmployeeDto.prototype, "Address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Emergency contact' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateEmployeeDto.prototype, "EmergencyContact", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Emergency phone' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateEmployeeDto.prototype, "EmergencyPhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Basic salary' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateEmployeeDto.prototype, "BasicSalary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateEmployeeDto.prototype, "StatusId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateEmployeeDto.prototype, "Notes", void 0);
class EmployeeFilterDto {
}
exports.EmployeeFilterDto = EmployeeFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Department ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], EmployeeFilterDto.prototype, "DepartmentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Position ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], EmployeeFilterDto.prototype, "PositionId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], EmployeeFilterDto.prototype, "StatusId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Active only' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], EmployeeFilterDto.prototype, "ActiveOnly", void 0);
class InitializeLeaveBalanceDto {
}
exports.InitializeLeaveBalanceDto = InitializeLeaveBalanceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Employee ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InitializeLeaveBalanceDto.prototype, "EmployeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Year' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InitializeLeaveBalanceDto.prototype, "Year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Leave Type ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InitializeLeaveBalanceDto.prototype, "TypeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total days allocated' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], InitializeLeaveBalanceDto.prototype, "TotalDays", void 0);
class LeaveBalanceFilterDto {
}
exports.LeaveBalanceFilterDto = LeaveBalanceFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Employee ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LeaveBalanceFilterDto.prototype, "EmployeeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Year filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LeaveBalanceFilterDto.prototype, "Year", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Leave Type ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LeaveBalanceFilterDto.prototype, "TypeId", void 0);
