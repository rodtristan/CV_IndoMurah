import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductImageDto {
  @ApiProperty({ description: 'productId' })
  @IsNumber()
  productId: number;

  @ApiProperty({ description: 'url' })
  @IsString()
  url: string;

  @ApiProperty({ description: 'caption' })
  @IsString()
  caption: string;

  @ApiProperty({ description: 'sortOrder' })
  @IsNumber()
  sortOrder: number;

  @ApiProperty({ description: 'isPrimary' })
  @IsBoolean()
  isPrimary: boolean;

  @ApiProperty({ description: 'product' })
  product: any;

}

export class UpdateProductImageDto {
  @ApiPropertyOptional({ description: 'productId' })
  @IsOptional()
  @IsNumber()
  productId?: number;

  @ApiPropertyOptional({ description: 'url' })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ description: 'caption' })
  @IsOptional()
  @IsString()
  caption?: string;

  @ApiPropertyOptional({ description: 'sortOrder' })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'isPrimary' })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ description: 'product' })
  @IsOptional()
  product?: any;

}

export class ProductImageResponseDto {
  @ApiProperty({ description: 'productId' })
  productId: number;

  @ApiProperty({ description: 'url' })
  url: string;

  @ApiProperty({ description: 'caption' })
  caption: string;

  @ApiProperty({ description: 'sortOrder' })
  sortOrder: number;

  @ApiProperty({ description: 'isPrimary' })
  isPrimary: boolean;

  @ApiProperty({ description: 'product' })
  product: any;

}

export class QueryProductImageDto {
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
