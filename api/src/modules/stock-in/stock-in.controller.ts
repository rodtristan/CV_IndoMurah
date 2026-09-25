import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Put, Param, Body, Query } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { StockInService } from './stock-in.service';
import { CreateStockInDto, UpdateStockInDto } from './dto/stock-in.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';

@ApiTags('StockIn')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stock-in')
export class StockInController extends BaseController<
  any,
  CreateStockInDto,
  UpdateStockInDto
> {
  constructor(private readonly stockInService: StockInService) {
    super(stockInService, {
      modelName: 'StockIn',
      pluralName: 'StockIns',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'stock-in',
    });
  }

  // GET endpoints
  @Get()
  @ApiOperation({ summary: 'Get all StockIns with OData query support' })
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
  @ApiOperation({ summary: 'Get count of StockIns' })
  async getCount(@Query() query: any) {
    return super.getCount(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get StockIn by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return super.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get StockIn by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return super.findByField(field, value, query);
  }

  // POST endpoints
  @Post()
  @ApiOperation({ summary: 'Create new StockIn' })
  async create(@Body() dto: CreateStockInDto, @CurrentUser() user?: any) {
    const data = await this.stockInService.createStockIn(dto, user.id);
    return { success: true, data, message: 'StockIn created successfully' };
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple StockIns' })
  async createBulk(@Body() dtos: CreateStockInDto[]) {
    return super.createBulk(dtos);
  }

  // PATCH endpoints
  @Patch(':id')
  @ApiOperation({ summary: 'Update StockIn by ID' })
  async patchById(@Param('id') id: string, @Body() dto: Partial<UpdateStockInDto>, @CurrentUser() user?: any) {
    const data = await this.stockInService.patchById(Number(id), dto, user?.id);
    return { success: true, data, message: 'Data berhasil diperbarui' };
  }

  @Patch('by/:field/:value')
  @ApiOperation({ summary: 'Update StockIns by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: Partial<UpdateStockInDto>,
  ) {
    return super.patchByFilterReference(field, value, dto);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple StockIns' })
  async patchBulk(@Body() body: { ids: number[]; data: Partial<UpdateStockInDto> }) {
    return super.patchBulk(body);
  }

  // PUT (UPSERT) endpoints
  @Put()
  @ApiOperation({ summary: 'Upsert StockIn' })
  async upsert(@Body() body: { where: { id: number }; create: CreateStockInDto; update: Partial<UpdateStockInDto> }) {
    return super.upsert(body);
  }

  @Put('by/:field')
  @ApiOperation({ summary: 'Upsert StockIn by field reference' })
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreateStockInDto; update: Partial<UpdateStockInDto> },
  ) {
    return super.upsertByFilterReference(field, body);
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert StockIns' })
  async upsertBulk(@Body() body: { items: any[] }) {
    return super.upsertBulk(body);
  }

  // DELETE endpoints
  @Delete(':id')
  @ApiOperation({ summary: 'Delete StockIn by ID' })
  async deleteById(@Param('id') id: string, @CurrentUser() user?: any) {
    const data = await this.stockInService.deleteById(Number(id), user?.id);
    return { success: true, data, message: 'Data berhasil dihapus' };
  }

  @Delete('by/:field/:value')
  @ApiOperation({ summary: 'Delete StockIns by field reference' })
  async deleteByFilterReference(@Param('field') field: string, @Param('value') value: string) {
    return super.deleteByFilterReference(field, value);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple StockIns' })
  async deleteBulk(@Body() body: { ids: number[] }) {
    return super.deleteBulk(body);
  }
}
