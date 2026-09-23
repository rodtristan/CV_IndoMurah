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
// PURCHASE ORDER DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class PurchaseOrderItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNumber()
  ProductId: number;

  @ApiProperty({ description: 'Quantity to order' })
  @IsNumber()
  @Min(0.001)
  Quantity: number;

  @ApiProperty({ description: 'Unit ID' })
  @IsNumber()
  UnitId: number;

  @ApiPropertyOptional({ description: 'Expected unit price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  UnitPrice?: number;

  @ApiPropertyOptional({ description: 'Discount percent per item' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  DiscountPercent?: number;

  @ApiPropertyOptional({ description: 'Notes for this item' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class CreatePurchaseOrderDto {
  @ApiPropertyOptional({ description: 'Purchase order Date' })
  @IsOptional()
  @IsDateString()
  Date?: string;

  @ApiProperty({ description: 'Supplier ID' })
  @IsNumber()
  SupplierId: number;

  @ApiPropertyOptional({ description: 'Warehouse ID for receiving' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @ApiPropertyOptional({ description: 'Expected delivery Date' })
  @IsOptional()
  @IsDateString()
  DueDate?: string;

  @ApiPropertyOptional({ description: 'Down payment Amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  DownPayment?: number;

  @ApiProperty({ description: 'Order Items', type: [PurchaseOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  Items: PurchaseOrderItemDto[];

  @ApiPropertyOptional({ description: 'Discount percent for whole order' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  DiscountPercent?: number;

  @ApiPropertyOptional({ description: 'Tax percent' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  TaxPercent?: number;

  @ApiPropertyOptional({ description: 'Order Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class UpdatePurchaseOrderDto {
  @ApiPropertyOptional({ description: 'Expected delivery Date' })
  @IsOptional()
  @IsDateString()
  DueDate?: string;

  @ApiPropertyOptional({ description: 'Down payment Amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  DownPayment?: number;

  @ApiPropertyOptional({ description: 'Discount percent' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  DiscountPercent?: number;

  @ApiPropertyOptional({ description: 'Order Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PURCHASE (PENERIMAAN BARANG) DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class PurchaseReceiveItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNumber()
  ProductId: number;

  @ApiProperty({ description: 'Received Quantity' })
  @IsNumber()
  @Min(0.001)
  Quantity: number;

  @ApiProperty({ description: 'Unit ID' })
  @IsNumber()
  UnitId: number;

  @ApiProperty({ description: 'Unit price' })
  @IsNumber()
  @Min(0)
  UnitPrice: number;

  @ApiPropertyOptional({ description: 'Discount percent' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  DiscountPercent?: number;
}

export class CreatePurchaseDto {
  @ApiPropertyOptional({ description: 'Purchase Date' })
  @IsOptional()
  @IsDateString()
  Date?: string;

  @ApiProperty({ description: 'Supplier ID' })
  @IsNumber()
  SupplierId: number;

  @ApiPropertyOptional({ description: 'Purchase order ID (if from PO)' })
  @IsOptional()
  @IsNumber()
  PurchaseOrderId?: number;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @ApiProperty({ description: 'Received Items', type: [PurchaseReceiveItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseReceiveItemDto)
  Items: PurchaseReceiveItemDto[];

  @ApiPropertyOptional({ description: 'Payment method ID' })
  @IsOptional()
  @IsNumber()
  PaymentMethodId?: number;

  @ApiPropertyOptional({ description: 'Payment Amount (for partial payment)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  PaymentAmount?: number;

  @ApiPropertyOptional({ description: 'Due Date for credit payment' })
  @IsOptional()
  @IsDateString()
  DueDate?: string;

  @ApiPropertyOptional({ description: 'Discount percent for whole purchase' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  DiscountPercent?: number;

  @ApiPropertyOptional({ description: 'Tax percent' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  TaxPercent?: number;

  @ApiPropertyOptional({ description: 'Purchase Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PURCHASE PAYMENT DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class RecordPurchasePaymentDto {
  @ApiProperty({ description: 'Payment Amount' })
  @IsNumber()
  @Min(0.01)
  Amount: number;

  @ApiProperty({ description: 'Payment method ID' })
  @IsNumber()
  PaymentMethodId: number;

  @ApiPropertyOptional({ description: 'Reference number (e.g., transfer slip)' })
  @IsOptional()
  @IsString()
  ReferenceNumber?: string;

  @ApiPropertyOptional({ description: 'Payment Date' })
  @IsOptional()
  @IsDateString()
  PaymentDate?: string;

  @ApiPropertyOptional({ description: 'Payment Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class RecordBulkPurchasePaymentDto {
  @ApiProperty({ description: 'Supplier ID' })
  @IsNumber()
  SupplierId: number;

  @ApiProperty({ description: 'Total payment Amount' })
  @IsNumber()
  @Min(0.01)
  Amount: number;

  @ApiProperty({ description: 'Payment method ID' })
  @IsNumber()
  PaymentMethodId: number;

  @ApiProperty({ description: 'Purchase IDs to pay' })
  @IsArray()
  @IsNumber({}, { each: true })
  PurchaseIds: number[];

  @ApiPropertyOptional({ description: 'Reference number' })
  @IsOptional()
  @IsString()
  ReferenceNumber?: string;

  @ApiPropertyOptional({ description: 'Payment Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PURCHASE RETURN DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class PurchaseReturnItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNumber()
  ProductId: number;

  @ApiProperty({ description: 'Return Quantity' })
  @IsNumber()
  @Min(0.001)
  Quantity: number;

  @ApiProperty({ description: 'Unit ID' })
  @IsNumber()
  UnitId: number;

  @ApiPropertyOptional({ description: 'Unit price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  UnitPrice?: number;
}

export class CreatePurchaseReturnDto {
  @ApiProperty({ description: 'Purchase ID to return from' })
  @IsNumber()
  PurchaseId: number;

  @ApiPropertyOptional({ description: 'Return Date' })
  @IsOptional()
  @IsDateString()
  Date?: string;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @ApiProperty({ description: 'Return Items', type: [PurchaseReturnItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseReturnItemDto)
  Items: PurchaseReturnItemDto[];

  @ApiProperty({ description: 'Return reason' })
  @IsString()
  @IsNotEmpty()
  Reason: string;

  @ApiPropertyOptional({ description: 'Additional Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SUPPLIER DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class SupplierDebtSummaryDto {
  @ApiProperty({ description: 'Supplier ID' })
  @IsNumber()
  SupplierId: number;

  @ApiPropertyOptional({ description: 'Start Date filter' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date filter' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;
}

export class AddSupplierDepositDto {
  @ApiProperty({ description: 'Deposit Amount' })
  @IsNumber()
  @Min(0.01)
  Amount: number;

  @ApiPropertyOptional({ description: 'Deposit Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class PurchaseOrderFilterDto {
  @ApiPropertyOptional({ description: 'Supplier ID filter' })
  @IsOptional()
  @IsNumber()
  SupplierId?: number;

  @ApiPropertyOptional({ description: 'Warehouse ID filter' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @ApiPropertyOptional({ description: 'Status ID filter' })
  @IsOptional()
  @IsNumber()
  StatusId?: number;

  @ApiPropertyOptional({ description: 'Start Date filter' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date filter' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Only pending orders' })
  @IsOptional()
  @IsBoolean()
  PendingOnly?: boolean;
}

export class PurchaseFilterDto {
  @ApiPropertyOptional({ description: 'Supplier ID filter' })
  @IsOptional()
  @IsNumber()
  SupplierId?: number;

  @ApiPropertyOptional({ description: 'Warehouse ID filter' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @ApiPropertyOptional({ description: 'Payment status filter' })
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
