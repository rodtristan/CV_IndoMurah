import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProductTypeService } from './product-type-service';
import { CreateProductTypeDto, UpDateProductTypeDto, ProductTypeFilterDto } from './product-type.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../../common/dto/api-response-dto';

@ApiTags('Business Logic - Product Type')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-logic/product-type')
export class ProductTypeController {
  constructor(private productTypeService: ProductTypeService) {}

  @Post()
  @ApiOperation({ summary: 'Create new product type' })
  async createProductType(@Body() dto: CreateProductTypeDto) {
    const userId = 'system';
    const data = await this.productTypeService.createProductType(dto, userId);
    return ApiResponse.ok(data, 'Product type created successfully');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product type' })
  async updateProductType(@Param('id') id: number, @Body() dto: UpDateProductTypeDto) {
    const userId = 'system';
    const data = await this.productTypeService.updateProductType(id, dto, userId);
    return ApiResponse.ok(data, 'Product type updated successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product type by ID' })
  async getProductType(@Param('id') id: number) {
    const data = await this.productTypeService.getProductType(id);
    return ApiResponse.ok(data);
  }

  @Get()
  @ApiOperation({ summary: 'List product types' })
  async listProductTypes(@Query() dto: ProductTypeFilterDto) {
    const data = await this.productTypeService.listProductTypes(dto);
    return ApiResponse.ok(data);
  }

  @Get('stats/overview')
  @ApiOperation({ summary: 'Get product type statistics' })
  async getProductTypeStats() {
    const data = await this.productTypeService.getProductTypeStats();
    return ApiResponse.ok(data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product type' })
  async deleteProductType(@Param('id') id: number) {
    const data = await this.productTypeService.deleteProductType(id);
    return ApiResponse.ok(data, 'Product type deleted successfully');
  }
}
