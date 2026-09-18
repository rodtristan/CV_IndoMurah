import { Controller, Get, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ReportService } from './report.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../common/dto/api-response-dto';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('sales')
  @ApiOperation({ summary: 'Sales Report' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiQuery({ name: 'warehouseId', required: false })
  @ApiQuery({ name: 'customerId', required: false })
  async salesReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('customerId') customerId?: string,
  ) {
    const data = await this.reportService.salesReport({ startDate, endDate, warehouseId: warehouseId ? Number(warehouseId) : undefined, customerId: customerId ? Number(customerId) : undefined });
    return ApiResponse.ok(data);
  }

  @Get('purchase')
  @ApiOperation({ summary: 'Purchase Report' })
  async purchaseReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('supplierId') supplierId?: string,
  ) {
    const data = await this.reportService.purchaseReport({ startDate, endDate, warehouseId: warehouseId ? Number(warehouseId) : undefined, supplierId: supplierId ? Number(supplierId) : undefined });
    return ApiResponse.ok(data);
  }

  @Get('inventory')
  @ApiOperation({ summary: 'Inventory Report' })
  async inventoryReport(
    @Query('warehouseId') warehouseId?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    const data = await this.reportService.inventoryReport({ warehouseId: warehouseId ? Number(warehouseId) : undefined, categoryId: categoryId ? Number(categoryId) : undefined });
    return ApiResponse.ok(data);
  }

  @Get('cash')
  @ApiOperation({ summary: 'Cash Report' })
  async cashReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const data = await this.reportService.cashReport({ startDate, endDate });
    return ApiResponse.ok(data);
  }

  @Get('profit-loss')
  @ApiOperation({ summary: 'Profit & Loss Report' })
  async profitLossReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const data = await this.reportService.profitLossReport({ startDate, endDate });
    return ApiResponse.ok(data);
  }

  @Get('debt')
  @ApiOperation({ summary: 'Debt Report (Unpaid Purchases)' })
  async debtReport() {
    const data = await this.reportService.debtReport();
    return ApiResponse.ok(data);
  }

  @Get('receivable')
  @ApiOperation({ summary: 'Receivable Report (Unpaid Sales)' })
  async receivableReport() {
    const data = await this.reportService.receivableReport();
    return ApiResponse.ok(data);
  }

  @Get('stock-mutation')
  @ApiOperation({ summary: 'Stock Mutation Report (Kartu Stok / Mutasi Stok)' })
  @ApiQuery({ name: 'productId', required: true })
  @ApiQuery({ name: 'warehouseId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async stockMutationReport(
    @Query('productId') productId: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (!productId || !Number.isFinite(Number(productId))) {
      throw new BadRequestException('productId is required');
    }
    const data = await this.reportService.stockMutationReport({
      productId: Number(productId),
      warehouseId: warehouseId ? Number(warehouseId) : undefined,
      startDate,
      endDate,
    });
    return ApiResponse.ok(data);
  }
}
