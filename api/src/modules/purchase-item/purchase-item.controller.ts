import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Put, Param, Body, Query } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { PurchaseItemService } from './purchase-item.service';
import { CreatePurchaseItemDto, UpdatePurchaseItemDto } from './dto/purchase-item.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';

@ApiTags('PurchaseItems')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('purchase-item')
export class PurchaseItemController extends BaseController<
  any,
  CreatePurchaseItemDto,
  UpdatePurchaseItemDto
> {
  constructor(purchaseItemService: PurchaseItemService) {
    super(purchaseItemService, {
      modelName: 'PurchaseItem',
      pluralName: 'PurchaseItems',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'purchase-item',
    });
  }

  // GET endpoints
  @Get()
  @ApiOperation({ summary: 'Get all PurchaseItems with OData query support' })
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
  @ApiOperation({ summary: 'Get count of PurchaseItems' })
  async getCount(@Query() query: any) {
    return super.getCount(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get PurchaseItem by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return super.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get PurchaseItem by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return super.findByField(field, value, query);
  }

  // POST endpoints
  @Post()
  @ApiOperation({ summary: 'Create new PurchaseItem' })
  async create(@Body() dto: CreatePurchaseItemDto) {
    return super.create(dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple PurchaseItems' })
  async createBulk(@Body() dtos: CreatePurchaseItemDto[]) {
    return super.createBulk(dtos);
  }

  // PATCH endpoints
  @Patch(':id')
  @ApiOperation({ summary: 'Update PurchaseItem by ID' })
  async patchById(@Param('id') id: string, @Body() dto: Partial<UpdatePurchaseItemDto>) {
    return super.patchById(id, dto);
  }

  @Patch('by/:field/:value')
  @ApiOperation({ summary: 'Update PurchaseItems by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: Partial<UpdatePurchaseItemDto>,
  ) {
    return super.patchByFilterReference(field, value, dto);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple PurchaseItems' })
  async patchBulk(@Body() body: { ids: number[]; data: Partial<UpdatePurchaseItemDto> }) {
    return super.patchBulk(body);
  }

  // PUT (UPSERT) endpoints
  @Put()
  @ApiOperation({ summary: 'Upsert PurchaseItem' })
  async upsert(@Body() body: { where: { id: number }; create: CreatePurchaseItemDto; update: Partial<UpdatePurchaseItemDto> }) {
    return super.upsert(body);
  }

  @Put('by/:field')
  @ApiOperation({ summary: 'Upsert PurchaseItem by field reference' })
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreatePurchaseItemDto; update: Partial<UpdatePurchaseItemDto> },
  ) {
    return super.upsertByFilterReference(field, body);
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert PurchaseItems' })
  async upsertBulk(@Body() body: { items: any[] }) {
    return super.upsertBulk(body);
  }

  // DELETE endpoints
  @Delete(':id')
  @ApiOperation({ summary: 'Delete PurchaseItem by ID' })
  async deleteById(@Param('id') id: string) {
    return super.deleteById(id);
  }

  @Delete('by/:field/:value')
  @ApiOperation({ summary: 'Delete PurchaseItems by field reference' })
  async deleteByFilterReference(@Param('field') field: string, @Param('value') value: string) {
    return super.deleteByFilterReference(field, value);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple PurchaseItems' })
  async deleteBulk(@Body() body: { ids: (number | string)[] }) {
    return super.deleteBulk(body);
  }
}
