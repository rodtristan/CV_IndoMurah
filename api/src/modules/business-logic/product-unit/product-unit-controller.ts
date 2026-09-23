import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProductUnitService } from './product-unit-service';
import { CreateProductUnitDto, ProductUnitFilterDto, ConvertUnitDto } from './product-unit.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../../common/dto/api-response-dto';

@ApiTags('Business Logic - Product Unit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-logic/product-unit')
export class ProductUnitController {
  constructor(private productUnitService: ProductUnitService) {}

  @Post()
  @ApiOperation({ summary: 'Set product unit configurations' })
  async setProductUnits(@Body() dto: CreateProductUnitDto) {
    const userId = 'system';
    const data = await this.productUnitService.setProductUnits(dto, userId);
    return ApiResponse.ok(data, 'Product units configured successfully');
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get product units by product ID' })
  async getProductUnits(@Param('productId') productId: number) {
    const data = await this.productUnitService.getProductUnits(productId);
    return ApiResponse.ok(data);
  }

  @Get()
  @ApiOperation({ summary: 'List product units' })
  async listProductUnits(@Query() dto: ProductUnitFilterDto) {
    const data = await this.productUnitService.listProductUnits(dto);
    return ApiResponse.ok(data);
  }

  @Post('convert')
  @ApiOperation({ summary: 'Convert quantity between units' })
  async convertUnit(@Body() dto: ConvertUnitDto) {
    const data = await this.productUnitService.convertUnit(dto);
    return ApiResponse.ok(data);
  }

  @Get('options/:productId')
  @ApiOperation({ summary: 'Get unit options for product (dropdown)' })
  async getProductUnitOptions(
    @Param('productId') productId: number,
    @Query('type') type?: 'sell' | 'purchase',
  ) {
    const data = await this.productUnitService.getProductUnitOptions(productId, type);
    return ApiResponse.ok(data);
  }
}
