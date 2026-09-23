import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProductionRecipeService } from './production-recipe-service';
import { CreateRecipeDto, RecipeFilterDto, CalculateRecipeDto } from './production-recipe.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../../common/dto/api-response-dto';

@ApiTags('Business Logic - Production Recipe')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-logic/production-recipe')
export class ProductionRecipeController {
  constructor(private recipeService: ProductionRecipeService) {}

  @Post()
  @ApiOperation({ summary: 'Create or update production recipe' })
  async createRecipe(@Body() dto: CreateRecipeDto) {
    const userId = 'system';
    const data = await this.recipeService.createRecipe(dto, userId);
    return ApiResponse.ok(data, 'Recipe saved successfully');
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get recipe by product ID' })
  async getRecipeByProduct(@Param('productId') productId: number) {
    const data = await this.recipeService.getRecipeByProduct(productId);
    return ApiResponse.ok(data);
  }

  @Get()
  @ApiOperation({ summary: 'List recipes' })
  async listRecipes(@Query() dto: RecipeFilterDto) {
    const data = await this.recipeService.listRecipes(dto);
    return ApiResponse.ok(data);
  }

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate recipe cost for production' })
  async calculateRecipe(@Body() dto: CalculateRecipeDto) {
    const data = await this.recipeService.calculateRecipe(dto);
    return ApiResponse.ok(data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete recipe' })
  async deleteRecipe(@Param('id') id: number) {
    const data = await this.recipeService.deleteRecipe(id);
    return ApiResponse.ok(data, 'Recipe deleted successfully');
  }
}
