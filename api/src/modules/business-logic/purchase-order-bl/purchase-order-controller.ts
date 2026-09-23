import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PurchaseOrderService } from './purchase-order-service';
import { CreatePurchaseOrderDto, PurchaseOrderFilterDto } from './purchase-order.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../../common/dto/api-response-dto';

@ApiTags('Business Logic - Purchase Order')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-logic/purchase-order')
export class PurchaseOrderController {
  constructor(private poService: PurchaseOrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create purchase order' })
  async createPurchaseOrder(@Body() dto: CreatePurchaseOrderDto) {
    const userId = 'system';
    const data = await this.poService.createPurchaseOrder(dto, userId);
    return ApiResponse.ok(data, 'Purchase order created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'List purchase orders' })
  async listPurchaseOrders(@Query() dto: PurchaseOrderFilterDto) {
    const data = await this.poService.listPurchaseOrders(dto);
    return ApiResponse.ok(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase order by ID' })
  async getPurchaseOrder(@Param('id') id: number) {
    const data = await this.poService.getPurchaseOrder(id);
    return ApiResponse.ok(data);
  }

  @Put(':id/approve')
  @ApiOperation({ summary: 'Approve purchase order' })
  async approvePurchaseOrder(@Param('id') id: number) {
    const userId = 'system';
    const data = await this.poService.approvePurchaseOrder(id, userId);
    return ApiResponse.ok(data, 'Purchase order approved');
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel purchase order' })
  async cancelPurchaseOrder(
    @Param('id') id: number,
    @Body('reason') reason?: string,
  ) {
    const userId = 'system';
    const data = await this.poService.cancelPurchaseOrder(id, userId, reason);
    return ApiResponse.ok(data, 'Purchase order cancelled');
  }

  @Post(':id/delivery')
  @ApiOperation({ summary: 'Record delivery for purchase order' })
  async recordDelivery(
    @Param('id') id: number,
    @Body('items') items: { itemId: number; quantity: number }[],
  ) {
    const userId = 'system';
    const data = await this.poService.recordDelivery(id, items, userId);
    return ApiResponse.ok(data);
  }
}
