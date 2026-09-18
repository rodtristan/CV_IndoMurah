import { IsString, IsOptional, IsNumber, IsInt, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSaleItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsInt()
  ProductID: number;

  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  Quantity: number;

  @ApiProperty({ description: 'Unit ID' })
  @IsInt()
  UnitID: number;

  @ApiProperty({ description: 'Unit price' })
  @IsNumber()
  UnitPrice: number;

  @ApiPropertyOptional({ description: 'Discount percent' })
  @IsOptional()
  @IsNumber()
  DiscountPercent?: number;

  @ApiPropertyOptional({ description: 'Discount amount' })
  @IsOptional()
  @IsNumber()
  DiscountAmount?: number;
}

export class CreateSaleDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsInt()
  CustomerID: number;

  @ApiPropertyOptional({ description: 'Sales person ID' })
  @IsOptional()
  @IsInt()
  SalesPersonID?: number;

  @ApiPropertyOptional({ description: 'Sale point ID' })
  @IsOptional()
  @IsInt()
  SalePointID?: number;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsInt()
  WarehouseID?: number;

  @ApiPropertyOptional({ description: 'Sale date', type: String })
  @IsOptional()
  @IsString()
  Date?: string;

  @ApiPropertyOptional({ description: 'Due date for credit sales', type: String })
  @IsOptional()
  @IsString()
  DueDate?: string;

  @ApiPropertyOptional({ description: 'Discount percent' })
  @IsOptional()
  @IsNumber()
  DiscountPercent?: number;

  @ApiPropertyOptional({ description: 'Discount amount' })
  @IsOptional()
  @IsNumber()
  DiscountAmount?: number;

  @ApiPropertyOptional({ description: 'Tax percent' })
  @IsOptional()
  @IsNumber()
  TaxPercent?: number;

  @ApiPropertyOptional({ description: 'Payment method ID' })
  @IsOptional()
  @IsInt()
  PaymentMethodID?: number;

  @ApiPropertyOptional({ description: 'Cash amount received (for cash payments)' })
  @IsOptional()
  @IsNumber()
  CashAmount?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;

  @ApiProperty({ description: 'Sale items', type: [CreateSaleItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  Items: CreateSaleItemDto[];
}

export class UpdateSaleDto {
  @ApiPropertyOptional({ description: 'Customer ID' })
  @IsOptional()
  @IsInt()
  CustomerID?: number;

  @ApiPropertyOptional({ description: 'Sales person ID' })
  @IsOptional()
  @IsInt()
  SalesPersonID?: number;

  @ApiPropertyOptional({ description: 'Sale point ID' })
  @IsOptional()
  @IsInt()
  SalePointID?: number;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsInt()
  WarehouseID?: number;

  @ApiPropertyOptional({ description: 'Sale date', type: String })
  @IsOptional()
  @IsString()
  Date?: string;

  @ApiPropertyOptional({ description: 'Due date', type: String })
  @IsOptional()
  @IsString()
  DueDate?: string;

  @ApiPropertyOptional({ description: 'Discount percent' })
  @IsOptional()
  @IsNumber()
  DiscountPercent?: number;

  @ApiPropertyOptional({ description: 'Discount amount' })
  @IsOptional()
  @IsNumber()
  DiscountAmount?: number;

  @ApiPropertyOptional({ description: 'Tax percent' })
  @IsOptional()
  @IsNumber()
  TaxPercent?: number;

  @ApiPropertyOptional({ description: 'Payment method ID' })
  @IsOptional()
  @IsInt()
  PaymentMethodID?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class PaymentDto {
  @ApiProperty({ description: 'Payment amount' })
  @IsNumber()
  Amount: number;

  @ApiPropertyOptional({ description: 'Payment method ID' })
  @IsOptional()
  @IsInt()
  PaymentMethodID?: number;

  @ApiPropertyOptional({ description: 'Reference number' })
  @IsOptional()
  @IsString()
  ReferenceNumber?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class UpdateStatusDto {
  @ApiProperty({ description: 'Payment status code (e.g., PENDING, PARTIAL, PAID, CANCELLED)' })
  @IsString()
  PaymentStatusCode: string;
}
