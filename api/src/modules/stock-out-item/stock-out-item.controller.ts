import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Put, Param, Body, Query } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { StockOutItemService } from './stock-out-item.service';
import { CreateStockOutItemDto, UpdateStockOutItemDto } from './dto/stock-out-item.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';

@ApiTags('StockOutItems')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stock-out-item')
export class StockOutItemController extends BaseController<
  any,
  CreateStockOutItemDto,
  UpdateStockOutItemDto
> {
  constructor(stockOutItemService: StockOutItemService) {
    super(stockOutItemService, {
      modelName: 'StockOutItem',
      pluralName: 'StockOutItems',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'stock-out-item',
    });
  }

  // GET endpoints
  @Get()
  @ApiOperation({ summary: 'Get all StockOutItems with OData query support' })
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
  @ApiOperation({ summary: 'Get count of StockOutItems' })
  async getCount(@Query() query: any) {
    return super.getCount(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get StockOutItem by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return super.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get StockOutItem by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return super.findByField(field, value, query);
  }

  // POST endpoints
  @Post()
  @ApiOperation({ summary: 'Create new StockOutItem' })
  async create(@Body() dto: CreateStockOutItemDto) {
    return super.create(dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple StockOutItems' })
  async createBulk(@Body() dtos: CreateStockOutItemDto[]) {
    return super.createBulk(dtos);
  }

  // PATCH endpoints
  @Patch(':id')
  @ApiOperation({ summary: 'Update StockOutItem by ID' })
  async patchById(@Param('id') id: string, @Body() dto: UpdateStockOutItemDto) {
    return super.patchById(id, dto);
  }

  @Patch('by/:field/:value')
  @ApiOperation({ summary: 'Update StockOutItems by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: UpdateStockOutItemDto,
  ) {
    return super.patchByFilterReference(field, value, dto);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple StockOutItems' })
  async patchBulk(@Body() body: { ids: number[]; data: Partial<UpdateStockOutItemDto> }) {
    return super.patchBulk(body);
  }

  // PUT (UPSERT) endpoints
  @Put()
  @ApiOperation({ summary: 'Upsert StockOutItem' })
  async upsert(@Body() body: { where: { id: number }; create: CreateStockOutItemDto; update: Partial<UpdateStockOutItemDto> }) {
    return super.upsert(body);
  }

  @Put('by/:field')
  @ApiOperation({ summary: 'Upsert StockOutItem by field reference' })
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreateStockOutItemDto; update: Partial<UpdateStockOutItemDto> },
  ) {
    return super.upsertByFilterReference(field, body);
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert StockOutItems' })
  async upsertBulk(@Body() body: { items: any[] }) {
    return super.upsertBulk(body);
  }

  // DELETE endpoints
  @Delete(':id')
  @ApiOperation({ summary: 'Delete StockOutItem by ID' })
  async deleteById(@Param('id') id: string) {
    return super.deleteById(id);
  }

  @Delete('by/:field/:value')
  @ApiOperation({ summary: 'Delete StockOutItems by field reference' })
  async deleteByFilterReference(@Param('field') field: string, @Param('value') value: string) {
    return super.deleteByFilterReference(field, value);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple StockOutItems' })
  async deleteBulk(@Body() body: { ids: (number | string)[] }) {
    return super.deleteBulk(body);
  }
}
