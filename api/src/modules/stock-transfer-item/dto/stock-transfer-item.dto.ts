import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStockTransferItemDto {
  @ApiProperty({ description: 'stockTransferId' })
  @IsNumber()
  stockTransferId: number;

  @ApiProperty({ description: 'productId' })
  @IsNumber()
  productId: number;

  @ApiProperty({ description: 'quantity' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'unitId' })
  @IsNumber()
  unitId: number;

  @ApiPropertyOptional({ description: 'unitPrice' })
  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @ApiPropertyOptional({ description: 'subtotal' })
  @IsOptional()
  @IsNumber()
  subtotal?: number;


}

export class UpdateStockTransferItemDto {
  @ApiPropertyOptional({ description: 'stockTransferId' })
  @IsOptional()
  @IsNumber()
  stockTransferId?: number;

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

export class StockTransferItemResponseDto {
  @ApiProperty({ description: 'stockTransferId' })
  stockTransferId: number;

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

  @ApiProperty({ description: 'stockTransfer' })
  stockTransfer: any;

  @ApiProperty({ description: 'product' })
  product: any;

  @ApiProperty({ description: 'unit' })
  unit: any;

}

export class QueryStockTransferItemDto {
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
