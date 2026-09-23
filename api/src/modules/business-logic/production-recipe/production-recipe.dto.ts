import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested, Min } from 'class-validator';

export class RecipeItemDto {
  @ApiProperty({ description: 'Material product ID' })
  @IsNumber()
  ProductId: number;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @ApiPropertyOptional({ description: 'Unit ID' })
  @IsOptional()
  @IsNumber()
  UnitId?: number;

  @ApiProperty({ description: 'Quantity needed per production batch' })
  @IsNumber()
  @Min(0.0001)
  Quantity: number;

  @ApiPropertyOptional({ description: 'Price per unit (for cost calculation)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  Price?: number;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;
}

export class CreateRecipeDto {
  @ApiProperty({ description: 'Finished product ID' })
  @IsNumber()
  ProductId: number;

  @ApiProperty({ description: 'Recipe Name' })
  @IsString()
  Name: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;

  @ApiProperty({ description: 'Recipe Items (materials)', type: [RecipeItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeItemDto)
  Items: RecipeItemDto[];
}

export class RecipeFilterDto {
  @ApiPropertyOptional({ description: 'Product ID filter' })
  @IsOptional()
  @IsNumber()
  ProductId?: number;

  @ApiPropertyOptional({ description: 'Active only' })
  @IsOptional()
  @IsBoolean()
  ActiveOnly?: boolean;
}

export class CalculateRecipeDto {
  @ApiProperty({ description: 'Recipe ID' })
  @IsNumber()
  RecipeId: number;

  @ApiProperty({ description: 'Production Quantity' })
  @IsNumber()
  @Min(0.0001)
  Quantity: number;

  @ApiPropertyOptional({ description: 'Warehouse ID (for stock check)' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;
}
