import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';
import { BalanceSource, StockBalanceService } from './stock-balance.service';

interface BalanceBody { warehouseId?: number | string | null; productIds?: number[]; source?: BalanceSource }
interface AdjustBody {
  warehouseId?: number | string;
  items?: { productId: number; actualStock: number; currentStock?: number; notes?: string }[];
  notes?: string;
  date?: string;
}

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

  private src(b: BalanceBody): BalanceSource {
    return b?.source === 'documents' ? 'documents' : 'ledger';
  }

  @Post('preview')
  @ApiOperation({ summary: 'Dry-run: saldo lama vs saldo hitung ulang (source: ledger | documents)' })
  async preview(@Body() body: BalanceBody) {
    return { success: true, data: await this.service.preview(this.wh(body), this.src(body)) };
  }

  @Post('apply')
  @ApiOperation({ summary: 'Terapkan saldo hitung ulang ke ProductStock / Product.Stock (transaksi)' })
  async apply(@Body() body: BalanceBody, @CurrentUser() user: any) {
    return { success: true, data: await this.service.apply(this.wh(body), body?.productIds, this.src(body), user?.id) };
  }

  @Post('backfill-opening')
  @ApiOperation({ summary: '(Admin, sekali jalan, idempoten) Buat baris ledger OPENING dari saldo ProductStock saat ini' })
  async backfill(@CurrentUser() user: any) {
    return { success: true, data: await this.service.backfillOpening(user?.id) };
  }

  @Post('adjust')
  @ApiOperation({ summary: 'Perbaikan saldo per gudang: saldo := saldo aktual (mutasi ADJUST di ledger)' })
  async adjust(@Body() body: AdjustBody, @CurrentUser() user: any) {
    return { success: true, data: await this.service.adjust(body, user?.id), message: 'Saldo stok diperbaiki' };
  }
}
