import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SalePaymentService } from './sale-payment.service';
import { CreateSalePaymentDto, UpdateSalePaymentDto } from './dto/sale-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';
import { ApiResponse } from '../../common/dto/api-response-dto';

@ApiTags('Sale Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('SalePayments')
export class SalePaymentController {
  constructor(private salePaymentService: SalePaymentService) {}

  @Get()
  @ApiOperation({ summary: 'Get all sale payments (Smart Query supported)' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations: sale,creator' })
  @ApiQuery({ name: '$where[sale_id]', required: false, description: 'Filter by sale ID' })
  @ApiQuery({ name: '$search', required: false, description: 'Search keyword' })
  @ApiQuery({ name: '$orderBy[createdAt]', required: false, description: 'Sort: asc/desc' })
  @ApiQuery({ name: '$skip', required: false, description: 'Offset', type: Number })
  @ApiQuery({ name: '$take', required: false, description: 'Limit', type: Number })
  async findAll(@Query() query: Record<string, unknown>) {
    const { data, total, skip, take } = await this.salePaymentService.findAll(query);
    return ApiResponse.paginated(data, total, skip, take);
  }

  @Get('list')
  @ApiOperation({ summary: 'List payments with Sale+party+method, filters: from,to,methodId,instrumentType,cleared,search,skip,take' })
  async list(@Query() query: Record<string, any>) {
    const { data, total, skip, take } = await this.salePaymentService.list(query);
    return ApiResponse.paginated(data, total, skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sale payment by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Query() query: any) {
    const data = await this.salePaymentService.findOne(id, query);
    if (!data) throw new NotFoundException('Sale payment not found');
    return ApiResponse.ok(data);
  }

  @Get('sale/:saleId')
  @ApiOperation({ summary: 'Get payments for a sale' })
  async findBySale(@Param('saleId', ParseIntPipe) saleId: number, @Query() query: any) {
    const { data, total, skip, take } = await this.salePaymentService.findBySale(saleId, query);
    return ApiResponse.paginated(data, total, skip, take);
  }

  @Post()
  @ApiOperation({ summary: 'Create sale payment' })
  async create(@Body() dto: CreateSalePaymentDto, @CurrentUser() user: any) {
    const data = await this.salePaymentService.create(dto, user.id);
    return ApiResponse.ok(data, 'Sale payment created successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update sale payment' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSalePaymentDto, @CurrentUser() user: any) {
    const data = await this.salePaymentService.update(id, dto, user?.id);
    return ApiResponse.ok(data, 'Sale payment updated successfully');
  }

  @Patch(':id/clear')
  @ApiOperation({ summary: 'Mark cek/bg payment as cleared (lunas)' })
  async clear(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const data = await this.salePaymentService.clear(id, user?.id);
    return ApiResponse.ok(data, 'Payment cleared');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete sale payment' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.salePaymentService.delete(id);
    return ApiResponse.ok({ id }, 'Sale payment deleted successfully');
  }
}
