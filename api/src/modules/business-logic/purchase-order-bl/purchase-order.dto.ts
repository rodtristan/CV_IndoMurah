import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsNumber, IsOptional, IsString, ValidateNested, Min } from 'class-validator';

export class PurchaseOrderItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNumber()
  ProductId: number;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @ApiPropertyOptional({ description: 'Unit ID' })
  @IsOptional()
  @IsNumber()
  UnitId?: number;

  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  @Min(0.0001)
  Quantity: number;

  @ApiProperty({ description: 'Unit price' })
  @IsNumber()
  @Min(0)
  Price: number;

  @ApiPropertyOptional({ description: 'Discount percent' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  DiscountPercent?: number;

  @ApiPropertyOptional({ description: 'Tax percent' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  TaxPercent?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class CreatePurchaseOrderDto {
  @ApiProperty({ description: 'Supplier ID' })
  @IsNumber()
  SupplierId: number;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @ApiPropertyOptional({ description: 'Order Date' })
  @IsOptional()
  @IsDateString()
  OrderDate?: string;

  @ApiPropertyOptional({ description: 'Expected delivery Date' })
  @IsOptional()
  @IsDateString()
  ExpectedDate?: string;

  @ApiPropertyOptional({ description: 'Down payment Amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  DownPayment?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;

  @ApiProperty({ description: 'Order Items', type: [PurchaseOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  Items: PurchaseOrderItemDto[];
}

export class PurchaseOrderFilterDto {
  @ApiPropertyOptional({ description: 'Supplier ID filter' })
  @IsOptional()
  @IsNumber()
  SupplierId?: number;

  @ApiPropertyOptional({ description: 'Warehouse ID filter' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @ApiPropertyOptional({ description: 'Status filter: PENDING, APPROVED, RECEIVED, CANCELLED' })
  @IsOptional()
  @IsString()
  Status?: string;

  @ApiPropertyOptional({ description: 'Payment status filter: UNPAID, PARTIAL, PAID' })
  @IsOptional()
  @IsString()
  PaymentStatus?: string;

  @ApiPropertyOptional({ description: 'Start Date filter' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date filter' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;
}
