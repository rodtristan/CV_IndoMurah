import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  Min,
  IsNotEmpty,
} from 'class-validator';

export class CreateLoanDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsNumber()
  EmployeeId: number;

  @ApiProperty({ description: 'Loan Type ID' })
  @IsNumber()
  LoanTypeId: number;

  @ApiProperty({ description: 'Principal Amount' })
  @IsNumber()
  @Min(1)
  PrincipalAmount: number;

  @ApiPropertyOptional({ description: 'Interest rate (percentage)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  InterestRate?: number;

  @ApiProperty({ description: 'Tenor in months' })
  @IsNumber()
  @Min(1)
  TenorMonths: number;

  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class UpDateLoanDto {
  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class RecordInstallmentDto {
  @ApiProperty({ description: 'Loan ID' })
  @IsNumber()
  LoanId: number;

  @ApiProperty({ description: 'Installment Amount' })
  @IsNumber()
  @Min(0.01)
  Amount: number;

  @ApiPropertyOptional({ description: 'Payment Date' })
  @IsOptional()
  @IsDateString()
  PaymentDate?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class LoanFilterDto {
  @ApiPropertyOptional({ description: 'Employee ID' })
  @IsOptional()
  @IsNumber()
  EmployeeId?: number;

  @ApiPropertyOptional({ description: 'Loan Type ID' })
  @IsOptional()
  @IsNumber()
  LoanTypeId?: number;

  @ApiPropertyOptional({ description: 'Status ID' })
  @IsOptional()
  @IsNumber()
  StatusId?: number;

  @ApiPropertyOptional({ description: 'Show only active loans' })
  @IsOptional()
  @IsBoolean()
  ActiveOnly?: boolean;

  @ApiPropertyOptional({ description: 'Page number' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  Page?: number;

  @ApiPropertyOptional({ description: 'Page size' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  Limit?: number;
}

export class LoanSummaryDto {
  @ApiPropertyOptional({ description: 'Employee ID (optional)' })
  @IsOptional()
  @IsNumber()
  EmployeeId?: number;
}
