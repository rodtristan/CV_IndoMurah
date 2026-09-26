import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Put, Param, Body, Query } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { ProductStockService } from './product-stock.service';
import { CreateProductStockDto, UpdateProductStockDto } from './dto/product-stock.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';

@ApiTags('ProductStocks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('product-stock')
export class ProductStockController extends BaseController<
  any,
  CreateProductStockDto,
  UpdateProductStockDto
> {
  constructor(private readonly productStockService: ProductStockService) {
    super(productStockService, {
      modelName: 'ProductStock',
      pluralName: 'ProductStocks',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'product-stock',
    });
  }

  // GET endpoints
  @Get()
  @ApiOperation({ summary: 'Get all ProductStocks with OData query support' })
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
  @ApiOperation({ summary: 'Get count of ProductStocks' })
  async getCount(@Query() query: any) {
    return super.getCount(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ProductStock by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return super.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get ProductStock by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return super.findByField(field, value, query);
  }

  // POST endpoints
  @Post()
  @ApiOperation({ summary: 'Create new ProductStock' })
  async create(@Body() dto: CreateProductStockDto, @CurrentUser() user?: any) {
    const data = await this.productStockService.createOpening(dto, user?.id);
    return { success: true, data, message: 'Stok tersimpan' };
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple ProductStocks' })
  async createBulk(@Body() dtos: CreateProductStockDto[]) {
    return super.createBulk(dtos);
  }

  // PATCH endpoints
  @Patch(':id')
  @ApiOperation({ summary: 'Update ProductStock by ID' })
  async patchById(@Param('id') id: string, @Body() dto: UpdateProductStockDto, @CurrentUser() user?: any) {
    const data = await this.productStockService.patchById(Number(id), dto, user?.id);
    return { success: true, data, message: 'Stok diperbarui' };
  }

  @Patch('by/:field/:value')
  @ApiOperation({ summary: 'Update ProductStocks by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: UpdateProductStockDto,
  ) {
    return super.patchByFilterReference(field, value, dto);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple ProductStocks' })
  async patchBulk(@Body() body: { ids: number[]; data: Partial<UpdateProductStockDto> }) {
    return super.patchBulk(body);
  }

  // PUT (UPSERT) endpoints
  @Put()
  @ApiOperation({ summary: 'Upsert ProductStock' })
  async upsert(@Body() body: { where: { id: number }; create: CreateProductStockDto; update: Partial<UpdateProductStockDto> }) {
    return super.upsert(body);
  }

  @Put('by/:field')
  @ApiOperation({ summary: 'Upsert ProductStock by field reference' })
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreateProductStockDto; update: Partial<UpdateProductStockDto> },
  ) {
    return super.upsertByFilterReference(field, body);
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert ProductStocks' })
  async upsertBulk(@Body() body: { items: any[] }) {
    return super.upsertBulk(body);
  }

  // DELETE endpoints
  @Delete(':id')
  @ApiOperation({ summary: 'Delete ProductStock by ID' })
  async deleteById(@Param('id') id: string, @CurrentUser() user?: any) {
    const data = await this.productStockService.deleteById(Number(id), user?.id);
    return { success: true, data, message: 'Stok dihapus' };
  }

  @Delete('by/:field/:value')
  @ApiOperation({ summary: 'Delete ProductStocks by field reference' })
  async deleteByFilterReference(@Param('field') field: string, @Param('value') value: string) {
    return super.deleteByFilterReference(field, value);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple ProductStocks' })
  async deleteBulk(@Body() body: { ids: (number | string)[] }) {
    return super.deleteBulk(body);
  }
}
