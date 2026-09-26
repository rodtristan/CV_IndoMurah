import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Put, Param, Body, Query } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { ProductBarcodeService } from './product-barcode.service';
import { CreateProductBarcodeDto, UpdateProductBarcodeDto } from './dto/product-barcode.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';

@ApiTags('ProductBarcodes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('product-barcode')
export class ProductBarcodeController extends BaseController<
  any,
  CreateProductBarcodeDto,
  UpdateProductBarcodeDto
> {
  constructor(productBarcodeService: ProductBarcodeService) {
    super(productBarcodeService, {
      modelName: 'ProductBarcode',
      pluralName: 'ProductBarcodes',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'product-barcode',
    });
  }

  // GET endpoints
  @Get()
  @ApiOperation({ summary: 'Get all ProductBarcodes with OData query support' })
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
  @ApiOperation({ summary: 'Get count of ProductBarcodes' })
  async getCount(@Query() query: any) {
    return super.getCount(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ProductBarcode by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return super.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get ProductBarcode by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return super.findByField(field, value, query);
  }

  // POST endpoints
  @Post()
  @ApiOperation({ summary: 'Create new ProductBarcode' })
  async create(@Body() dto: CreateProductBarcodeDto) {
    return super.create(dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple ProductBarcodes' })
  async createBulk(@Body() dtos: CreateProductBarcodeDto[]) {
    return super.createBulk(dtos);
  }

  // PATCH endpoints
  @Patch(':id')
  @ApiOperation({ summary: 'Update ProductBarcode by ID' })
  async patchById(@Param('id') id: string, @Body() dto: UpdateProductBarcodeDto) {
    return super.patchById(id, dto);
  }

  @Patch('by/:field/:value')
  @ApiOperation({ summary: 'Update ProductBarcodes by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: UpdateProductBarcodeDto,
  ) {
    return super.patchByFilterReference(field, value, dto);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple ProductBarcodes' })
  async patchBulk(@Body() body: { ids: number[]; data: Partial<UpdateProductBarcodeDto> }) {
    return super.patchBulk(body);
  }

  // PUT (UPSERT) endpoints
  @Put()
  @ApiOperation({ summary: 'Upsert ProductBarcode' })
  async upsert(@Body() body: { where: { id: number }; create: CreateProductBarcodeDto; update: Partial<UpdateProductBarcodeDto> }) {
    return super.upsert(body);
  }

  @Put('by/:field')
  @ApiOperation({ summary: 'Upsert ProductBarcode by field reference' })
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreateProductBarcodeDto; update: Partial<UpdateProductBarcodeDto> },
  ) {
    return super.upsertByFilterReference(field, body);
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert ProductBarcodes' })
  async upsertBulk(@Body() body: { items: any[] }) {
    return super.upsertBulk(body);
  }

  // DELETE endpoints
  @Delete(':id')
  @ApiOperation({ summary: 'Delete ProductBarcode by ID' })
  async deleteById(@Param('id') id: string) {
    return super.deleteById(id);
  }

  @Delete('by/:field/:value')
  @ApiOperation({ summary: 'Delete ProductBarcodes by field reference' })
  async deleteByFilterReference(@Param('field') field: string, @Param('value') value: string) {
    return super.deleteByFilterReference(field, value);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple ProductBarcodes' })
  async deleteBulk(@Body() body: { ids: (number | string)[] }) {
    return super.deleteBulk(body);
  }
}
