import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CashFlowService } from './cash-flow-service';
import {
  CreateCashFlowCategoryDto,
  UpdateCashFlowCategoryDto,
  CreateCashFlowTransactionDto,
  UpdateCashFlowTransactionDto,
  CashFlowFilterDto,
  CashFlowReportDto,
  CashFlowSummaryDto,
  CashFlowProjectionDto,
} from './cash-flow.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../../common/dto/api-response-dto';
import { UseGuards as NestUseGuards } from '@nestjs/common';

@ApiTags('Cash Flow - Arus Kas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-logic/cash-flow')
export class CashFlowController {
  constructor(private cashFlowService: CashFlowService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // CASH FLOW CATEGORY
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('categories')
  @ApiOperation({ summary: 'Create cash flow category' })
  async createCashFlowCategory(@Body() dto: CreateCashFlowCategoryDto, @Request() req: any) {
    const data = await this.cashFlowService.createCashFlowCategory(dto, req.user?.id || '1');
    return ApiResponse.ok(data, 'Cash flow category created successfully');
  }

  @Get('categories')
  @ApiOperation({ summary: 'List cash flow categories' })
  async listCashFlowCategories(@Query('isActive') isActive?: string) {
    const data = await this.cashFlowService.listCashFlowCategories(
      isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    );
    return ApiResponse.ok(data);
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get cash flow category by ID' })
  async getCashFlowCategory(@Param('id') id: string) {
    const data = await this.cashFlowService.getCashFlowCategory(parseInt(id));
    return ApiResponse.ok(data);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update cash flow category' })
  async updateCashFlowCategory(
    @Param('id') id: string,
    @Body() dto: UpdateCashFlowCategoryDto,
  ) {
    const data = await this.cashFlowService.updateCashFlowCategory(parseInt(id), dto);
    return ApiResponse.ok(data, 'Cash flow category updated successfully');
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete cash flow category' })
  async deleteCashFlowCategory(@Param('id') id: string) {
    const data = await this.cashFlowService.deleteCashFlowCategory(parseInt(id));
    return ApiResponse.ok(data, 'Cash flow category deleted successfully');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CASH FLOW TRANSACTION
  // ─────────────────────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create cash flow transaction' })
  async createCashFlowTransaction(@Body() dto: CreateCashFlowTransactionDto, @Request() req: any) {
    const data = await this.cashFlowService.createCashFlowTransaction(dto, req.user?.id || '1');
    return ApiResponse.ok(data, 'Cash flow transaction created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'List cash flow transactions' })
  async listCashFlowTransactions(@Query() dto: CashFlowFilterDto) {
    const data = await this.cashFlowService.listCashFlowTransactions(dto);
    return ApiResponse.ok(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cash flow transaction by ID' })
  async getCashFlowTransaction(@Param('id') id: string) {
    const data = await this.cashFlowService.getCashFlowTransaction(parseInt(id));
    return ApiResponse.ok(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update cash flow transaction' })
  async updateCashFlowTransaction(
    @Param('id') id: string,
    @Body() dto: UpdateCashFlowTransactionDto,
  ) {
    const data = await this.cashFlowService.updateCashFlowTransaction(parseInt(id), dto);
    return ApiResponse.ok(data, 'Cash flow transaction updated successfully');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete cash flow transaction' })
  async deleteCashFlowTransaction(@Param('id') id: string) {
    const data = await this.cashFlowService.deleteCashFlowTransaction(parseInt(id));
    return ApiResponse.ok(data, 'Cash flow transaction deleted successfully');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // REPORTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('report/summary')
  @ApiOperation({ summary: 'Get cash flow summary' })
  async getCashFlowSummary(@Query() dto: CashFlowSummaryDto) {
    const data = await this.cashFlowService.getCashFlowSummary(dto);
    return ApiResponse.ok(data);
  }

  @Get('report/detail')
  @ApiOperation({ summary: 'Get cash flow report' })
  async getCashFlowReport(@Query() dto: CashFlowReportDto) {
    const data = await this.cashFlowService.getCashFlowReport(dto);
    return ApiResponse.ok(data);
  }

  @Get('report/projection')
  @ApiOperation({ summary: 'Get cash flow projection' })
  async getCashFlowProjection(@Query() dto: CashFlowProjectionDto) {
    const data = await this.cashFlowService.getCashFlowProjection(dto);
    return ApiResponse.ok(data);
  }

  @Get('account/:accountId/detail')
  @ApiOperation({ summary: 'Get cash flow by account' })
  async getCashFlowByAccount(
    @Param('accountId') accountId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const data = await this.cashFlowService.getCashFlowByAccount(parseInt(accountId), startDate, endDate);
    return ApiResponse.ok(data);
  }
}
function UseGuards(guard: any) {
  return NestUseGuards(guard);
}

