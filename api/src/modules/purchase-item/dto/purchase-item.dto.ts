import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePurchaseItemDto {
  @ApiProperty({ description: 'purchaseId' })
  @IsNumber()
  purchaseId: number;

  @ApiProperty({ description: 'productId' })
  @IsNumber()
  productId: number;

  @ApiProperty({ description: 'quantity' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'unitId' })
  @IsNumber()
  unitId: number;

  @ApiProperty({ description: 'unitPrice' })
  @IsNumber()
  unitPrice: number;

  @ApiPropertyOptional({ description: 'discountPercent' })
  @IsOptional()
  @IsNumber()
  discountPercent?: number;

  @ApiPropertyOptional({ description: 'discountAmount' })
  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @ApiProperty({ description: 'subtotal' })
  @IsNumber()
  subtotal: number;


}

export class UpdatePurchaseItemDto {
  @ApiPropertyOptional({ description: 'purchaseId' })
  @IsOptional()
  @IsNumber()
  purchaseId?: number;

  @ApiPropertyOptional({ description: 'productId' })
  @IsOptional()
  @IsNumber()
  productId?: number;

  @ApiPropertyOptional({ description: 'quantity' })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional({ description: 'unitId' })
  @IsOptional()
  @IsNumber()
  unitId?: number;

  @ApiPropertyOptional({ description: 'unitPrice' })
  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @ApiPropertyOptional({ description: 'discountPercent' })
  @IsOptional()
  @IsNumber()
  discountPercent?: number;

  @ApiPropertyOptional({ description: 'discountAmount' })
  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @ApiPropertyOptional({ description: 'subtotal' })
  @IsOptional()
  @IsNumber()
  subtotal?: number;


}

export class PurchaseItemResponseDto {
  @ApiProperty({ description: 'purchaseId' })
  purchaseId: number;

  @ApiProperty({ description: 'productId' })
  productId: number;

  @ApiProperty({ description: 'quantity' })
  quantity: number;

  @ApiProperty({ description: 'unitId' })
  unitId: number;

  @ApiProperty({ description: 'unitPrice' })
  unitPrice: number;

  @ApiProperty({ description: 'discountPercent' })
  discountPercent: number;

  @ApiProperty({ description: 'discountAmount' })
  discountAmount: number;

  @ApiProperty({ description: 'subtotal' })
  subtotal: number;

  @ApiProperty({ description: 'purchase' })
  purchase: any;

  @ApiProperty({ description: 'product' })
  product: any;

  @ApiProperty({ description: 'unit' })
  unit: any;

}

export class QueryPurchaseItemDto {
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
