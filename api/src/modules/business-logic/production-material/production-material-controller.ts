import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProductionMaterialService } from './production-material-service';
import {
  CreateProductionCategoryDto,
  UpdateProductionCategoryDto,
  CreateProductionMaterialDto,
  UpdateProductionMaterialDto,
  ProductionMaterialFilterDto,
} from './production-material.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../../common/dto/api-response-dto';

@ApiTags('Production Material - Bahan Produksi')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-logic/production-material')
export class ProductionMaterialController {
  constructor(private productionMaterialService: ProductionMaterialService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // PRODUCTION CATEGORY ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('categories')
  @ApiOperation({ summary: 'Create production category' })
  async createCategory(@Body() dto: CreateProductionCategoryDto) {
    const data = await this.productionMaterialService.createProductionCategory(dto);
    return ApiResponse.ok(data, 'Category created successfully');
  }

  @Get('categories')
  @ApiOperation({ summary: 'List production categories' })
  async listCategories(@Query('includeInactive') includeInactive?: string) {
    const data = await this.productionMaterialService.listProductionCategories(includeInactive === 'true');
    return ApiResponse.ok(data);
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get production category by ID' })
  async getCategory(@Param('id') id: number) {
    const data = await this.productionMaterialService.getProductionCategory(id);
    return ApiResponse.ok(data);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update production category' })
  async updateCategory(@Param('id') id: number, @Body() dto: UpdateProductionCategoryDto) {
    const data = await this.productionMaterialService.updateProductionCategory(id, dto);
    return ApiResponse.ok(data, 'Category updated successfully');
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete production category' })
  async deleteCategory(@Param('id') id: number) {
    const data = await this.productionMaterialService.deleteProductionCategory(id);
    return ApiResponse.ok(data, 'Category deleted successfully');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PRODUCTION MATERIAL ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create production material' })
  async createMaterial(@Body() dto: CreateProductionMaterialDto) {
    const userId = 'system';
    const data = await this.productionMaterialService.createProductionMaterial(dto, userId);
    return ApiResponse.ok(data, 'Material created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'List production materials' })
  async listMaterials(@Query() dto: ProductionMaterialFilterDto) {
    const data = await this.productionMaterialService.listProductionMaterials(dto);
    return ApiResponse.ok(data);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get low stock materials' })
  async getLowStockMaterials() {
    const data = await this.productionMaterialService.getLowStockMaterials();
    return ApiResponse.ok(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get production material by ID' })
  async getMaterial(@Param('id') id: number) {
    const data = await this.productionMaterialService.getProductionMaterial(id);
    return ApiResponse.ok(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update production material' })
  async updateMaterial(@Param('id') id: number, @Body() dto: UpdateProductionMaterialDto) {
    const userId = 'system';
    const data = await this.productionMaterialService.updateProductionMaterial(id, dto, userId);
    return ApiResponse.ok(data, 'Material updated successfully');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete production material' })
  async deleteMaterial(@Param('id') id: number) {
    const data = await this.productionMaterialService.deleteProductionMaterial(id);
    return ApiResponse.ok(data, 'Material deleted successfully');
  }
}
