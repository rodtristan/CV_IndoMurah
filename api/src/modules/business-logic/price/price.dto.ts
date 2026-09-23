import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  Min,
  IsNotEmpty,
} from 'class-validator';

// ─────────────────────────────────────────────────────────────────────────────
// PRICE HISTORY DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class UpdateProductPriceDto {
  @ApiProperty({ description: 'New selling price' })
  @IsNumber()
  @Min(0)
  SellingPrice: number;

  @ApiPropertyOptional({ description: 'Reason for price change' })
  @IsOptional()
  @IsString()
  Reason?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class UpdatePriceItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNumber()
  ProductId: number;

  @ApiProperty({ description: 'New selling price' })
  @IsNumber()
  @Min(0)
  SellingPrice: number;
}

export class BulkUpdatePriceDto {
  @ApiProperty({ description: 'Price updates', type: [UpdatePriceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePriceItemDto)
  Updates: UpdatePriceItemDto[];

  @ApiPropertyOptional({ description: 'Reason for bulk update' })
  @IsOptional()
  @IsString()
  Reason?: string;
}

export class PriceHistoryFilterDto {
  @ApiPropertyOptional({ description: 'Product ID' })
  @IsOptional()
  @IsNumber()
  ProductId?: number;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsNumber()
  CategoryId?: number;

  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Type filter (PURCHASE, SELLING, DISCOUNT)' })
  @IsOptional()
  @IsString()
  Type?: string;

  @ApiPropertyOptional({ description: 'Limit results' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  Limit?: number;
}

export class PriceChangeReportDto {
  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsNumber()
  CategoryId?: number;

  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;
}

export class PriceAnalysisDto {
  @ApiPropertyOptional({ description: 'Product ID' })
  @IsOptional()
  @IsNumber()
  ProductId?: number;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsNumber()
  CategoryId?: number;
}
