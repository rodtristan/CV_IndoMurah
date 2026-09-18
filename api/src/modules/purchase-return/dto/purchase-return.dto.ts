import { IsString, IsOptional, IsNumber, IsInt, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePurchaseReturnItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsInt()
  ProductID: number;

  @ApiProperty({ description: 'Quantity to return' })
  @IsNumber()
  Quantity: number;

  @ApiProperty({ description: 'Unit ID' })
  @IsInt()
  UnitID: number;

  @ApiProperty({ description: 'Unit price' })
  @IsNumber()
  UnitPrice: number;
}

export class CreatePurchaseReturnDto {
  @ApiProperty({ description: 'Purchase ID' })
  @IsInt()
  PurchaseID: number;

  @ApiPropertyOptional({ description: 'Supplier ID (auto-filled from purchase)' })
  @IsOptional()
  @IsInt()
  SupplierID?: number;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsInt()
  WarehouseID?: number;

  @ApiPropertyOptional({ description: 'Return date' })
  @IsOptional()
  @IsDateString()
  Date?: string;

  @ApiPropertyOptional({ description: 'Return reason' })
  @IsOptional()
  @IsString()
  Reason?: string;

  @ApiProperty({ description: 'Return items', type: [CreatePurchaseReturnItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseReturnItemDto)
  Items: CreatePurchaseReturnItemDto[];
}

export class UpdatePurchaseReturnDto {
  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsInt()
  WarehouseID?: number;

  @ApiPropertyOptional({ description: 'Return date' })
  @IsOptional()
  @IsDateString()
  Date?: string;

  @ApiPropertyOptional({ description: 'Return reason' })
  @IsOptional()
  @IsString()
  Reason?: string;

  @ApiPropertyOptional({ description: 'Status ID' })
  @IsOptional()
  @IsInt()
  StatusID?: number;
}

export class UpdatePurchaseReturnStatusDto {
  @ApiProperty({ description: 'New status code: DRAFT, CONFIRMED, COMPLETED, CANCELLED' })
  @IsString()
  StatusCode: string;
}
