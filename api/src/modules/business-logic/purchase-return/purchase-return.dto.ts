import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  Min,
  IsNotEmpty,
  IsDateString,
} from 'class-validator';

// ─────────────────────────────────────────────────────────────────────────────
// PURCHASE RETURN DTOs - Retur Pembelian
// ─────────────────────────────────────────────────────────────────────────────

export class PurchaseReturnItemDto {
  @ApiProperty({ description: 'Purchase item ID' })
  @IsNumber()
  PurchaseItemId: number;

  @ApiProperty({ description: 'Product ID' })
  @IsNumber()
  ProductId: number;

  @ApiProperty({ description: 'Return Quantity' })
  @IsNumber()
  @Min(0.001)
  Quantity: number;

  @ApiProperty({ description: 'Unit price at purchase time' })
  @IsNumber()
  @Min(0)
  UnitPrice: number;

  @ApiPropertyOptional({ description: 'Return reason' })
  @IsOptional()
  @IsString()
  Reason?: string;

  @ApiPropertyOptional({ description: 'Notes for this item' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class CreatePurchaseReturnDto {
  @ApiProperty({ description: 'Return Date' })
  @IsOptional()
  @IsDateString()
  Date?: string;

  @ApiProperty({ description: 'Purchase ID to return from' })
  @IsNumber()
  PurchaseId: number;

  @ApiProperty({ description: 'Supplier ID' })
  @IsNumber()
  SupplierId: number;

  @ApiPropertyOptional({ description: 'Warehouse ID for returning stock' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @ApiPropertyOptional({ description: 'Return Reference number' })
  @IsOptional()
  @IsString()
  ReferenceNumber?: string;

  @ApiPropertyOptional({ description: 'Return reason' })
  @IsOptional()
  @IsString()
  Reason?: string;

  @ApiPropertyOptional({ description: 'Created by user ID' })
  @IsOptional()
  @IsNumber()
  CreatedById?: number;

  @ApiProperty({ description: 'Return Items', type: [PurchaseReturnItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseReturnItemDto)
  Items: PurchaseReturnItemDto[];

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;

  @ApiPropertyOptional({ description: 'Refund Amount (if cash refund)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  RefundAmount?: number;

  @ApiPropertyOptional({ description: 'Create credit note instead of cash refund' })
  @IsOptional()
  @IsString()
  CreditNoteNumber?: string;
}

export class UpDatePurchaseReturnDto {
  @ApiPropertyOptional({ description: 'Return Date' })
  @IsOptional()
  @IsDateString()
  Date?: string;

  @ApiPropertyOptional({ description: 'Return reason' })
  @IsOptional()
  @IsString()
  Reason?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;

  @ApiPropertyOptional({ description: 'Status: PENDING, APPROVED, COMPLETED, CANCELLED' })
  @IsOptional()
  @IsString()
  Status?: string;
}

export class PurchaseReturnQueryDto {
  @ApiPropertyOptional({ description: 'Search keyword' })
  @IsOptional()
  @IsString()
  Search?: string;

  @ApiPropertyOptional({ description: 'Supplier ID' })
  @IsOptional()
  @IsNumber()
  SupplierId?: number;

  @ApiPropertyOptional({ description: 'Purchase ID' })
  @IsOptional()
  @IsNumber()
  PurchaseId?: number;

  @ApiPropertyOptional({ description: 'Status filter' })
  @IsOptional()
  @IsString()
  Status?: string;

  @ApiPropertyOptional({ description: 'Start Date filter' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date filter' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  Page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  Limit?: number;
}

export class ApprovePurchaseReturnDto {
  @ApiPropertyOptional({ description: 'Approval Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;

  @ApiPropertyOptional({ description: 'Approved by user ID' })
  @IsOptional()
  @IsNumber()
  ApprovedById?: number;
}

export class CancelPurchaseReturnDto {
  @ApiProperty({ description: 'Cancellation reason' })
  @IsString()
  @IsNotEmpty()
  Reason: string;
}
