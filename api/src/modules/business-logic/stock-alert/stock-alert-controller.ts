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
import { StockAlertService } from './stock-alert-service';
import {
  StockAlertFilterDto,
  ResolveStockAlertDto,
  BulkResolveAlertDto,
  ReorderStockDto,
  StockLevelReportDto,
} from './stock-alert.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../../common/dto/api-response-dto';

@ApiTags('Stock Alert - Alert Stok')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-logic/stock-alert')
export class StockAlertController {
  constructor(private stockAlertService: StockAlertService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // STOCK ALERTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Get all stock alerts with filters' })
  async getStockAlerts(@Query() dto: StockAlertFilterDto) {
    const data = await this.stockAlertService.getStockAlerts(dto);
    return ApiResponse.ok(data);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get stock alert summary for dashboard' })
  async getStockAlertSummary(@Query('warehouseId') warehouseId?: string) {
    const data = await this.stockAlertService.getStockAlertSummary(
      warehouseId ? parseInt(warehouseId) : undefined,
    );
    return ApiResponse.ok(data);
  }

  @Put(':alertId/read')
  @ApiOperation({ summary: 'Mark alert as read' })
  async markAsRead(@Param('alertId', ParseIntPipe) alertId: number) {
    const data = await this.stockAlertService.markAsRead(alertId);
    return ApiResponse.ok(data, 'Alert marked as read');
  }

  @Put('read-multiple')
  @ApiOperation({ summary: 'Mark multiple alerts as read' })
  async markMultipleAsRead(@Body() dto: { AlertIds: number[] }) {
    const data = await this.stockAlertService.markMultipleAsRead(dto.AlertIds);
    return ApiResponse.ok(data, `${dto.AlertIds.length} alerts marked as read`);
  }

  @Put(':alertId/resolve')
  @ApiOperation({ summary: 'Resolve an alert' })
  async resolveAlert(
    @Param('alertId', ParseIntPipe) alertId: number,
    @Body() dto: ResolveStockAlertDto,
  ) {
    const data = await this.stockAlertService.resolveAlert(alertId, dto);
    return ApiResponse.ok(data, 'Alert resolved');
  }

  @Put('resolve-multiple')
  @ApiOperation({ summary: 'Bulk resolve alerts' })
  async bulkResolveAlerts(@Body() dto: BulkResolveAlertDto) {
    const data = await this.stockAlertService.bulkResolveAlerts(dto);
    return ApiResponse.ok(data, `${dto.AlertIds.length} alerts resolved`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STOCK LEVEL REPORT
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('stock-level-report')
  @ApiOperation({ summary: 'Generate stock level report' })
  async getStockLevelReport(@Query() dto: StockLevelReportDto) {
    const data = await this.stockAlertService.getStockLevelReport(dto);
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // REORDER MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('reorder-suggestion/:productId')
  @ApiOperation({ summary: 'Get reorder suggestion for a product' })
  async getReorderSuggestion(@Param('productId', ParseIntPipe) productId: number) {
    const data = await this.stockAlertService.createReOrderSuggestion(productId);
    return ApiResponse.ok(data);
  }

  @Get('products-needing-reorder')
  @ApiOperation({ summary: 'Get list of products needing reorder' })
  async getProductsNeedingReorder(@Query('warehouseId') warehouseId?: string) {
    const data = await this.stockAlertService.getProductsNeedingReOrder(
      warehouseId ? parseInt(warehouseId) : undefined,
    );
    return ApiResponse.ok(data);
  }

  @Post('create-purchase-order')
  @ApiOperation({ summary: 'Create purchase order from reorder suggestion' })
  async createPurchaseOrder(@Body() dto: ReorderStockDto) {
    const data = await this.stockAlertService.generateReOrderPurchaseOrder(dto);
    return ApiResponse.ok(data, 'Purchase order created');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // AUTO CHECK (For scheduler)
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('check-stock')
  @ApiOperation({ summary: 'Check all products and create alerts (for scheduler)' })
  async checkAndCreateAlerts(@Query('warehouseId') warehouseId?: string) {
    const data = await this.stockAlertService.CheckAndCreateAlerts(
      warehouseId ? parseInt(warehouseId) : undefined,
    );
    return ApiResponse.ok(data);
  }
}
