import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Put, Param, Body, Query } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../common/dto/api-response-dto';

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductController extends BaseController<
  any,
  CreateProductDto,
  UpdateProductDto
> {
  constructor(private readonly productService: ProductService) {
    super(productService, {
      modelName: 'Product',
      pluralName: 'Products',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'products',
    });
  }

  // GET endpoints
  @Get()
  @ApiOperation({ summary: 'Get all products with OData query support' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations: category,unit,brand,warehouse,productStocks' })
  @ApiQuery({ name: '$where[field]', required: false, description: 'Filter by field' })
  @ApiQuery({ name: '$orderBy[field]', required: false, description: 'Sort: asc/desc' })
  @ApiQuery({ name: '$skip', required: false, type: Number, description: 'Offset' })
  @ApiQuery({ name: '$take', required: false, type: Number, description: 'Limit' })
  @ApiQuery({ name: '$search', required: false, description: 'Search keyword' })
  async findAll(@Query() query: any) {
    return super.findAll(query);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get count of products' })
  async getCount(@Query() query: any) {
    return super.getCount(query);
  }

  @Get('minimum-stock')
  @ApiOperation({ summary: 'Stock Minimum (Ketoko). Query: warehouseId, itemFrom, itemTo, supplierId, categoryId, sort, dir' })
  async minimumStock(@Query() query: Record<string, string>) {
    return ApiResponse.ok(await this.productService.minimumStock(query));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return super.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get product by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return super.findByField(field, value, query);
  }

  // POST endpoints
  @Post()
  @ApiOperation({ summary: 'Create new product' })
  async create(@Body() dto: CreateProductDto) {
    return super.create(dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple products' })
  async createBulk(@Body() dtos: CreateProductDto[]) {
    return super.createBulk(dtos);
  }

  // PATCH endpoints
  @Patch(':id')
  @ApiOperation({ summary: 'Update product by ID' })
  async patchById(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return super.patchById(id, dto);
  }

  @Patch('by/:field/:value')
  @ApiOperation({ summary: 'Update products by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: UpdateProductDto,
  ) {
    return super.patchByFilterReference(field, value, dto);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple products' })
  async patchBulk(@Body() body: { ids: number[]; data: Partial<UpdateProductDto> }) {
    return super.patchBulk(body);
  }

  // PUT (UPSERT) endpoints
  @Put()
  @ApiOperation({ summary: 'Upsert product' })
  async upsert(@Body() body: { where: { id: number }; create: CreateProductDto; update: Partial<UpdateProductDto> }) {
    return super.upsert(body);
  }

  @Put('by/:field')
  @ApiOperation({ summary: 'Upsert product by field reference' })
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreateProductDto; update: Partial<UpdateProductDto> },
  ) {
    return super.upsertByFilterReference(field, body);
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert products' })
  async upsertBulk(@Body() body: { items: any[] }) {
    return super.upsertBulk(body);
  }

  // DELETE endpoints
  @Delete(':id')
  @ApiOperation({ summary: 'Delete product by ID' })
  async deleteById(@Param('id') id: string) {
    return super.deleteById(id);
  }

  @Delete('by/:field/:value')
  @ApiOperation({ summary: 'Delete products by field reference' })
  async deleteByFilterReference(@Param('field') field: string, @Param('value') value: string) {
    return super.deleteByFilterReference(field, value);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple products' })
  async deleteBulk(@Body() body: { ids: (number | string)[] }) {
    return super.deleteBulk(body);
  }
}
