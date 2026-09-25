import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PayrollService } from './payroll-service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../../common/decorators/current-user-decorator';
import {
  CreatePayrollDto,
  UpdatePayrollDto,
  PayrollFilterDto,
  PaymentPayrollDto,
  PayrollSummaryDto,
} from './payroll.dto';

@UseGuards(JwtAuthGuard)
@Controller('business-logic/payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post()
  async createPayroll(
    @Body() dto: CreatePayrollDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.payrollService.createPayroll(dto, userId);
  }

  @Get()
  async listPayrolls(@Query() dto: PayrollFilterDto) {
    return this.payrollService.listPayrolls(dto);
  }

  @Get('summary')
  async getPayrollSummary(@Query() dto: PayrollSummaryDto) {
    return this.payrollService.getPayrollSummary(dto);
  }

  @Get(':id')
  async getPayroll(@Param('id', ParseIntPipe) id: number) {
    return this.payrollService.getPayroll(id);
  }

  @Get('employee/:employeeId/history')
  async getEmployeePayrollHistory(@Param('employeeId', ParseIntPipe) employeeId: number) {
    return this.payrollService.getEmployeePayrollHistory(employeeId);
  }

  @Patch(':id')
  async updatePayroll(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePayrollDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.payrollService.updatePayroll(id, dto, userId);
  }

  @Post('payment')
  async paymentPayroll(
    @Body() dto: PaymentPayrollDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.payrollService.paymentPayroll(dto, userId);
  }

  @Delete(':id')
  async deletePayroll(@Param('id', ParseIntPipe) id: number) {
    return this.payrollService.deletePayroll(id);
  }
}
