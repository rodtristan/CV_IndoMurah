import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
  IsNotEmpty,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class StockTransferItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNumber()
  ProductId: number;

  @ApiProperty({ description: 'Quantity to transfer' })
  @IsNumber()
  @Min(0.001)
  Quantity: number;

  @ApiPropertyOptional({ description: 'Unit ID' })
  @IsOptional()
  @IsNumber()
  UnitId?: number;

  @ApiPropertyOptional({ description: 'Notes for this item' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class CreateStockTransferDto {
  @ApiProperty({ description: 'Transfer Date' })
  @IsDateString()
  Date: string;

  @ApiProperty({ description: 'Source warehouse ID' })
  @IsNumber()
  FromWarehouseId: number;

  @ApiProperty({ description: 'Destination warehouse ID' })
  @IsNumber()
  ToWarehouseId: number;

  @ApiProperty({ description: 'Transfer Items', type: [StockTransferItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockTransferItemDto)
  Items: StockTransferItemDto[];

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class StockTransferFilterDto {
  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'From warehouse ID' })
  @IsOptional()
  @IsNumber()
  FromWarehouseId?: number;

  @ApiPropertyOptional({ description: 'To warehouse ID' })
  @IsOptional()
  @IsNumber()
  ToWarehouseId?: number;

  @ApiPropertyOptional({ description: 'Status ID' })
  @IsOptional()
  @IsNumber()
  StatusId?: number;

  @ApiPropertyOptional({ description: 'Page number' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  Page?: number;

  @ApiPropertyOptional({ description: 'Page size' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  Limit?: number;
}

export class StockTransferSummaryDto {
  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;
}

export class CompleteStockTransferDto {
  @ApiPropertyOptional({ description: 'Completion Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}
