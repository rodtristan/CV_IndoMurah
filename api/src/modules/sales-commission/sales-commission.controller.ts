import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../common/dto/api-response-dto';
import { CurrentUser } from '../../common/decorators/current-user-decorator';
import { SalesCommissionService } from './sales-commission.service';
import { ClearCommissionChequeDto, CreateCommissionPaymentDto, UpdateCommissionPaymentDto } from './dto/sales-commission.dto';

@ApiTags('Sales Commissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('SalesCommissions')
export class SalesCommissionController {
  constructor(private service: SalesCommissionService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar Pembayaran Komisi Sales (Smart Query)' })
  async findAll(@Query() query: any) {
    const { data, total, skip, take } = await this.service.findAll(query);
    return ApiResponse.paginated(data, total, skip, take);
  }

  @Get('eligible')
  @ApiOperation({ summary: 'Penjualan lunas yang komisinya dapat dibayar. Query: salesPersonId, from, to, paymentId' })
  async eligible(@Query('salesPersonId') sp: string, @Query('from') from?: string, @Query('to') to?: string, @Query('paymentId') paymentId?: string) {
    return ApiResponse.ok(await this.service.eligible(Number(sp), from, to, paymentId ? Number(paymentId) : undefined));
  }

  @Get('cheques')
  @ApiOperation({ summary: 'Status Lunas Cek/Bg Sales. Query: salesPersonId, number, cleared' })
  async cheques(@Query() q: { salesPersonId?: string; number?: string; cleared?: string }) {
    return ApiResponse.ok(await this.service.cheques(q));
  }

  @Put('cheques')
  @ApiOperation({ summary: 'Simpan Status Lunas Cek/Bg Sales' })
  async clearCheques(@Body() dto: ClearCommissionChequeDto, @CurrentUser() user: any) {
    return ApiResponse.ok(await this.service.clearCheques(dto, user.id), 'Status lunas tersimpan');
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return ApiResponse.ok(await this.service.findOne(id));
  }

  @Post()
  @ApiOperation({ summary: 'Simpan Bayar Komisi Sales' })
  async create(@Body() dto: CreateCommissionPaymentDto, @CurrentUser() user: any) {
    return ApiResponse.ok(await this.service.create(dto, user.id), 'Pembayaran komisi tersimpan');
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCommissionPaymentDto, @CurrentUser() user: any) {
    return ApiResponse.ok(await this.service.update(id, dto, user.id), 'Pembayaran komisi diperbarui');
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return ApiResponse.ok(await this.service.remove(id), 'Pembayaran komisi dihapus');
  }
}
