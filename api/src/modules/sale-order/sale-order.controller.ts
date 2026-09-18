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
import { SaleOrderService } from './sale-order.service';
import { CreateSaleOrderDto, UpdateSaleOrderDto, AddSaleOrderItemDto, UpdateStatusDto } from './dto/sale-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';
import { ApiResponse } from '../../common/dto/api-response-dto';

@ApiTags('Sale Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('SaleOrders')
export class SaleOrderController {
  constructor(private saleOrderService: SaleOrderService) {}

  @Get()
  @ApiOperation({ summary: 'Get all sale orders (Smart Query supported)' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations: customer,salesPerson,items' })
  @ApiQuery({ name: '$where[status]', required: false, description: 'Filter by status' })
  @ApiQuery({ name: '$search', required: false, description: 'Search keyword' })
  @ApiQuery({ name: '$orderBy[createdAt]', required: false, description: 'Sort: asc/desc' })
  @ApiQuery({ name: '$skip', required: false, description: 'Offset', type: Number })
  @ApiQuery({ name: '$take', required: false, description: 'Limit', type: Number })
  async findAll(@Query() query: Record<string, unknown>) {
    const { data, total, skip, take } = await this.saleOrderService.findAll(query);
    return ApiResponse.paginated(data, total, skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sale order by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Query() query: any) {
    const data = await this.saleOrderService.findOne(id, query);
    if (!data) throw new NotFoundException('Sale order not found');
    return ApiResponse.ok(data);
  }

  @Post()
  @ApiOperation({ summary: 'Create sale order' })
  async create(@Body() dto: CreateSaleOrderDto, @CurrentUser() user: any) {
    const data = await this.saleOrderService.create(dto, user.id);
    return ApiResponse.ok(data, 'Sale order created successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update sale order' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSaleOrderDto) {
    const data = await this.saleOrderService.update(id, dto);
    return ApiResponse.ok(data, 'Sale order updated successfully');
  }

  @Post(':id/items')
  @ApiOperation({ summary: 'Add item to sale order' })
  async addItem(@Param('id', ParseIntPipe) id: number, @Body() dto: AddSaleOrderItemDto) {
    const data = await this.saleOrderService.addItem(id, dto);
    return ApiResponse.ok(data, 'Item added successfully');
  }

  @Delete(':id/items/:itemId')
  @ApiOperation({ summary: 'Remove item from sale order' })
  async removeItem(@Param('id', ParseIntPipe) id: number, @Param('itemId', ParseIntPipe) itemId: number) {
    const data = await this.saleOrderService.removeItem(id, itemId);
    return ApiResponse.ok(data, 'Item removed successfully');
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm sale order' })
  async confirm(@Param('id', ParseIntPipe) id: number) {
    const data = await this.saleOrderService.confirm(id);
    return ApiResponse.ok(data, 'Sale order confirmed');
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete sale order' })
  async complete(@Param('id', ParseIntPipe) id: number) {
    const data = await this.saleOrderService.complete(id);
    return ApiResponse.ok(data, 'Sale order completed');
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update sale order payment status' })
  async updatePaymentStatus(@Param('id', ParseIntPipe) id: number, @Body() body: { paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' | 'CANCELLED' | 'INSTALMENT' }) {
    const data = await this.saleOrderService.updatePaymentStatus(id, body.paymentStatus);
    return ApiResponse.ok(data, 'Sale order payment status updated');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete draft sale order' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.saleOrderService.delete(id);
    return ApiResponse.ok({ id }, 'Sale order deleted successfully');
  }
}
