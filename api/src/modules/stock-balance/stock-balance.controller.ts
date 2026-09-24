import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { StockBalanceService } from './stock-balance.service';

interface BalanceBody { warehouseId?: number | string | null; productIds?: number[] }

@ApiTags('StockBalance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stock-balance')
export class StockBalanceController {
  constructor(private readonly service: StockBalanceService) {}

  private wh(b: BalanceBody) {
    const n = Number(b?.warehouseId);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }

  @Post('preview')
  @ApiOperation({ summary: 'Dry-run: per-product old vs recalculated stock balance' })
  async preview(@Body() body: BalanceBody) {
    return { success: true, data: await this.service.preview(this.wh(body)) };
  }

  @Post('apply')
  @ApiOperation({ summary: 'Apply recalculated balances to Product.Stock / ProductStock (transaction)' })
  async apply(@Body() body: BalanceBody) {
    return { success: true, data: await this.service.apply(this.wh(body), body?.productIds) };
  }
}
