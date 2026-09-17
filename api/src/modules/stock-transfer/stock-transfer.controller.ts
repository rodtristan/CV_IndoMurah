import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Put, Param, Body, Query } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { StockTransferService } from './stock-transfer.service';
import { CreateStockTransferDto, UpdateStockTransferDto } from './dto/stock-transfer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';

@ApiTags('StockTransfer')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stock-transfer')
export class StockTransferController extends BaseController<
  any,
  CreateStockTransferDto,
  UpdateStockTransferDto
> {
  constructor(stockTransferService: StockTransferService) {
    super(stockTransferService, {
      modelName: 'StockTransfer',
      pluralName: 'StockTransfers',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'stock-transfer',
    });
  }

  // GET endpoints
  @Get()
  @ApiOperation({ summary: 'Get all StockTransfers with OData query support' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations: ' })
  @ApiQuery({ name: '$where[field]', required: false, description: 'Filter by field' })
  @ApiQuery({ name: '$orderBy[field]', required: false, description: 'Sort: asc/desc' })
  @ApiQuery({ name: '$skip', required: false, type: Number, description: 'Offset' })
  @ApiQuery({ name: '$take', required: false, type: Number, description: 'Limit' })
  @ApiQuery({ name: '$search', required: false, description: 'Search: name' })
  async findAll(@Query() query: any) {
    return super.findAll(query);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get count of StockTransfers' })
  async getCount(@Query() query: any) {
    return super.getCount(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get StockTransfer by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return super.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get StockTransfer by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return super.findByField(field, value, query);
  }

  // POST endpoints
  @Post()
  @ApiOperation({ summary: 'Create new StockTransfer' })
  async create(@Body() dto: CreateStockTransferDto, @CurrentUser() user?: any) {
    return super.create({ ...dto, createdById: user.id } as any);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple StockTransfers' })
  async createBulk(@Body() dtos: CreateStockTransferDto[]) {
    return super.createBulk(dtos);
  }

  // PATCH endpoints
  @Patch(':id')
  @ApiOperation({ summary: 'Update StockTransfer by ID' })
  async patchById(@Param('id') id: string, @Body() dto: Partial<UpdateStockTransferDto>) {
    return super.patchById(id, dto);
  }

  @Patch('by/:field/:value')
  @ApiOperation({ summary: 'Update StockTransfers by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: Partial<UpdateStockTransferDto>,
  ) {
    return super.patchByFilterReference(field, value, dto);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple StockTransfers' })
  async patchBulk(@Body() body: { ids: number[]; data: Partial<UpdateStockTransferDto> }) {
    return super.patchBulk(body);
  }

  // PUT (UPSERT) endpoints
  @Put()
  @ApiOperation({ summary: 'Upsert StockTransfer' })
  async upsert(@Body() body: { where: { id: number }; create: CreateStockTransferDto; update: Partial<UpdateStockTransferDto> }) {
    return super.upsert(body);
  }

  @Put('by/:field')
  @ApiOperation({ summary: 'Upsert StockTransfer by field reference' })
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreateStockTransferDto; update: Partial<UpdateStockTransferDto> },
  ) {
    return super.upsertByFilterReference(field, body);
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert StockTransfers' })
  async upsertBulk(@Body() body: { items: any[] }) {
    return super.upsertBulk(body);
  }

  // DELETE endpoints
  @Delete(':id')
  @ApiOperation({ summary: 'Delete StockTransfer by ID' })
  async deleteById(@Param('id') id: string) {
    return super.deleteById(id);
  }

  @Delete('by/:field/:value')
  @ApiOperation({ summary: 'Delete StockTransfers by field reference' })
  async deleteByFilterReference(@Param('field') field: string, @Param('value') value: string) {
    return super.deleteByFilterReference(field, value);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple StockTransfers' })
  async deleteBulk(@Body() body: { ids: number[] }) {
    return super.deleteBulk(body);
  }
}
