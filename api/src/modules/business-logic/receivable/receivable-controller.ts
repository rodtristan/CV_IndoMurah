import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReceivableService } from './receivable-service';
import {
  RecordPaymentDto,
  RecordBulkPaymentDto,
  ReceivableFilterDto,
  CustomerCreditLimitDto,
  SendReminderDto,
  AgingReportDto,
  WriteOffReceivableDto,
} from './receivable.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../../common/decorators/current-user-decorator';
import { ApiResponse } from '../../../common/dto/api-response-dto';

@ApiTags('Receivable - Piutang Pelanggan')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-logic/receivable')
export class ReceivableController {
  constructor(private receivableService: ReceivableService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // OVERVIEW & LISTING
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('overview')
  @ApiOperation({ summary: 'Get all customers with outstanding receivables' })
  async getReceivablesOverview(@Query() dto: ReceivableFilterDto) {
    const data = await this.receivableService.getReceivablesOverview(dto);
    return ApiResponse.ok(data);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get detailed receivable history for a customer' })
  async getCustomerReceivables(@Param('customerId', ParseIntPipe) customerId: number) {
    const data = await this.receivableService.getCustomerReceivables(customerId);
    return ApiResponse.ok(data);
  }

  @Get('aging-report')
  @ApiOperation({ summary: 'Generate aging report for receivables' })
  async getAgingReport(@Query() dto: AgingReportDto) {
    const data = await this.receivableService.getAgingReport(dto);
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PAYMENT RECORDING
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('sale/:saleId/payment')
  @ApiOperation({ summary: 'Record payment for a sale' })
  async recordPayment(
    @Param('saleId', ParseIntPipe) saleId: number,
    @Body() dto: RecordPaymentDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.receivableService.RecordPayment(saleId, dto, user.ID);
    return ApiResponse.ok(data, 'Payment recorded successfully');
  }

  @Post('bulk-payment')
  @ApiOperation({ summary: 'Record bulk payment for multiple sales' })
  async recordBulkPayment(@Body() dto: RecordBulkPaymentDto, @CurrentUser() user: any) {
    const data = await this.receivableService.RecordBulkPayment(dto, user.ID);
    return ApiResponse.ok(data, 'Bulk payment recorded successfully');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CUSTOMER DEPOSIT
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('customer/:customerId/deposit')
  @ApiOperation({ summary: 'Add customer deposit (Uang muka pelanggan)' })
  async addCustomerDeposit(
    @Param('customerId', ParseIntPipe) customerId: number,
    @Body() dto: { Amount: number; Notes?: string },
    @CurrentUser() user: any,
  ) {
    const data = await this.receivableService.addCustomerDeposit(customerId, dto, user.ID);
    return ApiResponse.ok(data, 'Deposit added successfully');
  }

  @Post('customer/:customerId/use-deposit/:saleId')
  @ApiOperation({ summary: 'Use customer deposit for payment' })
  async useCustomerDeposit(
    @Param('customerId', ParseIntPipe) customerId: number,
    @Param('saleId', ParseIntPipe) saleId: number,
    @Body() dto: { Amount: number },
    @CurrentUser() user: any,
  ) {
    const data = await this.receivableService.useCustomerDeposit(customerId, saleId, dto.Amount, user.ID);
    return ApiResponse.ok(data, 'Deposit used for payment');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CREDIT MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('customer/:customerId/credit-check')
  @ApiOperation({ summary: 'Check if customer can make purchase on credit' })
  async checkCreditAvailability(
    @Param('customerId', ParseIntPipe) customerId: number,
    @Query('amount') amount: string,
  ) {
    const data = await this.receivableService.CheckCreditAvailability(customerId, parseFloat(amount));
    return ApiResponse.ok(data);
  }

  @Put('customer/:customerId/credit-limit')
  @ApiOperation({ summary: 'Update customer credit limit' })
  async updateCreditLimit(
    @Param('customerId', ParseIntPipe) customerId: number,
    @Body() dto: CustomerCreditLimitDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.receivableService.updateCreditLimit(customerId, dto, user.ID);
    return ApiResponse.ok(data, 'Credit limit updated');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // REMINDER & NOTIFICATION
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('reminder')
  @ApiOperation({ summary: 'Send payment reminder to customer' })
  async sendPaymentReminder(@Body() dto: SendReminderDto, @CurrentUser() user: any) {
    const data = await this.receivableService.sendPaymentReminder(dto, user.ID);
    return ApiResponse.ok(data, 'Reminder sent');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // WRITE-OFF
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('write-off')
  @ApiOperation({ summary: 'Write off uncollectible receivable' })
  async writeOffReceivable(@Body() dto: WriteOffReceivableDto, @CurrentUser() user: any) {
    const data = await this.receivableService.writeOffReceivable(dto, user.ID);
    return ApiResponse.ok(data, 'Receivable written off');
  }
}
