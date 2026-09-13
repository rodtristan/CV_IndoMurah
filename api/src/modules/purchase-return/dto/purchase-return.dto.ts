import { IsString, IsOptional, IsNumber, IsInt, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePurchaseReturnItemDto {
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
}

export class CreatePurchaseReturnDto {
  @ApiProperty({ description: 'Purchase ID' })
  @IsInt()
  purchase_id: number;

  @ApiPropertyOptional({ description: 'Supplier ID (auto-filled from purchase)' })
  @IsOptional()
  @IsInt()
  supplier_id?: number;

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

  @ApiProperty({ description: 'Return items', type: [CreatePurchaseReturnItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseReturnItemDto)
  items: CreatePurchaseReturnItemDto[];
}

export class UpdatePurchaseReturnDto {
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
