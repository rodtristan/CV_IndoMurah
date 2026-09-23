import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { CategoryBrandService } from './category-brand-service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryFilterDto,
  CreateBrandDto,
  UpdateBrandDto,
  BrandFilterDto,
  CreateUnitDto,
  UpdateUnitDto,
  CreateProductGroupDto,
  UpdateProductGroupDto,
} from './category-brand.dto';

@Controller('business-logic/master-data')
export class CategoryBrandController {
  constructor(private readonly categoryBrandService: CategoryBrandService) {}

  // Category Endpoints
  @Post('categories')
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoryBrandService.createCategory(dto);
  }

  @Get('categories')
  async listCategories(@Query() dto: CategoryFilterDto) {
    return this.categoryBrandService.listCategories(dto);
  }

  @Get('categories/:id')
  async getCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoryBrandService.getCategory(id);
  }

  @Put('categories/:id')
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoryBrandService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoryBrandService.deleteCategory(id);
  }

  // Brand Endpoints
  @Post('brands')
  async createBrand(@Body() dto: CreateBrandDto) {
    return this.categoryBrandService.createBrand(dto);
  }

  @Get('brands')
  async listBrands(@Query() dto: BrandFilterDto) {
    return this.categoryBrandService.listBrands(dto);
  }

  @Get('brands/:id')
  async getBrand(@Param('id', ParseIntPipe) id: number) {
    return this.categoryBrandService.getBrand(id);
  }

  @Put('brands/:id')
  async updateBrand(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBrandDto,
  ) {
    return this.categoryBrandService.updateBrand(id, dto);
  }

  @Delete('brands/:id')
  async deleteBrand(@Param('id', ParseIntPipe) id: number) {
    return this.categoryBrandService.deleteBrand(id);
  }

  // Unit Endpoints
  @Post('units')
  async createUnit(@Body() dto: CreateUnitDto) {
    return this.categoryBrandService.createUnit(dto);
  }

  @Get('units')
  async listUnits() {
    return this.categoryBrandService.listUnits();
  }

  @Put('units/:id')
  async updateUnit(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUnitDto,
  ) {
    return this.categoryBrandService.updateUnit(id, dto);
  }

  // Product Group Endpoints
  @Post('product-groups')
  async createProductGroup(@Body() dto: CreateProductGroupDto) {
    return this.categoryBrandService.createProductGroup(dto);
  }

  @Get('product-groups')
  async listProductGroups() {
    return this.categoryBrandService.listProductGroups();
  }

  @Put('product-groups/:id')
  async updateProductGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductGroupDto,
  ) {
    return this.categoryBrandService.updateProductGroup(id, dto);
  }

  // Summary
  @Get('summary')
  async getMasterDataSummary() {
    return this.categoryBrandService.getMasterDataSummary();
  }
}
