import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStockAlertDto {
  @ApiProperty({ description: 'productId' })
  @IsNumber()
  productId: number;

  @ApiProperty({ description: 'Alert type ID' })
  @IsNumber()
  alertTypeId: number;

  @ApiPropertyOptional({ description: 'threshold' })
  @IsOptional()
  @IsNumber()
  threshold?: number;

  @ApiPropertyOptional({ description: 'currentStock' })
  @IsOptional()
  @IsNumber()
  currentStock?: number;

  @ApiPropertyOptional({ description: 'isRead' })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @ApiPropertyOptional({ description: 'isResolved' })
  @IsOptional()
  @IsBoolean()
  isResolved?: boolean;

  @ApiPropertyOptional({ description: 'resolvedAt' })
  @IsOptional()
  resolvedAt?: Date;

  @ApiPropertyOptional({ description: 'notes' })
  @IsOptional()
  @IsString()
  notes?: string;


}

export class UpdateStockAlertDto {
  @ApiPropertyOptional({ description: 'productId' })
  @IsOptional()
  @IsNumber()
  productId?: number;

  @ApiPropertyOptional({ description: 'Alert type ID' })
  @IsOptional()
  @IsNumber()
  alertTypeId?: number;

  @ApiPropertyOptional({ description: 'threshold' })
  @IsOptional()
  @IsNumber()
  threshold?: number;

  @ApiPropertyOptional({ description: 'currentStock' })
  @IsOptional()
  @IsNumber()
  currentStock?: number;

  @ApiPropertyOptional({ description: 'isRead' })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @ApiPropertyOptional({ description: 'isResolved' })
  @IsOptional()
  @IsBoolean()
  isResolved?: boolean;

  @ApiPropertyOptional({ description: 'resolvedAt' })
  @IsOptional()
  resolvedAt?: Date;

  @ApiPropertyOptional({ description: 'notes' })
  @IsOptional()
  @IsString()
  notes?: string;


}

export class StockAlertResponseDto {
  @ApiProperty({ description: 'productId' })
  productId: number;

  @ApiProperty({ description: 'Alert type ID' })
  alertTypeId: number;

  @ApiProperty({ description: 'threshold' })
  threshold: number;

  @ApiProperty({ description: 'currentStock' })
  currentStock: number;

  @ApiProperty({ description: 'isRead' })
  isRead: boolean;

  @ApiProperty({ description: 'isResolved' })
  isResolved: boolean;

  @ApiProperty({ description: 'resolvedAt' })
  resolvedAt: Date;

  @ApiProperty({ description: 'notes' })
  notes: string;

  @ApiProperty({ description: 'product' })
  product: any;

}

export class QueryStockAlertDto {
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
