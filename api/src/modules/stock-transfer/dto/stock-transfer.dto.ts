import { IsString, IsOptional, IsNumber, IsInt, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStockTransferItemDto {
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

export class CreateStockTransferDto {
  @ApiProperty({ description: 'From warehouse ID' })
  @IsInt()
  from_warehouse_id: number;

  @ApiProperty({ description: 'To warehouse ID' })
  @IsInt()
  to_warehouse_id: number;

  @ApiPropertyOptional({ description: 'Transfer date' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Transfer items', type: [CreateStockTransferItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStockTransferItemDto)
  items: CreateStockTransferItemDto[];
}

export class UpdateStockTransferDto {
  @ApiPropertyOptional({ description: 'From warehouse ID' })
  @IsOptional()
  @IsInt()
  from_warehouse_id?: number;

  @ApiPropertyOptional({ description: 'To warehouse ID' })
  @IsOptional()
  @IsInt()
  to_warehouse_id?: number;

  @ApiPropertyOptional({ description: 'Transfer date' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateStatusDto {
  @ApiProperty({ description: 'New status: confirmed, completed, cancelled' })
  @IsString()
  status: string;
}
