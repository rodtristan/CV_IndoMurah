import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PriceService } from './price-service';
import {
  UpdateProductPriceDto,
  BulkUpdatePriceDto,
  PriceHistoryFilterDto,
  PriceChangeReportDto,
  PriceAnalysisDto,
} from './price.dto';

@ApiTags('Business Logic - Price Management')
@ApiBearerAuth()
@Controller('business-logic/price')
export class PriceController {
  constructor(private priceService: PriceService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // PRICE UPDATE
  // ─────────────────────────────────────────────────────────────────────────────

  @Put(':productId/selling')
  @ApiOperation({ summary: 'Update product selling price' })
  async updateSellingPrice(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: UpdateProductPriceDto,
  ) {
    return this.priceService.updateSellingPrice(productId, dto, 'system');
  }

  @Put(':productId/purchase')
  @ApiOperation({ summary: 'Update product purchase price' })
  async updatePurchasePrice(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: { PurchasePrice: number; Reason?: string },
  ) {
    return this.priceService.updatePurchasePrice(productId, dto, 'system');
  }

  @Post('bulk-update')
  @ApiOperation({ summary: 'Bulk update prices' })
  async bulkUpdatePrices(@Body() dto: BulkUpdatePriceDto) {
    return this.priceService.bulkUpdatePrices(dto, 'system');
  }

  @Post('adjust-by-percent')
  @ApiOperation({ summary: 'Adjust prices by percentage' })
  async adjustPricesByPercent(
    @Body()
    dto: {
      CategoryId?: number;
      ProductIds?: number[];
      AdjustmentPercent: number;
      AdjustmentType: 'INCREASE' | 'DECREASE';
      Reason?: string;
    },
  ) {
    return this.priceService.adjustPricesByPercent({
      CategoryId: dto.CategoryId,
      ProductIds: dto.ProductIds,
      adjustmentPercent: dto.AdjustmentPercent,
      adjustmentType: dto.AdjustmentType,
      Reason: dto.Reason,
    }, 'system');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PRICE HISTORY
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('history')
  @ApiOperation({ summary: 'Get price history' })
  async getPriceHistory(@Query() dto: PriceHistoryFilterDto) {
    return this.priceService.getPriceHistory(dto);
  }

  @Get('history/:productId')
  @ApiOperation({ summary: 'Get product price history' })
  async getProductPriceHistory(@Param('productId', ParseIntPipe) productId: number) {
    return this.priceService.getProductPriceHistory(productId);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // REPORTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('reports/change')
  @ApiOperation({ summary: 'Get price change report' })
  async getPriceChangeReport(@Query() dto: PriceChangeReportDto) {
    return this.priceService.getPriceChangeReport(dto);
  }

  @Get('reports/analysis')
  @ApiOperation({ summary: 'Get price analysis' })
  async getPriceAnalysis(@Query() dto: PriceAnalysisDto) {
    return this.priceService.getPriceAnalysis(dto);
  }
}
