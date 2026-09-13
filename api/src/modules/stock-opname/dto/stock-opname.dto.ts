import { IsString, IsOptional, IsNumber, IsInt, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StockOpnameItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsInt()
  product_id: number;

  @ApiProperty({ description: 'System stock (from database)' })
  @IsNumber()
  system_stock: number;

  @ApiProperty({ description: 'Counted stock' })
  @IsNumber()
  actual_stock: number;

  @ApiProperty({ description: 'Unit ID' })
  @IsInt()
  unit_id: number;

  @ApiPropertyOptional({ description: 'Price per unit' })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ description: 'Description/Notes' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateStockOpnameDto {
  @ApiProperty({ description: 'Warehouse ID' })
  @IsInt()
  warehouse_id: number;

  @ApiPropertyOptional({ description: 'Stock opname date' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Items', type: [StockOpnameItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockOpnameItemDto)
  items: StockOpnameItemDto[];
}

export class UpdateStockOpnameDto {
  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsInt()
  warehouse_id?: number;

  @ApiPropertyOptional({ description: 'Stock opname date' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class AddStockOpnameItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsInt()
  product_id: number;

  @ApiProperty({ description: 'Counted stock' })
  @IsNumber()
  actual_stock: number;

  @ApiProperty({ description: 'Unit ID' })
  @IsInt()
  unit_id: number;

  @ApiPropertyOptional({ description: 'Price per unit' })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ description: 'Description/Notes' })
  @IsOptional()
  @IsString()
  description?: string;
}
