import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Put, Param, Body, Query } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { StockOutService } from './stock-out.service';
import { CreateStockOutDto, UpdateStockOutDto } from './dto/stock-out.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';

@ApiTags('StockOut')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stock-out')
export class StockOutController extends BaseController<
  any,
  CreateStockOutDto,
  UpdateStockOutDto
> {
  constructor(private readonly stockOutService: StockOutService) {
    super(stockOutService, {
      modelName: 'StockOut',
      pluralName: 'StockOuts',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'stock-out',
    });
  }

  // GET endpoints
  @Get()
  @ApiOperation({ summary: 'Get all StockOuts with OData query support' })
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
  @ApiOperation({ summary: 'Get count of StockOuts' })
  async getCount(@Query() query: any) {
    return super.getCount(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get StockOut by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return super.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get StockOut by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return super.findByField(field, value, query);
  }

  // POST endpoints
  @Post()
  @ApiOperation({ summary: 'Create new StockOut' })
  async create(@Body() dto: CreateStockOutDto, @CurrentUser() user?: any) {
    const data = await this.stockOutService.createStockOut(dto, user.id);
    return { success: true, data, message: 'StockOut created successfully' };
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple StockOuts' })
  async createBulk(@Body() dtos: CreateStockOutDto[]) {
    return super.createBulk(dtos);
  }

  // PATCH endpoints
  @Patch(':id')
  @ApiOperation({ summary: 'Update StockOut by ID' })
  async patchById(@Param('id') id: string, @Body() dto: Partial<UpdateStockOutDto>) {
    return super.patchById(id, dto);
  }

  @Patch('by/:field/:value')
  @ApiOperation({ summary: 'Update StockOuts by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: Partial<UpdateStockOutDto>,
  ) {
    return super.patchByFilterReference(field, value, dto);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple StockOuts' })
  async patchBulk(@Body() body: { ids: number[]; data: Partial<UpdateStockOutDto> }) {
    return super.patchBulk(body);
  }

  // PUT (UPSERT) endpoints
  @Put()
  @ApiOperation({ summary: 'Upsert StockOut' })
  async upsert(@Body() body: { where: { id: number }; create: CreateStockOutDto; update: Partial<UpdateStockOutDto> }) {
    return super.upsert(body);
  }

  @Put('by/:field')
  @ApiOperation({ summary: 'Upsert StockOut by field reference' })
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreateStockOutDto; update: Partial<UpdateStockOutDto> },
  ) {
    return super.upsertByFilterReference(field, body);
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert StockOuts' })
  async upsertBulk(@Body() body: { items: any[] }) {
    return super.upsertBulk(body);
  }

  // DELETE endpoints
  @Delete(':id')
  @ApiOperation({ summary: 'Delete StockOut by ID' })
  async deleteById(@Param('id') id: string) {
    return super.deleteById(id);
  }

  @Delete('by/:field/:value')
  @ApiOperation({ summary: 'Delete StockOuts by field reference' })
  async deleteByFilterReference(@Param('field') field: string, @Param('value') value: string) {
    return super.deleteByFilterReference(field, value);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple StockOuts' })
  async deleteBulk(@Body() body: { ids: number[] }) {
    return super.deleteBulk(body);
  }
}
