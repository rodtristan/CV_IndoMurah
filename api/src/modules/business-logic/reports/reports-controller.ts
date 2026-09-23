import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports-service';
import { ReportsServiceExtensions } from './reports-service-extensions';
import {
  SalesReportDto,
  InventoryReportDto,
  StockMovementReportDto,
  ReceivableAgingReportDto,
  PayableAgingReportDto,
  CashFlowReportDto,
  ProfitLossReportDto,
  AttendanceSummaryReportDto,
  PayrollSummaryReportDto,
  TopProductsReportDto,
  CustomerRevenueReportDto,
  SupplierPurchaseReportDto,
  ExpenseReportDto,
  DashboardSummaryDto,
} from './reports.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../../common/dto/api-response-dto';

@ApiTags('Reports - Laporan')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-logic/reports')
export class ReportsController {
  constructor(
    private reportsService: ReportsService,
    private reportsExtensionsService: ReportsServiceExtensions,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // DASHBOARD
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard summary' })
  async getDashboardSummary(@Query() dto: DashboardSummaryDto) {
    const data = await this.reportsService.getDashboardSummary(dto);
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SALES REPORTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('sales')
  @ApiOperation({ summary: 'Get sales report' })
  async getSalesReport(@Query() dto: SalesReportDto) {
    const data = await this.reportsService.getSalesReport(dto);
    return ApiResponse.ok(data);
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Get top products report' })
  async getTopProductsReport(@Query() dto: TopProductsReportDto) {
    const data = await this.reportsService.getTopProductsReport(dto);
    return ApiResponse.ok(data);
  }

  @Get('customer-revenue')
  @ApiOperation({ summary: 'Get customer revenue report' })
  async getCustomerRevenueReport(@Query() dto: CustomerRevenueReportDto) {
    const data = await this.reportsService.getCustomerRevenueReport(dto);
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // INVENTORY REPORTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('inventory')
  @ApiOperation({ summary: 'Get inventory report' })
  async getInventoryReport(@Query() dto: InventoryReportDto) {
    const data = await this.reportsService.getInventoryReport(dto);
    return ApiResponse.ok(data);
  }

  @Get('stock-movement')
  @ApiOperation({ summary: 'Get stock movement report' })
  async getStockMovementReport(@Query() dto: StockMovementReportDto) {
    const data = await this.reportsService.getStockMovementReport(dto);
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FINANCIAL REPORTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('receivable-aging')
  @ApiOperation({ summary: 'Get receivable aging report' })
  async getReceivableAgingReport(@Query() dto: ReceivableAgingReportDto) {
    const data = await this.reportsService.getReceivableAgingReport(dto);
    return ApiResponse.ok(data);
  }

  @Get('payable-aging')
  @ApiOperation({ summary: 'Get payable aging report' })
  async getPayableAgingReport(@Query() dto: PayableAgingReportDto) {
    const data = await this.reportsService.getPayableAgingReport(dto);
    return ApiResponse.ok(data);
  }

  @Get('cash-flow')
  @ApiOperation({ summary: 'Get cash flow report' })
  async getCashFlowReport(@Query() dto: CashFlowReportDto) {
    const data = await this.reportsService.getCashFlowReport(dto);
    return ApiResponse.ok(data);
  }

  @Get('profit-loss')
  @ApiOperation({ summary: 'Get profit and loss report' })
  async getProfitLossReport(@Query() dto: ProfitLossReportDto) {
    const data = await this.reportsService.getProfitLossReport(dto);
    return ApiResponse.ok(data);
  }

  @Get('expense')
  @ApiOperation({ summary: 'Get expense report' })
  async getExpenseReport(@Query() dto: ExpenseReportDto) {
    const data = await this.reportsService.getExpenseReport(dto);
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HR REPORTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('attendance-summary')
  @ApiOperation({ summary: 'Get attendance summary report' })
  async getAttendanceSummaryReport(@Query() dto: AttendanceSummaryReportDto) {
    const data = await this.reportsService.getAttendanceSummaryReport(dto);
    return ApiResponse.ok(data);
  }

  @Get('payroll-summary')
  @ApiOperation({ summary: 'Get payroll summary report' })
  async getPayrollSummaryReport(@Query() dto: PayrollSummaryReportDto) {
    const data = await this.reportsExtensionsService.getPayrollSummary(dto);
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SUPPLIER REPORTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('supplier-purchase')
  @ApiOperation({ summary: 'Get supplier purchase report' })
  async getSupplierPurchaseReport(@Query() dto: SupplierPurchaseReportDto) {
    const data = await this.reportsService.getSupplierPurchaseReport(dto);
    return ApiResponse.ok(data);
  }
}
