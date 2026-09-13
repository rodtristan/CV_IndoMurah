import { IsString, IsOptional, IsNumber, IsInt, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStockInItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsInt()
  product_id: number;

  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Unit ID' })
  @IsInt()
  unit_id: number;

  @ApiPropertyOptional({ description: 'Unit price' })
  @IsOptional()
  @IsNumber()
  unit_price?: number;
}

export class CreateStockInDto {
  @ApiProperty({ description: 'Warehouse ID' })
  @IsInt()
  warehouse_id: number;

  @ApiPropertyOptional({ description: 'Supplier ID' })
  @IsOptional()
  @IsInt()
  supplier_id?: number;

  @ApiPropertyOptional({ description: 'Reference type' })
  @IsOptional()
  @IsString()
  reference_type?: string;

  @ApiPropertyOptional({ description: 'Reference ID' })
  @IsOptional()
  @IsInt()
  reference_id?: number;

  @ApiPropertyOptional({ description: 'Stock in date' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Stock in items', type: [CreateStockInItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStockInItemDto)
  items: CreateStockInItemDto[];
}

export class UpdateStockInDto {
  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsInt()
  warehouse_id?: number;

  @ApiPropertyOptional({ description: 'Supplier ID' })
  @IsOptional()
  @IsInt()
  supplier_id?: number;

  @ApiPropertyOptional({ description: 'Stock in date' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateStatusDto {
  @ApiProperty({ description: 'New status: confirmed, completed, cancelled' })
  @IsString()
  status: string;
}
