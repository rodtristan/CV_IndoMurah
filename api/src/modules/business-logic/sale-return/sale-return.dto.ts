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
// SALE RETURN DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class SaleReturnItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNumber()
  ProductId: number;

  @ApiProperty({ description: 'Quantity to return' })
  @IsNumber()
  @Min(0.001)
  Quantity: number;

  @ApiPropertyOptional({ description: 'Unit ID' })
  @IsOptional()
  @IsNumber()
  UnitId?: number;

  @ApiPropertyOptional({ description: 'Unit price at return' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  UnitPrice?: number;

  @ApiPropertyOptional({ description: 'Return reason' })
  @IsOptional()
  @IsString()
  Reason?: string;
}

export class CreateSaleReturnDto {
  @ApiPropertyOptional({ description: 'Return Date' })
  @IsOptional()
  @IsDateString()
  Date?: string;

  @ApiProperty({ description: 'Original Sale ID' })
  @IsNumber()
  SaleId: number;

  @ApiProperty({ description: 'Customer ID' })
  @IsNumber()
  CustomerId: number;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @ApiProperty({ description: 'Return Items', type: [SaleReturnItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleReturnItemDto)
  Items: SaleReturnItemDto[];

  @ApiProperty({ description: 'Return reason' })
  @IsString()
  @IsNotEmpty()
  Reason: string;

  @ApiPropertyOptional({ description: 'Additional Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;

  @ApiPropertyOptional({ description: 'Return payment method (refund method)' })
  @IsOptional()
  @IsNumber()
  RefundMethodId?: number;

  @ApiPropertyOptional({ description: 'Is exchange (tukar barang)' })
  @IsOptional()
  @IsBoolean()
  IsExchange?: boolean;
}

export class SaleReturnFilterDto {
  @ApiPropertyOptional({ description: 'Customer ID filter' })
  @IsOptional()
  @IsNumber()
  CustomerId?: number;

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

  @ApiPropertyOptional({ description: 'Pending approval only' })
  @IsOptional()
  @IsBoolean()
  PendingOnly?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// LOOKUP DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class LookupSaleDto {
  @ApiProperty({ description: 'Search keyword (sale Code or customer Name)' })
  @IsOptional()
  @IsString()
  Search?: string;

  @ApiPropertyOptional({ description: 'Customer ID' })
  @IsOptional()
  @IsNumber()
  CustomerId?: number;

  @ApiPropertyOptional({ description: 'Sales person ID' })
  @IsOptional()
  @IsNumber()
  SalesPersonId?: number;

  @ApiPropertyOptional({ description: 'Start Date filter' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date filter' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;
}

export class GetSaleItemsDto {
  @ApiProperty({ description: 'Sale ID' })
  @IsNumber()
  SaleId: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// APPROVAL DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class ApproveSaleReturnDto {
  @ApiPropertyOptional({ description: 'Approval Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class RejectSaleReturnDto {
  @ApiProperty({ description: 'Rejection reason' })
  @IsString()
  @IsNotEmpty()
  Reason: string;
}
