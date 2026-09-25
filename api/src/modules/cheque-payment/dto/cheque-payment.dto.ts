import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDateString, IsBoolean, Min } from 'class-validator';

export class CreateChequePaymentDto {
  @ApiProperty({ description: 'Type: SALE or PURCHASE' })
  @IsString()
  Type: string;

  @ApiPropertyOptional({ description: 'Reference type: SALE_PAYMENT, PURCHASE_PAYMENT' })
  @IsOptional()
  @IsString()
  ReferenceType?: string;

  @ApiPropertyOptional({ description: 'Reference ID' })
  @IsOptional()
  @IsNumber()
  ReferenceId?: number;

  @ApiPropertyOptional({ description: 'Bank ID' })
  @IsOptional()
  @IsNumber()
  BankId?: number;

  @ApiProperty({ description: 'Cheque number' })
  @IsString()
  ChequeNumber: string;

  @ApiProperty({ description: 'Cheque date' })
  @IsDateString()
  ChequeDate: string;

  @ApiPropertyOptional({ description: 'Due date' })
  @IsOptional()
  @IsDateString()
  DueDate?: string;

  @ApiProperty({ description: 'Amount' })
  @IsNumber()
  @Min(0.01)
  Amount: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class UpdateChequePaymentDto {
  @ApiPropertyOptional({ description: 'Bank ID' })
  @IsOptional()
  @IsNumber()
  BankId?: number;

  @ApiPropertyOptional({ description: 'Cheque number' })
  @IsOptional()
  @IsString()
  ChequeNumber?: string;

  @ApiPropertyOptional({ description: 'Due date' })
  @IsOptional()
  @IsDateString()
  DueDate?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class ClearChequeDto {
  @ApiPropertyOptional({ description: 'Cleared date (default: today)' })
  @IsOptional()
  @IsDateString()
  ClearedDate?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class BounceChequeDto {
  @ApiPropertyOptional({ description: 'Bounced date (default: today)' })
  @IsOptional()
  @IsDateString()
  BouncedDate?: string;

  @ApiProperty({ description: 'Reason for bouncing' })
  @IsString()
  Reason: string;
}

export class ChequePaymentFilterDto {
  @ApiPropertyOptional({ description: 'Type: SALE, PURCHASE' })
  @IsOptional()
  @IsString()
  Type?: string;

  @ApiPropertyOptional({ description: 'Status: PENDING, CLEARED, BOUNCED, CANCELLED' })
  @IsOptional()
  @IsString()
  Status?: string;

  @ApiPropertyOptional({ description: 'Bank ID' })
  @IsOptional()
  @IsNumber()
  BankId?: number;

  @ApiPropertyOptional({ description: 'Start date filter' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End date filter' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Search: cheque number' })
  @IsOptional()
  @IsString()
  Search?: string;
}
