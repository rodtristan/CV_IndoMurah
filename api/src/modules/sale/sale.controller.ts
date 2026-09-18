import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SaleService } from './sale.service';
import { CreateSaleDto, UpdateSaleDto, PaymentDto, UpdateStatusDto, UpdateShippingDto } from './dto/sale.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';
import { ApiResponse } from '../../common/dto/api-response-dto';

@ApiTags('Sales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SaleController {
  constructor(private saleService: SaleService) {}

  @Get()
  @ApiOperation({ summary: 'Get all sales (Smart Query supported)' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations: customer,salesPerson,saleItems,payments' })
  @ApiQuery({ name: '$where[paymentStatus]', required: false, description: 'Filter by status: PENDING,PAID,PARTIAL,INSTALMENT,CANCELLED' })
  @ApiQuery({ name: '$where[customerId]', required: false, description: 'Filter by customer ID', type: Number })
  @ApiQuery({ name: '$where[salesPersonId]', required: false, description: 'Filter by sales person ID', type: Number })
  @ApiQuery({ name: '$where[salePointId]', required: false, description: 'Filter by sale point ID', type: Number })
  @ApiQuery({ name: '$where[warehouseId]', required: false, description: 'Filter by warehouse ID', type: Number })
  @ApiQuery({ name: '$search', required: false, description: 'Search keyword' })
  @ApiQuery({ name: '$orderBy[createdAt]', required: false, description: 'Sort: asc/desc' })
  @ApiQuery({ name: '$skip', required: false, description: 'Offset', type: Number })
  @ApiQuery({ name: '$take', required: false, description: 'Limit', type: Number })
  async findAll(@Query() query: Record<string, unknown>) {
    const { data, total, skip, take } = await this.saleService.findAll(query);
    return ApiResponse.paginated(data, total, skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sale by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Query() query: Record<string, unknown>) {
    const data = await this.saleService.findOne(id, query);
    if (!data) throw new NotFoundException('Sale not found');
    return ApiResponse.ok(data);
  }

  @Post()
  @ApiOperation({ summary: 'Create sale (POS transaction)' })
  async create(@Body() dto: CreateSaleDto, @CurrentUser() user: any) {
    const data = await this.saleService.create(dto, user.id);
    return ApiResponse.ok(data, 'Sale created successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update sale' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSaleDto) {
    const data = await this.saleService.update(id, dto);
    return ApiResponse.ok(data, 'Sale updated successfully');
  }

  @Post(':id/payment')
  @ApiOperation({ summary: 'Add payment to sale' })
  async payment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PaymentDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.saleService.payment(id, dto, user.id);
    return ApiResponse.ok(data, 'Payment recorded successfully');
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update sale payment status' })
  async updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStatusDto) {
    const data = await this.saleService.updateStatus(id, dto);
    return ApiResponse.ok(data, 'Sale status updated');
  }

  @Put(':id/shipping')
  @ApiOperation({ summary: 'Update sale shipping info (Data Pengiriman)' })
  async updateShipping(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateShippingDto) {
    const data = await this.saleService.updateShipping(id, dto);
    return ApiResponse.ok(data, 'Shipping info updated');
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel sale' })
  async cancel(@Param('id', ParseIntPipe) id: number) {
    const data = await this.saleService.cancel(id);
    return ApiResponse.ok(data, 'Sale cancelled');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete pending sale' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.saleService.delete(id);
    return ApiResponse.ok({ id }, 'Sale deleted successfully');
  }
}
