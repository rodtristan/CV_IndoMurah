import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto, AdjustStockDto } from './dto/product.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../common/dto/api-response-dto';

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products (Smart Query supported)' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields: id,code,name,purchasePrice,sellingPrice,stock' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations: category,unit,brand,warehouse,productStocks' })
  @ApiQuery({ name: '$where[isActive]', required: false, description: 'Filter: true/false' })
  @ApiQuery({ name: '$where[categoryId]', required: false, description: 'Filter by category ID' })
  @ApiQuery({ name: '$where[warehouseId]', required: false, description: 'Filter by warehouse ID' })
  @ApiQuery({ name: '$search', required: false, description: 'Search by code, barcode, or name' })
  @ApiQuery({ name: '$orderBy[createdAt]', required: false, description: 'Sort: asc/desc' })
  @ApiQuery({ name: '$skip', required: false, description: 'Offset', type: Number })
  @ApiQuery({ name: '$take', required: false, description: 'Limit', type: Number })
  async findAll(@Query() query: Record<string, unknown>) {
    const { data, total, skip, take } = await this.productService.findAll(query);
    return ApiResponse.paginated(data, total, skip, take);
  }

  @Get('barcode/:barcode')
  @ApiOperation({ summary: 'Get product by barcode' })
  async findByBarcode(@Param('barcode') barcode: string) {
    const data = await this.productService.findByBarcode(barcode);
    return ApiResponse.ok(data);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get products with stock below minimum level' })
  async getLowStock() {
    const data = await this.productService.getLowStockProducts();
    return ApiResponse.ok(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.productService.findOne(id);
    return ApiResponse.ok(data);
  }

  @Get(':id/stock')
  @ApiOperation({ summary: 'Get product stock by warehouse' })
  async getStockByWarehouse(@Param('id', ParseIntPipe) id: number) {
    const data = await this.productService.getStockByWarehouse(id);
    return ApiResponse.ok(data);
  }

  @Post()
  @ApiOperation({ summary: 'Create product' })
  async create(@Body() dto: CreateProductDto) {
    const data = await this.productService.create(dto);
    return ApiResponse.ok(data, 'Product created successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update product' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    const data = await this.productService.update(id, dto);
    return ApiResponse.ok(data, 'Product updated successfully');
  }

  @Post(':id/stock')
  @ApiOperation({ summary: 'Adjust product stock' })
  async adjustStock(@Param('id', ParseIntPipe) id: number, @Body() dto: AdjustStockDto) {
    const data = await this.productService.adjustStock(id, dto);
    return ApiResponse.ok(data, 'Stock adjusted successfully');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete product' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const data = await this.productService.remove(id);
    return ApiResponse.ok(data, 'Product deactivated successfully');
  }
}
