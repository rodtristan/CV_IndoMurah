import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { LoanService } from './loan-service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import {
  CreateLoanDto,
  UpDateLoanDto,
  RecordInstallmentDto,
  LoanFilterDto,
  LoanSummaryDto,
} from './loan.dto';

@UseGuards(JwtAuthGuard)
@Controller('business-logic/loans')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @Post()
  async createLoan(
    @Body() dto: CreateLoanDto,
    @Query('userId') userId: string = 'system',
  ) {
    return this.loanService.createLoan(dto, userId);
  }

  @Get()
  async listLoans(@Query() dto: LoanFilterDto) {
    return this.loanService.listLoans(dto);
  }

  @Get('summary')
  async getLoanSummary(@Query() dto: LoanSummaryDto) {
    return this.loanService.getLoanSummary(dto);
  }

  @Get('types')
  async getLoanTypes() {
    return this.loanService.getLoanTypes();
  }

  @Get('statuses')
  async getLoanStatuses() {
    return this.loanService.getLoanStatuses();
  }

  @Get(':id')
  async getLoan(@Param('id', ParseIntPipe) id: number) {
    return this.loanService.getLoan(id);
  }

  @Get('employee/:employeeId/history')
  async getEmployeeLoanHistory(@Param('employeeId', ParseIntPipe) employeeId: number) {
    return this.loanService.getEmployeeLoanHistory(employeeId);
  }

  @Patch(':id')
  async updateLoan(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpDateLoanDto,
  ) {
    return this.loanService.updateLoan(id, dto);
  }

  @Post('installment')
  async recordInstallment(
    @Body() dto: RecordInstallmentDto,
    @Query('userId') userId: string = 'system',
  ) {
    return this.loanService.RecordInstallment(dto, userId);
  }
}
