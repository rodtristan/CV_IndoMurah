import { IsString, IsOptional, IsNumber, IsInt, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSaleReturnItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsInt()
  product_id: number;

  @ApiProperty({ description: 'Quantity to return' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Unit ID' })
  @IsInt()
  unit_id: number;

  @ApiProperty({ description: 'Unit price' })
  @IsNumber()
  unit_price: number;

  @ApiPropertyOptional({ description: 'Subtotal' })
  @IsOptional()
  @IsNumber()
  subtotal?: number;
}

export class CreateSaleReturnDto {
  @ApiProperty({ description: 'Sale ID' })
  @IsInt()
  sale_id: number;

  @ApiPropertyOptional({ description: 'Customer ID (auto-filled from sale)' })
  @IsOptional()
  @IsInt()
  customer_id?: number;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsInt()
  warehouse_id?: number;

  @ApiPropertyOptional({ description: 'Return date' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ description: 'Return reason' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ description: 'Return items', type: [CreateSaleReturnItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleReturnItemDto)
  items: CreateSaleReturnItemDto[];
}

export class UpdateSaleReturnDto {
  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsInt()
  warehouse_id?: number;

  @ApiPropertyOptional({ description: 'Return date' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ description: 'Return reason' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateStatusDto {
  @ApiProperty({ description: 'New status: confirmed, completed, cancelled' })
  @IsString()
  status: string;
}
