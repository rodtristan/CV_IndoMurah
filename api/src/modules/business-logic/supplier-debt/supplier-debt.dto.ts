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
// SUPPLIER DEBT MANAGEMENT DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class SupplierDebtOverviewDto {
  @ApiPropertyOptional({ description: 'Supplier ID' })
  @IsOptional()
  @IsNumber()
  SupplierId?: number;

  @ApiPropertyOptional({ description: 'Status filter (ACTIVE, OVERDUE, PAID, ALL)' })
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
}

export class SupplierDebtDetailDto {
  @ApiProperty({ description: 'Supplier ID' })
  @IsNumber()
  SupplierId: number;

  @ApiPropertyOptional({ description: 'Include fully paid purchases' })
  @IsOptional()
  @IsBoolean()
  IncludePaid?: boolean;
}

export class RecordSupplierPaymentDto {
  @ApiProperty({ description: 'Supplier ID' })
  @IsNumber()
  SupplierId: number;

  @ApiProperty({ description: 'Amount to pay' })
  @IsNumber()
  @Min(1)
  Amount: number;

  @ApiProperty({ description: 'Payment method ID' })
  @IsNumber()
  PaymentMethodId: number;

  @ApiPropertyOptional({ description: 'Purchase IDs to pay (leave empty to pay oldest first)' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  PurchaseIds?: number[];

  @ApiPropertyOptional({ description: 'Reference number' })
  @IsOptional()
  @IsString()
  ReferenceNumber?: string;

  @ApiPropertyOptional({ description: 'Payment Date' })
  @IsOptional()
  @IsDateString()
  PaymentDate?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class BulkSupplierPaymentDto {
  @ApiProperty({ description: 'Supplier ID' })
  @IsNumber()
  SupplierId: number;

  @ApiProperty({ description: 'Total payment Amount' })
  @IsNumber()
  @Min(1)
  Amount: number;

  @ApiProperty({ description: 'Payment method ID' })
  @IsNumber()
  PaymentMethodId: number;

  @ApiPropertyOptional({ description: 'Reference number' })
  @IsOptional()
  @IsString()
  ReferenceNumber?: string;

  @ApiPropertyOptional({ description: 'Payment Date' })
  @IsOptional()
  @IsDateString()
  PaymentDate?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class AddSupplierDepositDto {
  @ApiProperty({ description: 'Supplier ID' })
  @IsNumber()
  SupplierId: number;

  @ApiProperty({ description: 'Deposit Amount' })
  @IsNumber()
  @Min(1)
  Amount: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class UseSupplierDepositDto {
  @ApiProperty({ description: 'Purchase ID to use deposit for' })
  @IsNumber()
  PurchaseId: number;

  @ApiProperty({ description: 'Amount to use from deposit' })
  @IsNumber()
  @Min(1)
  Amount: number;
}

export class SupplierDebtAgingDto {
  @ApiPropertyOptional({ description: 'As of Date' })
  @IsOptional()
  @IsDateString()
  AsOfDate?: string;

  @ApiPropertyOptional({ description: 'Supplier group filter' })
  @IsOptional()
  @IsNumber()
  SupplierGroupId?: number;
}

export class SupplierDebtReportDto {
  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Supplier ID' })
  @IsOptional()
  @IsNumber()
  SupplierId?: number;
}
