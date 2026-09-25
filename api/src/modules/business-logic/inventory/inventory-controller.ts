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
import { InventoryService } from './inventory-service';
import { StockTransferDto, StockAdjustmentDto, StockOpNameDto, StockReportDto, ValuationReportDto, CreateOpeningStockDto, FixBalanceDto } from './inventory.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../../common/decorators/current-user-decorator';
import { ApiResponse } from '../../../common/dto/api-response-dto';

@ApiTags('Inventory - Manajemen Stok')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-logic/inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // OPENING STOCK
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('opening-stock')
  @ApiOperation({ summary: 'Initialize opening stock for products in a warehouse' })
  async createOpeningStock(@Body() dto: CreateOpeningStockDto, @CurrentUser() user: any) {
    const data = await this.inventoryService.createOpeningStock(dto, user.ID);
    return ApiResponse.ok(data, 'Opening stock created successfully');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STOCK TRANSFER
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('transfer')
  @ApiOperation({ summary: 'Transfer stock between warehouses' })
  async transferStock(@Body() dto: StockTransferDto, @CurrentUser() user: any) {
    const data = await this.inventoryService.TransferStock(dto, user.ID);
    return ApiResponse.ok(data, 'Stock transferred successfully');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STOCK ADJUSTMENT
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('adjustment')
  @ApiOperation({ summary: 'Adjust stock (STOCK_IN, STOCK_OUT, CORRECTION)' })
  async adjustStock(@Body() dto: StockAdjustmentDto, @CurrentUser() user: any) {
    const data = await this.inventoryService.adjustStock(dto, user.ID);
    return ApiResponse.ok(data, 'Stock adjusted successfully');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STOCK OPNAME
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('opname')
  @ApiOperation({ summary: 'Perform stock opname (stock take)' })
  async performStockOpname(@Body() dto: StockOpNameDto, @CurrentUser() user: any) {
    const data = await this.inventoryService.performStockOpName(dto, user.ID);
    return ApiResponse.ok(data, 'Stock opname completed');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STOCK REPORTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('stock-report')
  @ApiOperation({ summary: 'Get stock movement report' })
  async getStockReport(@Query() dto: StockReportDto) {
    const data = await this.inventoryService.getStockReport(dto);
    return ApiResponse.ok(data);
  }

  @Get('valuation-report')
  @ApiOperation({ summary: 'Get stock valuation report' })
  async getStockValuation(@Query() dto: ValuationReportDto) {
    const data = await this.inventoryService.getStockValuation(dto);
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FIX BALANCE
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('fix-balance')
  @ApiOperation({ summary: 'Fix stock balance discrepancies' })
  async fixBalance(@Body() dto: FixBalanceDto, @CurrentUser() user: any) {
    const data = await this.inventoryService.fixBalance(dto, user.ID);
    return ApiResponse.ok(data, 'Stock balance fixed successfully');
  }
}
