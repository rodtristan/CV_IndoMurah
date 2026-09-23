import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePriceHistoryDto {
  @ApiProperty({ description: 'productId' })
  @IsNumber()
  productId: number;

  @ApiProperty({ description: 'type' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'oldPrice' })
  @IsNumber()
  oldPrice: number;

  @ApiProperty({ description: 'newPrice' })
  @IsNumber()
  newPrice: number;

  @ApiPropertyOptional({ description: 'changedBy' })
  @IsOptional()
  @IsString()
  changedBy?: string;

  @ApiPropertyOptional({ description: 'changedAt' })
  @IsOptional()
  changedAt?: Date;


}

export class UpdatePriceHistoryDto {
  @ApiPropertyOptional({ description: 'productId' })
  @IsOptional()
  @IsNumber()
  productId?: number;

  @ApiPropertyOptional({ description: 'type' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'oldPrice' })
  @IsOptional()
  @IsNumber()
  oldPrice?: number;

  @ApiPropertyOptional({ description: 'newPrice' })
  @IsOptional()
  @IsNumber()
  newPrice?: number;

  @ApiPropertyOptional({ description: 'changedBy' })
  @IsOptional()
  @IsString()
  changedBy?: string;

  @ApiPropertyOptional({ description: 'changedAt' })
  @IsOptional()
  changedAt?: Date;


}

export class PriceHistoryResponseDto {
  @ApiProperty({ description: 'productId' })
  productId: number;

  @ApiProperty({ description: 'type' })
  type: string;

  @ApiProperty({ description: 'oldPrice' })
  oldPrice: number;

  @ApiProperty({ description: 'newPrice' })
  newPrice: number;

  @ApiProperty({ description: 'changedBy' })
  changedBy: string;

  @ApiProperty({ description: 'changedAt' })
  changedAt: Date;

  @ApiProperty({ description: 'product' })
  product: any;

}

export class QueryPriceHistoryDto {
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
