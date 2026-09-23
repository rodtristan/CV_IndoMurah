import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { HRMService } from './hrm-service';
import {
  RecordAttendanceDto,
  BulkAttendanceDto,
  AttendanceFilterDto,
  CreateLeaveDto,
  ApproveLeaveDto,
  RejectLeaveDto,
  LeaveFilterDto,
  CreatePayrollDto,
  PayrollFilterDto,
  CreateLoanDto,
  RecordLoanPaymentDto,
  LoanFilterDto,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  EmployeeFilterDto,
  InitializeLeaveBalanceDto,
  LeaveBalanceFilterDto,
} from './hrm.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../../common/dto/api-response-dto';

@ApiTags('HRM - Human Resource Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-logic/hrm')
export class HRMController {
  constructor(private hrmService: HRMService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // EMPLOYEE ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('employees')
  @ApiOperation({ summary: 'Create new employee' })
  async createEmployee(@Body() dto: CreateEmployeeDto) {
    const userId = 'system';
    const data = await this.hrmService.createEmployee(dto, userId);
    return ApiResponse.ok(data, 'Employee created successfully');
  }

  @Get('employees')
  @ApiOperation({ summary: 'List employees' })
  async listEmployees(@Query() dto: EmployeeFilterDto) {
    const data = await this.hrmService.listEmployees(dto);
    return ApiResponse.ok(data);
  }

  @Get('employees/:id')
  @ApiOperation({ summary: 'Get employee by ID' })
  async getEmployee(@Param('id') id: number) {
    const data = await this.hrmService.getEmployee(id);
    return ApiResponse.ok(data);
  }

  @Put('employees/:id')
  @ApiOperation({ summary: 'Update employee' })
  async updateEmployee(
    @Param('id') id: number,
    @Body() dto: UpdateEmployeeDto,
  ) {
    const userId = 'system';
    const data = await this.hrmService.updateEmployee(id, dto, userId);
    return ApiResponse.ok(data, 'Employee updated successfully');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ATTENDANCE ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('attendance')
  @ApiOperation({ summary: 'Record attendance' })
  async recordAttendance(@Body() dto: RecordAttendanceDto) {
    const userId = 'system';
    const data = await this.hrmService.RecordAttendance(dto, userId);
    return ApiResponse.ok(data, 'Attendance recorded successfully');
  }

  @Post('attendance/bulk')
  @ApiOperation({ summary: 'Bulk record attendance' })
  async bulkRecordAttendance(@Body() dto: BulkAttendanceDto) {
    const userId = 'system';
    const data = await this.hrmService.bulkRecordAttendance(dto, userId);
    return ApiResponse.ok(data, 'Bulk attendance processed');
  }

  @Get('attendance')
  @ApiOperation({ summary: 'List attendance records' })
  async listAttendance(@Query() dto: AttendanceFilterDto) {
    const data = await this.hrmService.listAttendance(dto);
    return ApiResponse.ok(data);
  }

  @Get('attendance/summary/:employeeId')
  @ApiOperation({ summary: 'Get attendance summary for employee' })
  async getAttendanceSummary(
    @Param('employeeId') employeeId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const data = await this.hrmService.getAttendanceSummary(employeeId, startDate, endDate);
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // LEAVE ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('leaves')
  @ApiOperation({ summary: 'Create leave request' })
  async createLeave(@Body() dto: CreateLeaveDto) {
    const userId = 'system';
    const data = await this.hrmService.createLeave(dto, userId);
    return ApiResponse.ok(data, 'Leave request created successfully');
  }

  @Get('leaves')
  @ApiOperation({ summary: 'List leave requests' })
  async listLeaves(@Query() dto: LeaveFilterDto) {
    const data = await this.hrmService.listLeaves(dto);
    return ApiResponse.ok(data);
  }

  @Put('leaves/:id/approve')
  @ApiOperation({ summary: 'Approve leave request' })
  async approveLeave(
    @Param('id') id: number,
    @Body() dto: ApproveLeaveDto,
  ) {
    const userId = 'system';
    const data = await this.hrmService.approveLeave(id, dto, userId);
    return ApiResponse.ok(data, 'Leave approved');
  }

  @Put('leaves/:id/reject')
  @ApiOperation({ summary: 'Reject leave request' })
  async rejectLeave(
    @Param('id') id: number,
    @Body() dto: RejectLeaveDto,
  ) {
    const userId = 'system';
    const data = await this.hrmService.rejectLeave(id, dto, userId);
    return ApiResponse.ok(data, 'Leave rejected');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // LEAVE BALANCE ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('leave-balances')
  @ApiOperation({ summary: 'Initialize leave balance' })
  async initializeLeaveBalance(@Body() dto: InitializeLeaveBalanceDto) {
    const userId = 'system';
    const data = await this.hrmService.initializeLeaveBalance(dto, userId);
    return ApiResponse.ok(data, 'Leave balance initialized');
  }

  @Get('leave-balances')
  @ApiOperation({ summary: 'List leave balances' })
  async listLeaveBalances(@Query() dto: LeaveBalanceFilterDto) {
    const data = await this.hrmService.listLeaveBalances(dto);
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PAYROLL ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('payroll')
  @ApiOperation({ summary: 'Create payroll' })
  async createPayroll(@Body() dto: CreatePayrollDto) {
    const userId = 'system';
    const data = await this.hrmService.createPayroll(dto, userId);
    return ApiResponse.ok(data, 'Payroll created successfully');
  }

  @Get('payroll')
  @ApiOperation({ summary: 'List payroll records' })
  async listPayroll(@Query() dto: PayrollFilterDto) {
    const data = await this.hrmService.listPayroll(dto);
    return ApiResponse.ok(data);
  }

  @Get('payroll/summary/:period')
  @ApiOperation({ summary: 'Get payroll summary for period' })
  async getPayrollSummary(@Param('period') period: string) {
    const data = await this.hrmService.getPayrollSummary(period);
    return ApiResponse.ok(data);
  }

  @Put('payroll/:id/mark-paid')
  @ApiOperation({ summary: 'Mark payroll as paid' })
  async markPayrollAsPaid(
    @Param('id') id: number,
    @Body() body: { paymentDate: string },
  ) {
    const userId = 'system';
    const data = await this.hrmService.markPayrollAsPaID(id, body.paymentDate, userId);
    return ApiResponse.ok(data, 'Payroll marked as paid');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // LOAN ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('loans')
  @ApiOperation({ summary: 'Create employee loan' })
  async createLoan(@Body() dto: CreateLoanDto) {
    const userId = 'system';
    const data = await this.hrmService.createLoan(dto, userId);
    return ApiResponse.ok(data, 'Loan created successfully');
  }

  @Get('loans')
  @ApiOperation({ summary: 'List employee loans' })
  async listLoans(@Query() dto: LoanFilterDto) {
    const data = await this.hrmService.listLoans(dto);
    return ApiResponse.ok(data);
  }

  @Get('loans/:id')
  @ApiOperation({ summary: 'Get loan details with installments' })
  async getLoanDetails(@Param('id') id: number) {
    const data = await this.hrmService.getLoanDetails(id);
    return ApiResponse.ok(data);
  }

  @Post('loans/installment-payment')
  @ApiOperation({ summary: 'Record loan installment payment' })
  async recordLoanPayment(@Body() dto: RecordLoanPaymentDto) {
    const userId = 'system';
    const data = await this.hrmService.RecordLoanPayment(dto, userId);
    return ApiResponse.ok(data, 'Loan payment recorded');
  }
}
