import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Put, Param, Body, Query } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { StockOpnameService } from './stock-opname.service';
import { CreateStockOpnameDto, UpdateStockOpnameDto } from './dto/stock-opname.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';

@ApiTags('StockOpname')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stock-opname')
export class StockOpnameController extends BaseController<
  any,
  CreateStockOpnameDto,
  UpdateStockOpnameDto
> {
  constructor(private readonly stockOpnameService: StockOpnameService) {
    super(stockOpnameService, {
      modelName: 'StockOpname',
      pluralName: 'StockOpnames',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'stock-opname',
    });
  }

  // GET endpoints
  @Get()
  @ApiOperation({ summary: 'Get all StockOpnames with OData query support' })
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
  @ApiOperation({ summary: 'Get count of StockOpnames' })
  async getCount(@Query() query: any) {
    return super.getCount(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get StockOpname by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return super.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get StockOpname by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return super.findByField(field, value, query);
  }

  // POST endpoints
  @Post()
  @ApiOperation({ summary: 'Create new StockOpname' })
  async create(@Body() dto: CreateStockOpnameDto, @CurrentUser() user?: any) {
    const data = await this.stockOpnameService.createStockOpname(dto, user.id);
    return { success: true, data, message: 'StockOpname created successfully' };
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple StockOpnames' })
  async createBulk(@Body() dtos: CreateStockOpnameDto[]) {
    return super.createBulk(dtos);
  }

  // PATCH endpoints
  @Patch(':id')
  @ApiOperation({ summary: 'Update StockOpname by ID' })
  async patchById(@Param('id') id: string, @Body() dto: UpdateStockOpnameDto, @CurrentUser() user?: any) {
    const data = await this.stockOpnameService.patchById(Number(id), dto);
    return { success: true, data, message: 'Data berhasil diperbarui' };
  }

  @Patch('by/:field/:value')
  @ApiOperation({ summary: 'Update StockOpnames by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: UpdateStockOpnameDto,
  ) {
    return super.patchByFilterReference(field, value, dto);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple StockOpnames' })
  async patchBulk(@Body() body: { ids: number[]; data: Partial<UpdateStockOpnameDto> }) {
    return super.patchBulk(body);
  }

  // PUT (UPSERT) endpoints
  @Put()
  @ApiOperation({ summary: 'Upsert StockOpname' })
  async upsert(@Body() body: { where: { id: number }; create: CreateStockOpnameDto; update: Partial<UpdateStockOpnameDto> }) {
    return super.upsert(body);
  }

  @Put('by/:field')
  @ApiOperation({ summary: 'Upsert StockOpname by field reference' })
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreateStockOpnameDto; update: Partial<UpdateStockOpnameDto> },
  ) {
    return super.upsertByFilterReference(field, body);
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert StockOpnames' })
  async upsertBulk(@Body() body: { items: any[] }) {
    return super.upsertBulk(body);
  }

  // DELETE endpoints
  @Delete(':id')
  @ApiOperation({ summary: 'Delete StockOpname by ID' })
  async deleteById(@Param('id') id: string, @CurrentUser() user?: any) {
    const data = await this.stockOpnameService.deleteById(Number(id), user?.id);
    return { success: true, data, message: 'Data berhasil dihapus' };
  }

  @Delete('by/:field/:value')
  @ApiOperation({ summary: 'Delete StockOpnames by field reference' })
  async deleteByFilterReference(@Param('field') field: string, @Param('value') value: string) {
    return super.deleteByFilterReference(field, value);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple StockOpnames' })
  async deleteBulk(@Body() body: { ids: number[] }) {
    return super.deleteBulk(body);
  }
}
