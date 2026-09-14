import { IsString, IsOptional, IsNumber, IsInt, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePurchaseReturnItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsInt()
  productId: number;

  @ApiProperty({ description: 'Quantity to return' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Unit ID' })
  @IsInt()
  unitId: number;

  @ApiProperty({ description: 'Unit price' })
  @IsNumber()
  unitPrice: number;
}

export class CreatePurchaseReturnDto {
  @ApiProperty({ description: 'Purchase ID' })
  @IsInt()
  purchaseId: number;

  @ApiPropertyOptional({ description: 'Supplier ID (auto-filled from purchase)' })
  @IsOptional()
  @IsInt()
  supplierId?: number;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsInt()
  warehouseId?: number;

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
  warehouseId?: number;

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
  @ApiProperty({ description: 'New status: DRAFT, CONFIRMED, COMPLETED, CANCELLED' })
  @IsString()
  status: string;
}
