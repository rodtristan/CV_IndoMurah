import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics-service';
import {
  DashboardSummaryDto,
  SalesReportDto,
  ProfitReportDto,
  TopProductsDto,
  TopCustomersDto,
  InventoryReportDto,
  CashFlowReportDto,
  TaxReportDto,
  SalesTrendDto,
} from './analytics.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../../common/dto/api-response-dto';

@ApiTags('Analytics - Laporan & Analisis')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-logic/analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // DASHBOARD
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('dashboard')
  @ApiOperation({ summary: 'Get comprehensive dashboard summary' })
  async getDashboardSummary(@Query() dto: DashboardSummaryDto) {
    const data = await this.analyticsService.getDashboardSummary(dto);
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SALES REPORTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('sales-report')
  @ApiOperation({ summary: 'Generate detailed sales report' })
  async getSalesReport(@Query() dto: SalesReportDto) {
    const data = await this.analyticsService.getSalesReport(dto);
    return ApiResponse.ok(data);
  }

  @Get('sales-by-category')
  @ApiOperation({ summary: 'Get sales breakdown by category' })
  async getSalesByCategory(@Query() dto: SalesReportDto) {
    const data = await this.analyticsService.getSalesByCategory(dto);
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PROFIT REPORT
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('profit-report')
  @ApiOperation({ summary: 'Generate profit/loss report' })
  async getProfitReport(@Query() dto: ProfitReportDto) {
    const data = await this.analyticsService.getProfitReport(dto);
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TOP PERFORMERS
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('top-products')
  @ApiOperation({ summary: 'Get top selling products' })
  async getTopProducts(@Query() dto: TopProductsDto) {
    const data = await this.analyticsService.getTopProducts(dto);
    return ApiResponse.ok(data);
  }

  @Get('top-customers')
  @ApiOperation({ summary: 'Get top customers by revenue' })
  async getTopCustomers(@Query() dto: TopCustomersDto) {
    const data = await this.analyticsService.getTopCustomers(dto);
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // INVENTORY REPORT
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('inventory-report')
  @ApiOperation({ summary: 'Generate inventory/stock report' })
  async getInventoryReport(@Query() dto: InventoryReportDto) {
    const data = await this.analyticsService.getInventoryReport(dto);
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CASH FLOW & TAX
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('cash-flow')
  @ApiOperation({ summary: 'Generate cash flow report' })
  async getCashFlowReport(@Query() dto: CashFlowReportDto) {
    const data = await this.analyticsService.getCashFlowReport(dto);
    return ApiResponse.ok(data);
  }

  @Get('tax-report')
  @ApiOperation({ summary: 'Generate tax report' })
  async getTaxReport(@Query() dto: TaxReportDto) {
    const data = await this.analyticsService.getTaxReport(dto);
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TREND ANALYSIS
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('sales-trend')
  @ApiOperation({ summary: 'Get sales trend analysis with comparison' })
  async getSalesTrend(@Query() dto: SalesTrendDto) {
    const data = await this.analyticsService.getSalesTrend(dto);
    return ApiResponse.ok(data);
  }
}
