import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CashService } from './cash-service';
import {
  RecordCashInDto,
  RecordCashOutDto,
  TransferCashDto,
  CashFlowFilterDto,
  CashBalanceDto,
  CashSummaryDto,
} from './cash.dto';

@ApiTags('Business Logic - Cash Management')
@ApiBearerAuth()
@Controller('business-logic/cash')
export class CashController {
  constructor(private cashService: CashService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // CASH IN
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('in')
  @ApiOperation({ summary: 'Record cash in' })
  async recordCashIn(@Body() dto: RecordCashInDto) {
    return this.cashService.recordCashIn(dto, 'system');
  }

  @Get('in/list')
  @ApiOperation({ summary: 'List cash in records' })
  async listCashIn(@Query() dto: CashFlowFilterDto) {
    return this.cashService.listCashIn(dto);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CASH OUT
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('out')
  @ApiOperation({ summary: 'Record cash out' })
  async recordCashOut(@Body() dto: RecordCashOutDto) {
    return this.cashService.recordCashOut(dto, 'system');
  }

  @Get('out/list')
  @ApiOperation({ summary: 'List cash out records' })
  async listCashOut(@Query() dto: CashFlowFilterDto) {
    return this.cashService.listCashOut(dto);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CASH TRANSFER
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('transfer')
  @ApiOperation({ summary: 'Transfer cash between accounts' })
  async transferCash(@Body() dto: TransferCashDto) {
    return this.cashService.transferCash(dto, 'system');
  }

  @Get('transfer/list')
  @ApiOperation({ summary: 'List cash transfers' })
  async listCashTransfers(@Query() dto: CashFlowFilterDto) {
    return this.cashService.listCashTransfers(dto);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CASH FLOW & BALANCE
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('balance')
  @ApiOperation({ summary: 'Get cash balance for accounts' })
  async getCashBalance(@Query() dto: CashBalanceDto) {
    return this.cashService.getCashBalance(dto);
  }

  @Get('report/flow')
  @ApiOperation({ summary: 'Get cash flow report' })
  async getCashFlowReport(@Query() dto: CashSummaryDto) {
    return this.cashService.getCashFlowReport(dto);
  }
}
