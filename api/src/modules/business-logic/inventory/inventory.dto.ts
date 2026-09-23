import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString, Min, IsArray, ValidateNested } from 'class-validator';

export class StockTransferItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNumber()
  ProductId: number;

  @ApiProperty({ description: 'Quantity to transfer' })
  @IsNumber()
  @Min(0.001)
  Quantity: number;
}

export class StockTransferDto {
  @ApiProperty({ description: 'From warehouse ID' })
  @IsNumber()
  FromWarehouseId: number;

  @ApiProperty({ description: 'To warehouse ID' })
  @IsNumber()
  ToWarehouseId: number;

  @ApiProperty({ description: 'Items to transfer', type: [StockTransferItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockTransferItemDto)
  TransferItems: StockTransferItemDto[];
}

export class StockAdjustmentItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNumber()
  ProductId: number;

  @ApiProperty({ description: 'Quantity (positive for add, negative for reduce)' })
  @IsNumber()
  Quantity: number;

  @ApiPropertyOptional({ description: 'Unit price for valuation' })
  @IsOptional()
  @IsNumber()
  UnitPrice?: number;
}

export class StockAdjustmentDto {
  @ApiProperty({ description: 'Warehouse ID' })
  @IsNumber()
  WarehouseId: number;

  @ApiProperty({ description: 'Adjustment type (STOCK_IN, STOCK_OUT, CORRECTION)' })
  @IsString()
  AdjustmentType: string;

  @ApiProperty({ description: 'Reference Type (e.g., PURCHASE, SALE, DAMAGE, EXPIRED)' })
  @IsOptional()
  @IsString()
  ReferenceType?: string;

  @ApiPropertyOptional({ description: 'Reference ID' })
  @IsOptional()
  @IsNumber()
  ReferenceId?: number;

  @ApiProperty({ description: 'Adjustment Notes/reason' })
  @IsString()
  Notes: string;

  @ApiProperty({ description: 'Items to adjust', type: [StockAdjustmentItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockAdjustmentItemDto)
  AdjustmentItems: StockAdjustmentItemDto[];
}

export class StockOpNameItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNumber()
  ProductId: number;

  @ApiProperty({ description: 'System stock (expected)' })
  @IsNumber()
  SystemStock: number;

  @ApiProperty({ description: 'Actual stock counted' })
  @IsNumber()
  CountedStock: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class StockOpNameDto {
  @ApiProperty({ description: 'Warehouse ID' })
  @IsNumber()
  WarehouseId: number;

  @ApiPropertyOptional({ description: 'OpName Date' })
  @IsOptional()
  @IsDateString()
  OpNameDate?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;

  @ApiProperty({ description: 'Items counted during opName', type: [StockOpNameItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockOpNameItemDto)
  OpNameItems: StockOpNameItemDto[];
}

export class StockReportDto {
  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

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

export class ValuationReportDto {
  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsNumber()
  CategoryId?: number;

  @ApiPropertyOptional({ description: 'Valuation method (FIFO, AVERAGE, LIFO)' })
  @IsOptional()
  @IsString()
  ValuationMethod?: string;
}
