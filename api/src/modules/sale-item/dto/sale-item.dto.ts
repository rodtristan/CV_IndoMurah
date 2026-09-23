import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSaleItemDto {
  @ApiProperty({ description: 'Sale ID' })
  @IsNumber()
  saleId: number;

  @ApiProperty({ description: 'Product ID' })
  @IsNumber()
  productId: number;

  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Unit ID' })
  @IsNumber()
  unitId: number;

  @ApiProperty({ description: 'Unit price' })
  @IsNumber()
  unitPrice: number;

  @ApiPropertyOptional({ description: 'Discount percent' })
  @IsOptional()
  @IsNumber()
  discountPercent?: number;

  @ApiPropertyOptional({ description: 'Discount amount' })
  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @ApiPropertyOptional({ description: 'Subtotal (calculated)' })
  @IsOptional()
  @IsNumber()
  subtotal?: number;
}

export class UpdateSaleItemDto {
  @ApiPropertyOptional({ description: 'Product ID' })
  @IsOptional()
  @IsNumber()
  productId?: number;

  @ApiPropertyOptional({ description: 'Quantity' })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional({ description: 'Unit ID' })
  @IsOptional()
  @IsNumber()
  unitId?: number;

  @ApiPropertyOptional({ description: 'Unit price' })
  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @ApiPropertyOptional({ description: 'Discount percent' })
  @IsOptional()
  @IsNumber()
  discountPercent?: number;

  @ApiPropertyOptional({ description: 'Discount amount' })
  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @ApiPropertyOptional({ description: 'Subtotal (calculated)' })
  @IsOptional()
  @IsNumber()
  subtotal?: number;
}

export class SaleItemResponseDto {
  @ApiProperty({ description: 'Sale ID' })
  saleId: number;

  @ApiProperty({ description: 'Product ID' })
  productId: number;

  @ApiProperty({ description: 'Quantity' })
  quantity: number;

  @ApiProperty({ description: 'Unit ID' })
  unitId: number;

  @ApiProperty({ description: 'Unit price' })
  unitPrice: number;

  @ApiProperty({ description: 'Discount percent' })
  discountPercent: number;

  @ApiProperty({ description: 'Discount amount' })
  discountAmount: number;

  @ApiProperty({ description: 'Subtotal' })
  subtotal: number;
}

export class QuerySaleItemDto {
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
