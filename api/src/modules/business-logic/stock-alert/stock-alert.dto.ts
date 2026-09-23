import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, IsDateString, Min } from 'class-validator';

export class CreateStockAlertDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNumber()
  ProductId: number;

  @ApiProperty({ description: 'Alert Type ID' })
  @IsNumber()
  AlertTypeId: number;

  @ApiProperty({ description: 'Threshold Quantity' })
  @IsNumber()
  @Min(0)
  Threshold: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class UpDateStockAlertDto {
  @ApiPropertyOptional({ description: 'New threshold' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  Threshold?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class StockAlertFilterDto {
  @ApiPropertyOptional({ description: 'Alert Type ID' })
  @IsOptional()
  @IsNumber()
  AlertTypeId?: number;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsNumber()
  CategoryId?: number;

  @ApiPropertyOptional({ description: 'Show unread only' })
  @IsOptional()
  @IsBoolean()
  UnreadOnly?: boolean;

  @ApiPropertyOptional({ description: 'Show unresolved only' })
  @IsOptional()
  @IsBoolean()
  UnresolvedOnly?: boolean;
}

export class ResolveStockAlertDto {
  @ApiProperty({ description: 'Resolution Notes' })
  @IsString()
  Notes: string;
}

export class BulkResolveAlertDto {
  @ApiProperty({ description: 'Alert IDs to resolve', type: [Number] })
  @IsNumber({}, { each: true })
  AlertIds: number[];

  @ApiPropertyOptional({ description: 'Resolution Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class ReorderStockDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNumber()
  ProductId: number;

  @ApiProperty({ description: 'Suggested reorder Quantity' })
  @IsNumber()
  @Min(1)
  ReorderQuantity: number;

  @ApiProperty({ description: 'Supplier ID' })
  @IsNumber()
  SupplierId: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class StockLevelReportDto {
  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsNumber()
  CategoryId?: number;

  @ApiPropertyOptional({ description: 'Show only low stock' })
  @IsOptional()
  @IsBoolean()
  LowStockOnly?: boolean;

  @ApiPropertyOptional({ description: 'Show only out of stock' })
  @IsOptional()
  @IsBoolean()
  OutOfStockOnly?: boolean;
}

export class AutoReorderSettingDto {
  @ApiProperty({ description: 'Enable auto reorder' })
  @IsBoolean()
  Enabled: boolean;

  @ApiPropertyOptional({ description: 'Default reorder Quantity multiplier (e.g., 2 = reorder 2x minimum)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  ReorderMultiplier?: number;

  @ApiPropertyOptional({ description: 'Preferred supplier ID' })
  @IsOptional()
  @IsNumber()
  PreferredSupplierId?: number;
}
