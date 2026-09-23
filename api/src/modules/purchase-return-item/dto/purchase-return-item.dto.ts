import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePurchaseReturnItemDto {
  @ApiProperty({ description: 'purchaseReturnId' })
  @IsNumber()
  purchaseReturnId: number;

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

  @ApiProperty({ description: 'subtotal' })
  @IsNumber()
  subtotal: number;


}

export class UpdatePurchaseReturnItemDto {
  @ApiPropertyOptional({ description: 'purchaseReturnId' })
  @IsOptional()
  @IsNumber()
  purchaseReturnId?: number;

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

  @ApiPropertyOptional({ description: 'subtotal' })
  @IsOptional()
  @IsNumber()
  subtotal?: number;


}

export class PurchaseReturnItemResponseDto {
  @ApiProperty({ description: 'purchaseReturnId' })
  purchaseReturnId: number;

  @ApiProperty({ description: 'productId' })
  productId: number;

  @ApiProperty({ description: 'quantity' })
  quantity: number;

  @ApiProperty({ description: 'unitId' })
  unitId: number;

  @ApiProperty({ description: 'unitPrice' })
  unitPrice: number;

  @ApiProperty({ description: 'subtotal' })
  subtotal: number;

  @ApiProperty({ description: 'purchaseReturn' })
  purchaseReturn: any;

  @ApiProperty({ description: 'product' })
  product: any;

  @ApiProperty({ description: 'unit' })
  unit: any;

}

export class QueryPurchaseReturnItemDto {
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
