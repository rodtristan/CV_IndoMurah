import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsOptional, IsBoolean, IsArray, Min } from 'class-validator';

// ─────────────────────────────────────────────────────────────────────────────
// MUTATION CATEGORY
// ─────────────────────────────────────────────────────────────────────────────

export class CreateMutationCategoryDto {
  @ApiProperty({ description: 'Category Code', example: 'ADJ-IN' })
  @IsString()
  Code: string;

  @ApiProperty({ description: 'Category Name', example: 'Stock Adjustment In' })
  @IsString()
  Name: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;

  @ApiPropertyOptional({ description: 'Color for UI', example: '#4CAF50' })
  @IsOptional()
  @IsString()
  Color?: string;

  @ApiPropertyOptional({ description: 'Mutation Type: IN, OUT, ADJUSTMENT', example: 'IN' })
  @IsOptional()
  @IsString()
  MutationType?: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER';
}

export class UpdateMutationCategoryDto {
  @ApiPropertyOptional({ description: 'Category Name' })
  @IsOptional()
  @IsString()
  Name?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;

  @ApiPropertyOptional({ description: 'Color for UI' })
  @IsOptional()
  @IsString()
  Color?: string;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// STOCK MUTATION
// ─────────────────────────────────────────────────────────────────────────────

export class StockMutationItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNumber()
  ProductId: number;

  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  @Min(0.001)
  Quantity: number;

  @ApiPropertyOptional({ description: 'Unit ID' })
  @IsOptional()
  @IsNumber()
  UnitId?: number;

  @ApiPropertyOptional({ description: 'Unit price for valuation' })
  @IsOptional()
  @IsNumber()
  UnitPrice?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class CreateStockMutationDto {
  @ApiProperty({ description: 'Mutation category ID' })
  @IsNumber()
  MutationCategoryId: number;

  @ApiProperty({ description: 'Warehouse ID' })
  @IsNumber()
  WarehouseId: number;

  @ApiProperty({ description: 'Mutation Date' })
  @IsDateString()
  MutationDate: string;

  @ApiPropertyOptional({ description: 'Reference number (e.g., Purchase Order, Sales Order)' })
  @IsOptional()
  @IsString()
  ReferenceNumber?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;

  @ApiProperty({ description: 'Items', type: [StockMutationItemDto] })
  @IsArray()
  Items: StockMutationItemDto[];
}

export class UpdateStockMutationDto {
  @ApiPropertyOptional({ description: 'Reference number' })
  @IsOptional()
  @IsString()
  ReferenceNumber?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class StockMutationFilterDto {
  @ApiPropertyOptional({ description: 'Start Date filter' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date filter' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Mutation category ID' })
  @IsOptional()
  @IsNumber()
  MutationCategoryId?: number;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @ApiPropertyOptional({ description: 'Mutation Type filter (IN, OUT, ADJUSTMENT, TRANSFER)' })
  @IsOptional()
  @IsString()
  MutationType?: string;

  @ApiPropertyOptional({ description: 'Search by Code or Reference' })
  @IsOptional()
  @IsString()
  Search?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// MUTATION REPORT
// ─────────────────────────────────────────────────────────────────────────────

export class MutationReportDto {
  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @ApiPropertyOptional({ description: 'Group by: day, week, month' })
  @IsOptional()
  @IsString()
  GroupBy?: 'day' | 'week' | 'month';
}

export class MutationSummaryDto {
  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;
}
