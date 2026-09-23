import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProductPriceService } from './product-price-service';
import { CreateProductPriceDto, ProductPriceFilterDto, GetPriceDto } from './product-price.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../../common/dto/api-response-dto';

@ApiTags('Business Logic - Product Price')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-logic/product-price')
export class ProductPriceController {
  constructor(private productPriceService: ProductPriceService) {}

  @Post()
  @ApiOperation({ summary: 'Set product price' })
  async setPrice(@Body() dto: CreateProductPriceDto) {
    const userId = 'system';
    const data = await this.productPriceService.setProductPrice(dto, userId);
    return ApiResponse.ok(data, 'Price set successfully');
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get all prices for a product' })
  async getProductPrices(@Param('productId') productId: number) {
    const data = await this.productPriceService.getProductPrices(productId);
    return ApiResponse.ok(data);
  }

  @Get('applicable')
  @ApiOperation({ summary: 'Get applicable price for a product' })
  async getApplicablePrice(@Query() dto: GetPriceDto) {
    const data = await this.productPriceService.getApplicablePrice(dto);
    return ApiResponse.ok(data);
  }

  @Get()
  @ApiOperation({ summary: 'List prices with filters' })
  async listPrices(@Query() dto: ProductPriceFilterDto) {
    const data = await this.productPriceService.listPrices(dto);
    return ApiResponse.ok(data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete price' })
  async deletePrice(@Param('id') id: number) {
    const data = await this.productPriceService.deletePrice(id);
    return ApiResponse.ok(data, 'Price deleted successfully');
  }
}
