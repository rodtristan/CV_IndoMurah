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
// PRODUCTION DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class ProductionItemDto {
  @ApiProperty({ description: 'Raw material product ID' })
  @IsNumber()
  ProductId: number;

  @ApiProperty({ description: 'Quantity needed' })
  @IsNumber()
  @Min(0.001)
  Quantity: number;

  @ApiPropertyOptional({ description: 'Unit ID' })
  @IsOptional()
  @IsNumber()
  UnitId?: number;

  @ApiPropertyOptional({ description: 'Unit price (for cost calculation)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  UnitPrice?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class CreateProductionDto {
  @ApiPropertyOptional({ description: 'Production Date' })
  @IsOptional()
  @IsDateString()
  Date?: string;

  @ApiPropertyOptional({ description: 'Finished product ID (product result)' })
  @IsOptional()
  @IsNumber()
  ProductId?: number;

  @ApiPropertyOptional({ description: 'Finished product Name (if new product)' })
  @IsOptional()
  @IsString()
  ProductName?: string;

  @ApiProperty({ description: 'Production Quantity' })
  @IsNumber()
  @Min(0.001)
  Quantity: number;

  @ApiPropertyOptional({ description: 'Warehouse ID for output' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @ApiPropertyOptional({ description: 'Labor cost' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  LaborCost?: number;

  @ApiPropertyOptional({ description: 'Overhead cost' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  OverheadCost?: number;

  @ApiProperty({ description: 'Raw material Items', type: [ProductionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductionItemDto)
  Items: ProductionItemDto[];

  @ApiPropertyOptional({ description: 'Production Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class ProductionFilterDto {
  @ApiPropertyOptional({ description: 'Warehouse ID filter' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @ApiPropertyOptional({ description: 'Status ID filter' })
  @IsOptional()
  @IsNumber()
  StatusId?: number;

  @ApiPropertyOptional({ description: 'Start Date filter' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date filter' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Pending only' })
  @IsOptional()
  @IsBoolean()
  PendingOnly?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// BOM (Bill of Materials) DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class BOMItemDto {
  @ApiProperty({ description: 'Raw material product ID' })
  @IsNumber()
  ProductId: number;

  @ApiProperty({ description: 'Quantity per unit of finished product' })
  @IsNumber()
  @Min(0.001)
  Quantity: number;

  @ApiPropertyOptional({ description: 'Unit ID' })
  @IsOptional()
  @IsNumber()
  UnitId?: number;
}

export class CreateBOMDto {
  @ApiProperty({ description: 'Finished product ID' })
  @IsNumber()
  ProductId: number;

  @ApiProperty({ description: 'BOM Items', type: [BOMItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BOMItemDto)
  Items: BOMItemDto[];

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}
