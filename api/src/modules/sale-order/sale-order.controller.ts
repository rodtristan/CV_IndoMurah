import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SaleOrderService } from './sale-order.service';
import { CreateSaleOrderDto, UpdateSaleOrderDto, UpdateSaleOrderStatusDto } from './dto/sale-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../common/dto/api-response-dto';
import { CurrentUser } from '../../common/decorators/current-user-decorator';

@ApiTags('Sale Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('SaleOrders')
export class SaleOrderController {
  constructor(private saleOrderService: SaleOrderService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar Pesanan Penjualan (Smart Query)' })
  async findAll(@Query() query: any) {
    const { data, total, skip, take } = await this.saleOrderService.findAll(query);
    return ApiResponse.paginated(data, total, skip, take);
  }

  @Get('open')
  @ApiOperation({ summary: 'Pesanan yang masih bisa dijual (lookup Pesanan di form penjualan)' })
  async open(@Query('customerId') customerId?: string) {
    return ApiResponse.ok(await this.saleOrderService.open(customerId ? Number(customerId) : undefined));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail Pesanan Penjualan' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Query() query: any) {
    const data = await this.saleOrderService.findOne(id, query);
    if (!data) throw new NotFoundException('Pesanan penjualan tidak ditemukan');
    return ApiResponse.ok(data);
  }

  @Post()
  @ApiOperation({ summary: 'Tambah Pesanan Penjualan' })
  async create(@Body() dto: CreateSaleOrderDto, @CurrentUser() user: any) {
    return ApiResponse.ok(await this.saleOrderService.create(dto, user.id), 'Pesanan penjualan tersimpan');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Ubah Pesanan Penjualan' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSaleOrderDto, @CurrentUser() user: any) {
    return ApiResponse.ok(await this.saleOrderService.update(id, dto, user.id), 'Pesanan penjualan diperbarui');
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Ubah status dokumen pesanan (CONFIRMED / COMPLETED / CANCELLED)' })
  async updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSaleOrderStatusDto) {
    return ApiResponse.ok(await this.saleOrderService.updateStatus(id, dto), 'Status diperbarui');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus Pesanan Penjualan' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return ApiResponse.ok(await this.saleOrderService.delete(id), 'Pesanan penjualan dihapus');
  }
}
