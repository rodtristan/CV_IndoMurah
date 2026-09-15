import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Put, Param, Body, Query } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { PurchaseOrderItemService } from './purchase-order-item.service';
import { CreatePurchaseOrderItemDto, UpdatePurchaseOrderItemDto } from './dto/purchase-order-item.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';

@ApiTags('PurchaseOrderItems')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('purchase-order-item')
export class PurchaseOrderItemController extends BaseController<
  any,
  CreatePurchaseOrderItemDto,
  UpdatePurchaseOrderItemDto
> {
  constructor(purchaseOrderItemService: PurchaseOrderItemService) {
    super(purchaseOrderItemService, {
      modelName: 'PurchaseOrderItem',
      pluralName: 'PurchaseOrderItems',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'purchase-order-item',
    });
  }

  // GET endpoints
  @Get()
  @ApiOperation({ summary: 'Get all PurchaseOrderItems with OData query support' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations' })
  @ApiQuery({ name: '$where[field]', required: false, description: 'Filter by field' })
  @ApiQuery({ name: '$orderBy[field]', required: false, description: 'Sort: asc/desc' })
  @ApiQuery({ name: '$skip', required: false, type: Number, description: 'Offset' })
  @ApiQuery({ name: '$take', required: false, type: Number, description: 'Limit' })
  @ApiQuery({ name: '$search', required: false, description: 'Search keyword' })
  async findAll(@Query() query: any) {
    return super.findAll(query);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get count of PurchaseOrderItems' })
  async getCount(@Query() query: any) {
    return super.getCount(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get PurchaseOrderItem by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return super.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get PurchaseOrderItem by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return super.findByField(field, value, query);
  }

  // POST endpoints
  @Post()
  @ApiOperation({ summary: 'Create new PurchaseOrderItem' })
  async create(@Body() dto: CreatePurchaseOrderItemDto) {
    return super.create(dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple PurchaseOrderItems' })
  async createBulk(@Body() dtos: CreatePurchaseOrderItemDto[]) {
    return super.createBulk(dtos);
  }

  // PATCH endpoints
  @Patch(':id')
  @ApiOperation({ summary: 'Update PurchaseOrderItem by ID' })
  async patchById(@Param('id') id: string, @Body() dto: Partial<UpdatePurchaseOrderItemDto>) {
    return super.patchById(id, dto);
  }

  @Patch('by/:field/:value')
  @ApiOperation({ summary: 'Update PurchaseOrderItems by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: Partial<UpdatePurchaseOrderItemDto>,
  ) {
    return super.patchByFilterReference(field, value, dto);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple PurchaseOrderItems' })
  async patchBulk(@Body() body: { ids: number[]; data: Partial<UpdatePurchaseOrderItemDto> }) {
    return super.patchBulk(body);
  }

  // PUT (UPSERT) endpoints
  @Put()
  @ApiOperation({ summary: 'Upsert PurchaseOrderItem' })
  async upsert(@Body() body: { where: { id: number }; create: CreatePurchaseOrderItemDto; update: Partial<UpdatePurchaseOrderItemDto> }) {
    return super.upsert(body);
  }

  @Put('by/:field')
  @ApiOperation({ summary: 'Upsert PurchaseOrderItem by field reference' })
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreatePurchaseOrderItemDto; update: Partial<UpdatePurchaseOrderItemDto> },
  ) {
    return super.upsertByFilterReference(field, body);
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert PurchaseOrderItems' })
  async upsertBulk(@Body() body: { items: any[] }) {
    return super.upsertBulk(body);
  }

  // DELETE endpoints
  @Delete(':id')
  @ApiOperation({ summary: 'Delete PurchaseOrderItem by ID' })
  async deleteById(@Param('id') id: string) {
    return super.deleteById(id);
  }

  @Delete('by/:field/:value')
  @ApiOperation({ summary: 'Delete PurchaseOrderItems by field reference' })
  async deleteByFilterReference(@Param('field') field: string, @Param('value') value: string) {
    return super.deleteByFilterReference(field, value);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple PurchaseOrderItems' })
  async deleteBulk(@Body() body: { ids: (number | string)[] }) {
    return super.deleteBulk(body);
  }
}
