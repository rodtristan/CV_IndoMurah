import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  Min,
  IsNotEmpty,
  IsDateString,
} from 'class-validator';

// ─────────────────────────────────────────────────────────────────────────────
// STOCK OPNAME DTOs - Stock OpName / Stock Taking
// ─────────────────────────────────────────────────────────────────────────────

export class StockOpnameItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNumber()
  ProductId: number;

  @ApiProperty({ description: 'System stock Quantity (Stok sistem)' })
  @IsNumber()
  @Min(0)
  SystemQuantity: number;

  @ApiProperty({ description: 'Physical count Quantity (Stok fisik)' })
  @IsNumber()
  @Min(0)
  PhysicalQuantity: number;

  @ApiPropertyOptional({ description: 'Variance explanation' })
  @IsOptional()
  @IsString()
  VarianceReason?: string;

  @ApiPropertyOptional({ description: 'Notes for this item' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class CreateStockOpnameDto {
  @ApiProperty({ description: 'OpName Date' })
  @IsOptional()
  @IsDateString()
  Date?: string;

  @ApiProperty({ description: 'Warehouse ID to opName' })
  @IsNumber()
  WarehouseId: number;

  @ApiPropertyOptional({ description: 'OpName Reference number' })
  @IsOptional()
  @IsString()
  ReferenceNumber?: string;

  @ApiPropertyOptional({ description: 'OpName Type: FULL, PARTIAL' })
  @IsOptional()
  @IsString()
  Type?: string;

  @ApiPropertyOptional({ description: 'Created by user ID' })
  @IsOptional()
  @IsNumber()
  CreatedById?: number;

  @ApiProperty({ description: 'OpName Items', type: [StockOpnameItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockOpnameItemDto)
  Items: StockOpnameItemDto[];

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class UpdateStockOpnameDto {
  @ApiPropertyOptional({ description: 'OpName Date' })
  @IsOptional()
  @IsDateString()
  Date?: string;

  @ApiPropertyOptional({ description: 'Reference number' })
  @IsOptional()
  @IsString()
  ReferenceNumber?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;

  @ApiPropertyOptional({ description: 'Status: DRAFT, IN_PROGRESS, COMPLETED, CANCELLED' })
  @IsOptional()
  @IsString()
  Status?: string;
}

export class StockOpnameQueryDto {
  @ApiPropertyOptional({ description: 'Search keyword' })
  @IsOptional()
  @IsString()
  Search?: string;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @ApiPropertyOptional({ description: 'Status filter' })
  @IsOptional()
  @IsString()
  Status?: string;

  @ApiPropertyOptional({ description: 'Type filter' })
  @IsOptional()
  @IsString()
  Type?: string;

  @ApiPropertyOptional({ description: 'Start Date filter' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date filter' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  Page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  Limit?: number;
}

export class ApproveStockOpnameDto {
  @ApiPropertyOptional({ description: 'Approval Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;

  @ApiPropertyOptional({ description: 'Approved by user ID' })
  @IsOptional()
  @IsNumber()
  ApprovedById?: number;

  @ApiPropertyOptional({ description: 'Apply stock Adjustment (true = upDate system stock)' })
  @IsOptional()
  @IsString()
  ApplyAdjustment?: string;
}

export class CancelStockOpnameDto {
  @ApiProperty({ description: 'Cancellation reason' })
  @IsString()
  @IsNotEmpty()
  Reason: string;
}

export class GenerateOpnameListDto {
  @ApiProperty({ description: 'Warehouse ID' })
  @IsNumber()
  WarehouseId: number;

  @ApiPropertyOptional({ description: 'Category ID filter' })
  @IsOptional()
  @IsNumber()
  CategoryId?: number;

  @ApiPropertyOptional({ description: 'Only products with stock > 0' })
  @IsOptional()
  @IsString()
  InStockOnly?: string;
}
