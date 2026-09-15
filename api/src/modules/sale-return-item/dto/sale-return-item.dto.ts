import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSaleReturnItemDto {
  @ApiProperty({ description: 'saleReturnId' })
  @IsNumber()
  saleReturnId: number;

  @ApiProperty({ description: 'productId' })
  @IsNumber()
  productId: number;

  @ApiProperty({ description: 'quantity' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'unitPrice' })
  @IsNumber()
  unitPrice: number;

  @ApiProperty({ description: 'subtotal' })
  @IsNumber()
  subtotal: number;

  @ApiProperty({ description: 'saleReturn' })
  saleReturn: any;

  @ApiProperty({ description: 'product' })
  product: any;

  @ApiProperty({ description: 'unit' })
  unit: any;

  @ApiProperty({ description: 'unitId' })
  @IsNumber()
  unitId: number;

}

export class UpdateSaleReturnItemDto {
  @ApiPropertyOptional({ description: 'saleReturnId' })
  @IsOptional()
  @IsNumber()
  saleReturnId?: number;

  @ApiPropertyOptional({ description: 'productId' })
  @IsOptional()
  @IsNumber()
  productId?: number;

  @ApiPropertyOptional({ description: 'quantity' })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional({ description: 'unitPrice' })
  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @ApiPropertyOptional({ description: 'subtotal' })
  @IsOptional()
  @IsNumber()
  subtotal?: number;

  @ApiPropertyOptional({ description: 'saleReturn' })
  @IsOptional()
  saleReturn?: any;

  @ApiPropertyOptional({ description: 'product' })
  @IsOptional()
  product?: any;

  @ApiPropertyOptional({ description: 'unit' })
  @IsOptional()
  unit?: any;

  @ApiPropertyOptional({ description: 'unitId' })
  @IsOptional()
  @IsNumber()
  unitId?: number;

}

export class SaleReturnItemResponseDto {
  @ApiProperty({ description: 'saleReturnId' })
  saleReturnId: number;

  @ApiProperty({ description: 'productId' })
  productId: number;

  @ApiProperty({ description: 'quantity' })
  quantity: number;

  @ApiProperty({ description: 'unitPrice' })
  unitPrice: number;

  @ApiProperty({ description: 'subtotal' })
  subtotal: number;

  @ApiProperty({ description: 'saleReturn' })
  saleReturn: any;

  @ApiProperty({ description: 'product' })
  product: any;

  @ApiProperty({ description: 'unit' })
  unit: any;

  @ApiProperty({ description: 'unitId' })
  unitId: number;

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
