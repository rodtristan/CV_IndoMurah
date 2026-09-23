import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStockOpnameItemDto {
  @ApiProperty({ description: 'stockOpnameId' })
  @IsNumber()
  stockOpnameId: number;

  @ApiProperty({ description: 'productId' })
  @IsNumber()
  productId: number;

  @ApiProperty({ description: 'systemStock' })
  @IsNumber()
  systemStock: number;

  @ApiProperty({ description: 'countedStock' })
  @IsNumber()
  countedStock: number;

  @ApiProperty({ description: 'difference' })
  @IsNumber()
  difference: number;

  @ApiProperty({ description: 'unitId' })
  @IsNumber()
  unitId: number;

  @ApiPropertyOptional({ description: 'unitPrice' })
  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @ApiPropertyOptional({ description: 'note' })
  @IsOptional()
  @IsString()
  note?: string;


}

export class UpdateStockOpnameItemDto {
  @ApiPropertyOptional({ description: 'stockOpnameId' })
  @IsOptional()
  @IsNumber()
  stockOpnameId?: number;

  @ApiPropertyOptional({ description: 'productId' })
  @IsOptional()
  @IsNumber()
  productId?: number;

  @ApiPropertyOptional({ description: 'systemStock' })
  @IsOptional()
  @IsNumber()
  systemStock?: number;

  @ApiPropertyOptional({ description: 'countedStock' })
  @IsOptional()
  @IsNumber()
  countedStock?: number;

  @ApiPropertyOptional({ description: 'difference' })
  @IsOptional()
  @IsNumber()
  difference?: number;

  @ApiPropertyOptional({ description: 'unitId' })
  @IsOptional()
  @IsNumber()
  unitId?: number;

  @ApiPropertyOptional({ description: 'unitPrice' })
  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @ApiPropertyOptional({ description: 'note' })
  @IsOptional()
  @IsString()
  note?: string;


}

export class StockOpnameItemResponseDto {
  @ApiProperty({ description: 'stockOpnameId' })
  stockOpnameId: number;

  @ApiProperty({ description: 'productId' })
  productId: number;

  @ApiProperty({ description: 'systemStock' })
  systemStock: number;

  @ApiProperty({ description: 'countedStock' })
  countedStock: number;

  @ApiProperty({ description: 'difference' })
  difference: number;

  @ApiProperty({ description: 'unitId' })
  unitId: number;

  @ApiProperty({ description: 'unitPrice' })
  unitPrice: number;

  @ApiProperty({ description: 'note' })
  note: string;

  @ApiProperty({ description: 'stockOpname' })
  stockOpname: any;

  @ApiProperty({ description: 'product' })
  product: any;

  @ApiProperty({ description: 'unit' })
  unit: any;

}

export class QueryStockOpnameItemDto {
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
