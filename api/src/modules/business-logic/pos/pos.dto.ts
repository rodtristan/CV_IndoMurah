import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  Min,
  IsNotEmpty,
} from 'class-validator';

// ─────────────────────────────────────────────────────────────────────────────
// POS TRANSACTION DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class POSItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNumber()
  productId: number;

  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  @Min(0.001)
  quantity: number;

  @ApiProperty({ description: 'Unit ID' })
  @IsNumber()
  unitId: number;

  @ApiProperty({ description: 'Unit price at sale time' })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ description: 'Discount percent per item' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercent?: number;

  @ApiPropertyOptional({ description: 'Discount amount per item' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({ description: 'Notes for this item' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreatePOSTransactionDto {
  @ApiProperty({ description: 'Transaction date' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ description: 'Customer ID' })
  @IsNumber()
  customerId: number;

  @ApiPropertyOptional({ description: 'Sales person ID' })
  @IsOptional()
  @IsNumber()
  salesPersonId?: number;

  @ApiPropertyOptional({ description: 'Sale point ID' })
  @IsOptional()
  @IsNumber()
  salePointId?: number;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsNumber()
  warehouseId?: number;

  @ApiProperty({ description: 'Payment method ID', type: Number })
  @IsNumber()
  paymentMethodId: number;

  @ApiProperty({ description: 'Transaction items', type: [POSItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => POSItemDto)
  items: POSItemDto[];

  @ApiPropertyOptional({ description: 'Discount percent for whole transaction' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercent?: number;

  @ApiPropertyOptional({ description: 'Discount amount for whole transaction' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({ description: 'Tax percent' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxPercent?: number;

  @ApiProperty({ description: 'Cash amount received from customer' })
  @IsNumber()
  @Min(0)
  cashAmount: number;

  @ApiPropertyOptional({ description: 'Reference number (for non-cash payments)' })
  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @ApiPropertyOptional({ description: 'Transaction notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Use customer deposit' })
  @IsOptional()
  @IsBoolean()
  useCustomerDeposit?: boolean;

  @ApiPropertyOptional({ description: 'Voucher code to apply' })
  @IsOptional()
  @IsString()
  voucherCode?: string;
}

export class BarcodeSearchDto {
  @ApiProperty({ description: 'Barcode value to search' })
  @IsString()
  @IsNotEmpty()
  barcode: string;

  @ApiPropertyOptional({ description: 'Warehouse ID for stock check' })
  @IsOptional()
  @IsNumber()
  warehouseId?: number;
}

export class ProductSearchDto {
  @ApiPropertyOptional({ description: 'Search keyword (name, code, barcode)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Category ID filter' })
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiPropertyOptional({ description: 'Brand ID filter' })
  @IsOptional()
  @IsNumber()
  brandId?: number;

  @ApiPropertyOptional({ description: 'Warehouse ID for stock check' })
  @IsOptional()
  @IsNumber()
  warehouseId?: number;

  @ApiPropertyOptional({ description: 'Only show products with stock > 0' })
  @IsOptional()
  @IsBoolean()
  inStockOnly?: boolean;

  @ApiPropertyOptional({ description: 'Limit results' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}

export class QuickPriceCheckDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNumber()
  productId: number;

  @ApiProperty({ description: 'Customer ID for price group check' })
  @IsNumber()
  customerId: number;

  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class OpenTransactionDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsNumber()
  customerId: number;

  @ApiPropertyOptional({ description: 'Sale point ID' })
  @IsOptional()
  @IsNumber()
  salePointId?: number;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsNumber()
  warehouseId?: number;
}

export class UpdateCartItemDto {
  @ApiProperty({ description: 'New quantity' })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({ description: 'New unit price override' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @ApiPropertyOptional({ description: 'Discount percent' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercent?: number;

  @ApiPropertyOptional({ description: 'Discount amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;
}

export class ApplyVoucherDto {
  @ApiProperty({ description: 'Voucher code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Transaction subtotal before voucher' })
  @IsNumber()
  @Min(0)
  subtotal: number;
}

export class HoldTransactionDto {
  @ApiProperty({ description: 'Hold reference number' })
  @IsString()
  @IsNotEmpty()
  holdNumber: string;

  @ApiProperty({ description: 'Customer name for held transaction' })
  @IsOptional()
  @IsString()
  customerName?: string;
}

export class ResumeTransactionDto {
  @ApiProperty({ description: 'Hold reference number' })
  @IsString()
  @IsNotEmpty()
  holdNumber: string;
}
