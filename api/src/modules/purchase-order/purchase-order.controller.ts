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
import { PurchaseOrderService } from './purchase-order.service';
import {
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  AddPurchaseOrderItemDto,
  UpdatePurchaseOrderStatusDto,
} from './dto/purchase-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../common/dto/api-response-dto';
import { CurrentUser } from '../../common/decorators/current-user-decorator';

@ApiTags('Purchase Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('PurchaseOrders')
export class PurchaseOrderController {
  constructor(private purchaseOrderService: PurchaseOrderService) {}

  @Get()
  @ApiOperation({ summary: 'Get all purchase orders (Smart Query supported)' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations: supplier,items,creator' })
  @ApiQuery({ name: '$where[status]', required: false, description: 'Filter by status' })
  @ApiQuery({ name: '$where[supplier_id]', required: false, description: 'Filter by supplier' })
  @ApiQuery({ name: '$search', required: false, description: 'Search keyword' })
  @ApiQuery({ name: '$orderBy[createdAt]', required: false, description: 'Sort: asc/desc' })
  @ApiQuery({ name: '$skip', required: false, description: 'Offset', type: Number })
  @ApiQuery({ name: '$take', required: false, description: 'Limit', type: Number })
  async findAll(@Query() query: any) {
    const { data, total, skip, take } = await this.purchaseOrderService.findAll(query);
    return ApiResponse.paginated(data, total, skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase order by ID (Smart Query supported)' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Query() query: any) {
    const data = await this.purchaseOrderService.findOne(id, query);
    if (!data) throw new NotFoundException('Purchase order not found');
    return ApiResponse.ok(data);
  }

  @Post()
  @ApiOperation({ summary: 'Create new purchase order' })
  async create(@Body() dto: CreatePurchaseOrderDto, @CurrentUser() user: any) {
    const data = await this.purchaseOrderService.create(dto, user.ID);
    return ApiResponse.ok(data, 'Purchase order created successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update purchase order' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePurchaseOrderDto,
  ) {
    const data = await this.purchaseOrderService.update(id, dto);
    return ApiResponse.ok(data, 'Purchase order updated successfully');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete draft purchase order' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.purchaseOrderService.delete(id);
    return ApiResponse.ok({ id }, 'Purchase order deleted successfully');
  }

  // ─── Items ─────────────────────────────────────────────────────────────

  @Post(':id/items')
  @ApiOperation({ summary: 'Add item to purchase order' })
  async addItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddPurchaseOrderItemDto,
  ) {
    const data = await this.purchaseOrderService.addItem(id, dto);
    return ApiResponse.ok(data, 'Item added successfully');
  }

  @Delete(':id/items/:itemId')
  @ApiOperation({ summary: 'Remove item from purchase order' })
  async removeItem(
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    const data = await this.purchaseOrderService.removeItem(id, itemId);
    return ApiResponse.ok(data, 'Item removed successfully');
  }

  // ─── Status ─────────────────────────────────────────────────────────────

  @Put(':id/confirm')
  @ApiOperation({ summary: 'Confirm purchase order' })
  async confirm(@Param('id', ParseIntPipe) id: number) {
    const data = await this.purchaseOrderService.updateStatus(id, { StatusCode: 'CONFIRMED' });
    return ApiResponse.ok(data, 'Purchase order confirmed');
  }

  @Put(':id/complete')
  @ApiOperation({ summary: 'Complete purchase order' })
  async complete(@Param('id', ParseIntPipe) id: number) {
    const data = await this.purchaseOrderService.updateStatus(id, { StatusCode: 'COMPLETED' });
    return ApiResponse.ok(data, 'Purchase order completed');
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel purchase order' })
  async cancel(@Param('id', ParseIntPipe) id: number) {
    const data = await this.purchaseOrderService.updateStatus(id, { StatusCode: 'CANCELLED' });
    return ApiResponse.ok(data, 'Purchase order cancelled');
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update purchase order status' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePurchaseOrderStatusDto,
  ) {
    const data = await this.purchaseOrderService.updateStatus(id, dto);
    return ApiResponse.ok(data, 'Status updated successfully');
  }
}
