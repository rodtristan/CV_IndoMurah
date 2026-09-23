import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSaleReturnItemDto {
  @ApiProperty({ description: 'Sale Return ID' })
  @IsNumber()
  saleReturnId: number;

  @ApiProperty({ description: 'Product ID' })
  @IsNumber()
  productId: number;

  @ApiPropertyOptional({ description: 'Unit ID' })
  @IsOptional()
  @IsNumber()
  unitId?: number;

  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Unit price' })
  @IsNumber()
  unitPrice: number;

  @ApiPropertyOptional({ description: 'Subtotal (calculated)' })
  @IsOptional()
  @IsNumber()
  subtotal?: number;
}

export class UpdateSaleReturnItemDto {
  @ApiPropertyOptional({ description: 'Product ID' })
  @IsOptional()
  @IsNumber()
  productId?: number;

  @ApiPropertyOptional({ description: 'Unit ID' })
  @IsOptional()
  @IsNumber()
  unitId?: number;

  @ApiPropertyOptional({ description: 'Quantity' })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional({ description: 'Unit price' })
  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @ApiPropertyOptional({ description: 'Subtotal (calculated)' })
  @IsOptional()
  @IsNumber()
  subtotal?: number;
}

export class SaleReturnItemResponseDto {
  @ApiProperty({ description: 'Sale Return ID' })
  saleReturnId: number;

  @ApiProperty({ description: 'Product ID' })
  productId: number;

  @ApiProperty({ description: 'Unit ID' })
  unitId: number;

  @ApiProperty({ description: 'Quantity' })
  quantity: number;

  @ApiProperty({ description: 'Unit price' })
  unitPrice: number;

  @ApiProperty({ description: 'Subtotal' })
  subtotal: number;
}

export class QuerySaleReturnItemDto {
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
