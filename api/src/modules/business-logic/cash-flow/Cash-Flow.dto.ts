import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNumber, IsDateString, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';

// ─────────────────────────────────────────────────────────────────────────────
// CASH FLOW CATEGORY
// ─────────────────────────────────────────────────────────────────────────────

export class CreateCashFlowCategoryDto {
  @ApiProperty({ description: 'Category Name', example: 'Penjualan Tunai' })
  @IsString()
  Name: string;

  @ApiProperty({ description: 'Type: INFLOW or OUTFLOW', example: 'INFLOW' })
  @IsString()
  Type: 'INFLOW' | 'OUTFLOW';

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;

  @ApiPropertyOptional({ description: 'Color for UI', example: '#4CAF50' })
  @IsOptional()
  @IsString()
  Color?: string;
}

export class UpdateCashFlowCategoryDto {
  @ApiPropertyOptional({ description: 'Category Name' })
  @IsOptional()
  @IsString()
  Name?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;

  @ApiPropertyOptional({ description: 'Color for UI' })
  @IsOptional()
  @IsString()
  Color?: string;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// CASH FLOW TRANSACTION
// ─────────────────────────────────────────────────────────────────────────────

export class CashFlowTransactionItemDto {
  @ApiProperty({ description: 'Account ID' })
  @IsNumber()
  AccountId: number;

  @ApiProperty({ description: 'Amount' })
  @IsNumber()
  Amount: number;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;
}

export class CreateCashFlowTransactionDto {
  @ApiProperty({ description: 'Cash flow category ID' })
  @IsNumber()
  CategoryId: number;

  @ApiProperty({ description: 'Account ID (cash/bank account)' })
  @IsNumber()
  AccountId: number;

  @ApiProperty({ description: 'Transaction Date' })
  @IsDateString()
  TransactionDate: string;

  @ApiProperty({ description: 'Amount' })
  @IsNumber()
  Amount: number;

  @ApiPropertyOptional({ description: 'Reference number' })
  @IsOptional()
  @IsString()
  ReferenceNumber?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;

  @ApiPropertyOptional({ description: 'Linked sale ID' })
  @IsOptional()
  @IsNumber()
  SaleId?: number;

  @ApiPropertyOptional({ description: 'Linked purchase ID' })
  @IsOptional()
  @IsNumber()
  PurchaseId?: number;

  @ApiPropertyOptional({ description: 'Linked expense ID' })
  @IsOptional()
  @IsNumber()
  ExpenseId?: number;
}

export class BulkCashFlowTransactionDto {
  @ApiProperty({ description: 'Transaction Date' })
  @IsDateString()
  TransactionDate: string;

  @ApiProperty({ description: 'Account ID' })
  @IsNumber()
  AccountId: number;

  @ApiProperty({ description: 'Transactions to create', type: [CreateCashFlowTransactionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCashFlowTransactionDto)
  Transactions: CreateCashFlowTransactionDto[];
}

export class UpdateCashFlowTransactionDto {
  @ApiPropertyOptional({ description: 'Reference number' })
  @IsOptional()
  @IsString()
  ReferenceNumber?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;
}

export class CashFlowFilterDto {
  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsNumber()
  CategoryId?: number;

  @ApiPropertyOptional({ description: 'Account ID' })
  @IsOptional()
  @IsNumber()
  AccountId?: number;

  @ApiPropertyOptional({ description: 'Type: INFLOW or OUTFLOW' })
  @IsOptional()
  @IsString()
  Type?: 'INFLOW' | 'OUTFLOW';

  @ApiPropertyOptional({ description: 'Search by Code or Reference' })
  @IsOptional()
  @IsString()
  Search?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CASH FLOW REPORTS
// ─────────────────────────────────────────────────────────────────────────────

export class CashFlowReportDto {
  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Account ID' })
  @IsOptional()
  @IsNumber()
  AccountId?: number;

  @ApiPropertyOptional({ description: 'Group by: day, week, month, category' })
  @IsOptional()
  @IsString()
  GroupBy?: 'day' | 'week' | 'month' | 'category';
}

export class CashFlowSummaryDto {
  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Account ID' })
  @IsOptional()
  @IsNumber()
  AccountId?: number;
}

export class CashFlowProjectionDto {
  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Account ID' })
  @IsOptional()
  @IsNumber()
  AccountId?: number;
}
