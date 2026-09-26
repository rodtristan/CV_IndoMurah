import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Put, Param, Body, Query } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { PurchaseReturnItemService } from './purchase-return-item.service';
import { CreatePurchaseReturnItemDto, UpdatePurchaseReturnItemDto } from './dto/purchase-return-item.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';

@ApiTags('PurchaseReturnItems')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('purchase-return-item')
export class PurchaseReturnItemController extends BaseController<
  any,
  CreatePurchaseReturnItemDto,
  UpdatePurchaseReturnItemDto
> {
  constructor(purchaseReturnItemService: PurchaseReturnItemService) {
    super(purchaseReturnItemService, {
      modelName: 'PurchaseReturnItem',
      pluralName: 'PurchaseReturnItems',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'purchase-return-item',
    });
  }

  // GET endpoints
  @Get()
  @ApiOperation({ summary: 'Get all PurchaseReturnItems with OData query support' })
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
  @ApiOperation({ summary: 'Get count of PurchaseReturnItems' })
  async getCount(@Query() query: any) {
    return super.getCount(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get PurchaseReturnItem by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return super.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get PurchaseReturnItem by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return super.findByField(field, value, query);
  }

  // POST endpoints
  @Post()
  @ApiOperation({ summary: 'Create new PurchaseReturnItem' })
  async create(@Body() dto: CreatePurchaseReturnItemDto) {
    return super.create(dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple PurchaseReturnItems' })
  async createBulk(@Body() dtos: CreatePurchaseReturnItemDto[]) {
    return super.createBulk(dtos);
  }

  // PATCH endpoints
  @Patch(':id')
  @ApiOperation({ summary: 'Update PurchaseReturnItem by ID' })
  async patchById(@Param('id') id: string, @Body() dto: UpdatePurchaseReturnItemDto) {
    return super.patchById(id, dto);
  }

  @Patch('by/:field/:value')
  @ApiOperation({ summary: 'Update PurchaseReturnItems by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: UpdatePurchaseReturnItemDto,
  ) {
    return super.patchByFilterReference(field, value, dto);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple PurchaseReturnItems' })
  async patchBulk(@Body() body: { ids: number[]; data: Partial<UpdatePurchaseReturnItemDto> }) {
    return super.patchBulk(body);
  }

  // PUT (UPSERT) endpoints
  @Put()
  @ApiOperation({ summary: 'Upsert PurchaseReturnItem' })
  async upsert(@Body() body: { where: { id: number }; create: CreatePurchaseReturnItemDto; update: Partial<UpdatePurchaseReturnItemDto> }) {
    return super.upsert(body);
  }

  @Put('by/:field')
  @ApiOperation({ summary: 'Upsert PurchaseReturnItem by field reference' })
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreatePurchaseReturnItemDto; update: Partial<UpdatePurchaseReturnItemDto> },
  ) {
    return super.upsertByFilterReference(field, body);
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert PurchaseReturnItems' })
  async upsertBulk(@Body() body: { items: any[] }) {
    return super.upsertBulk(body);
  }

  // DELETE endpoints
  @Delete(':id')
  @ApiOperation({ summary: 'Delete PurchaseReturnItem by ID' })
  async deleteById(@Param('id') id: string) {
    return super.deleteById(id);
  }

  @Delete('by/:field/:value')
  @ApiOperation({ summary: 'Delete PurchaseReturnItems by field reference' })
  async deleteByFilterReference(@Param('field') field: string, @Param('value') value: string) {
    return super.deleteByFilterReference(field, value);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple PurchaseReturnItems' })
  async deleteBulk(@Body() body: { ids: (number | string)[] }) {
    return super.deleteBulk(body);
  }
}
