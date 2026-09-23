import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
  IsNotEmpty,
  IsDateString,
  IsBoolean,
} from 'class-validator';

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMER DEPOSIT DTOs - Deposit/Titipan Pelanggan
// ─────────────────────────────────────────────────────────────────────────────

export class CreateCustomerDepositDto {
  @ApiProperty({ description: 'Deposit Date' })
  @IsOptional()
  @IsDateString()
  Date?: string;

  @ApiProperty({ description: 'Customer ID' })
  @IsNumber()
  CustomerId: number;

  @ApiProperty({ description: 'Deposit Amount', example: 500000 })
  @IsNumber()
  @Min(0.01)
  Amount: number;

  @ApiProperty({ description: 'Payment method ID' })
  @IsNumber()
  PaymentMethodId: number;

  @ApiPropertyOptional({ description: 'Reference number (receipt, transfer proof, etc)' })
  @IsOptional()
  @IsString()
  ReferenceNumber?: string;

  @ApiPropertyOptional({ description: 'Deposit Type: DEPOSIT (default), TOPUP, WITHDRAWAL' })
  @IsOptional()
  @IsString()
  Type?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;

  @ApiPropertyOptional({ description: 'Created by user ID' })
  @IsOptional()
  @IsNumber()
  CreatedById?: number;
}

export class UpdateCustomerDepositDto {
  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class CustomerDepositQueryDto {
  @ApiPropertyOptional({ description: 'Search keyword (Code, Reference)' })
  @IsOptional()
  @IsString()
  Search?: string;

  @ApiPropertyOptional({ description: 'Customer ID' })
  @IsOptional()
  @IsNumber()
  CustomerId?: number;

  @ApiPropertyOptional({ description: 'Type: DEPOSIT, TOPUP, WITHDRAWAL, USED' })
  @IsOptional()
  @IsString()
  Type?: string;

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

export class UseCustomerDepositDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsNumber()
  CustomerId: number;

  @ApiProperty({ description: 'Amount to use from deposit' })
  @IsNumber()
  @Min(0.01)
  Amount: number;

  @ApiProperty({ description: 'Sale ID or Reference' })
  @IsNumber()
  SaleId: number;

  @ApiPropertyOptional({ description: 'Reference number' })
  @IsOptional()
  @IsString()
  ReferenceNumber?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;

  @ApiPropertyOptional({ description: 'Created by user ID' })
  @IsOptional()
  @IsNumber()
  CreatedById?: number;
}

export class CustomerDepositSummaryDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsNumber()
  CustomerId: number;
}
