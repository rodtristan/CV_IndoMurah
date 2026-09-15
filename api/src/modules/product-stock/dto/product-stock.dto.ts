import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductStockDto {
  @ApiProperty({ description: 'productId' })
  @IsNumber()
  productId: number;

  @ApiProperty({ description: 'warehouseId' })
  @IsNumber()
  warehouseId: number;

  @ApiProperty({ description: 'quantity' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'minimumStock' })
  @IsNumber()
  minimumStock: number;

  @ApiProperty({ description: 'product' })
  product: any;

  @ApiProperty({ description: 'warehouse' })
  warehouse: any;

}

export class UpdateProductStockDto {
  @ApiPropertyOptional({ description: 'productId' })
  @IsOptional()
  @IsNumber()
  productId?: number;

  @ApiPropertyOptional({ description: 'warehouseId' })
  @IsOptional()
  @IsNumber()
  warehouseId?: number;

  @ApiPropertyOptional({ description: 'quantity' })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional({ description: 'minimumStock' })
  @IsOptional()
  @IsNumber()
  minimumStock?: number;

  @ApiPropertyOptional({ description: 'product' })
  @IsOptional()
  product?: any;

  @ApiPropertyOptional({ description: 'warehouse' })
  @IsOptional()
  warehouse?: any;

}

export class ProductStockResponseDto {
  @ApiProperty({ description: 'productId' })
  productId: number;

  @ApiProperty({ description: 'warehouseId' })
  warehouseId: number;

  @ApiProperty({ description: 'quantity' })
  quantity: number;

  @ApiProperty({ description: 'minimumStock' })
  minimumStock: number;

  @ApiProperty({ description: 'product' })
  product: any;

  @ApiProperty({ description: 'warehouse' })
  warehouse: any;

}

export class QueryProductStockDto {
  @ApiPropertyOptional({ description: 'Fields to select' })
  @IsOptional()
  @IsString()
  $select?: string;

  @ApiPropertyOptional({ description: 'Relations to include' })
  @IsOptional()
  @IsString()
  $include?: string;

  @ApiPropertyOptional({ description: 'Number of records to skip' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  $skip?: number;

  @ApiPropertyOptional({ description: 'Number of records to take' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  $take?: number;

  @ApiPropertyOptional({ description: 'Search keyword' })
  @IsOptional()
  @IsString()
  $search?: string;
}
