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
// CASH MANAGEMENT DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class RecordCashInDto {
  @ApiProperty({ description: 'Account ID' })
  @IsNumber()
  AccountId: number;

  @ApiPropertyOptional({ description: 'Cash in Date' })
  @IsOptional()
  @IsDateString()
  Date?: string;

  @ApiProperty({ description: 'Amount' })
  @IsNumber()
  @Min(0)
  Amount: number;

  @ApiProperty({ description: 'Description' })
  @IsString()
  @IsNotEmpty()
  Description: string;

  @ApiPropertyOptional({ description: 'Reference Type (e.g., SALE, DEPOSIT)' })
  @IsOptional()
  @IsString()
  ReferenceType?: string;

  @ApiPropertyOptional({ description: 'Reference ID' })
  @IsOptional()
  @IsNumber()
  ReferenceId?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class RecordCashOutDto {
  @ApiProperty({ description: 'Account ID' })
  @IsNumber()
  AccountId: number;

  @ApiPropertyOptional({ description: 'Cash out Date' })
  @IsOptional()
  @IsDateString()
  Date?: string;

  @ApiProperty({ description: 'Amount' })
  @IsNumber()
  @Min(0)
  Amount: number;

  @ApiProperty({ description: 'Description' })
  @IsString()
  @IsNotEmpty()
  Description: string;

  @ApiPropertyOptional({ description: 'Reference Type (e.g., EXPENSE, PURCHASE)' })
  @IsOptional()
  @IsString()
  ReferenceType?: string;

  @ApiPropertyOptional({ description: 'Reference ID' })
  @IsOptional()
  @IsNumber()
  ReferenceId?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class TransferCashDto {
  @ApiProperty({ description: 'From account ID' })
  @IsNumber()
  FromAccountId: number;

  @ApiProperty({ description: 'To account ID' })
  @IsNumber()
  ToAccountId: number;

  @ApiPropertyOptional({ description: 'Transfer Date' })
  @IsOptional()
  @IsDateString()
  Date?: string;

  @ApiProperty({ description: 'Amount' })
  @IsNumber()
  @Min(0)
  Amount: number;

  @ApiProperty({ description: 'Description' })
  @IsString()
  @IsNotEmpty()
  Description: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class CashFlowFilterDto {
  @ApiPropertyOptional({ description: 'Account ID' })
  @IsOptional()
  @IsNumber()
  AccountId?: number;

  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Reference Type filter' })
  @IsOptional()
  @IsString()
  ReferenceType?: string;

  @ApiPropertyOptional({ description: 'Limit results' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  Limit?: number;
}

export class CashBalanceDto {
  @ApiPropertyOptional({ description: 'Account ID' })
  @IsOptional()
  @IsNumber()
  AccountId?: number;

  @ApiPropertyOptional({ description: 'As of Date' })
  @IsOptional()
  @IsDateString()
  AsOfDate?: string;
}

export class CashSummaryDto {
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
