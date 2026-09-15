import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLoanInstallmentDto {
  @ApiProperty({ description: 'loanId' })
  @IsNumber()
  loanId: number;

  @ApiProperty({ description: 'period' })
  @IsString()
  period: string;

  @ApiProperty({ description: 'amount' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'principal' })
  @IsNumber()
  principal: number;

  @ApiProperty({ description: 'interest' })
  @IsNumber()
  interest: number;

  @ApiProperty({ description: 'remainingBefore' })
  @IsNumber()
  remainingBefore: number;

  @ApiProperty({ description: 'remainingAfter' })
  @IsNumber()
  remainingAfter: number;

  @ApiProperty({ description: 'paymentDate' })
  paymentDate: Date;

  @ApiProperty({ description: 'status' })
  @IsString()
  status: string;

  @ApiProperty({ description: 'isActive' })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ description: 'loan' })
  loan: any;

}

export class UpdateLoanInstallmentDto {
  @ApiPropertyOptional({ description: 'loanId' })
  @IsOptional()
  @IsNumber()
  loanId?: number;

  @ApiPropertyOptional({ description: 'period' })
  @IsOptional()
  @IsString()
  period?: string;

  @ApiPropertyOptional({ description: 'amount' })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ description: 'principal' })
  @IsOptional()
  @IsNumber()
  principal?: number;

  @ApiPropertyOptional({ description: 'interest' })
  @IsOptional()
  @IsNumber()
  interest?: number;

  @ApiPropertyOptional({ description: 'remainingBefore' })
  @IsOptional()
  @IsNumber()
  remainingBefore?: number;

  @ApiPropertyOptional({ description: 'remainingAfter' })
  @IsOptional()
  @IsNumber()
  remainingAfter?: number;

  @ApiPropertyOptional({ description: 'paymentDate' })
  @IsOptional()
  paymentDate?: Date;

  @ApiPropertyOptional({ description: 'status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'isActive' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'loan' })
  @IsOptional()
  loan?: any;

}

export class LoanInstallmentResponseDto {
  @ApiProperty({ description: 'loanId' })
  loanId: number;

  @ApiProperty({ description: 'period' })
  period: string;

  @ApiProperty({ description: 'amount' })
  amount: number;

  @ApiProperty({ description: 'principal' })
  principal: number;

  @ApiProperty({ description: 'interest' })
  interest: number;

  @ApiProperty({ description: 'remainingBefore' })
  remainingBefore: number;

  @ApiProperty({ description: 'remainingAfter' })
  remainingAfter: number;

  @ApiProperty({ description: 'paymentDate' })
  paymentDate: Date;

  @ApiProperty({ description: 'status' })
  status: string;

  @ApiProperty({ description: 'isActive' })
  isActive: boolean;

  @ApiProperty({ description: 'loan' })
  loan: any;

}

export class QueryLoanInstallmentDto {
  @ApiPropertyOptional({ description: 'Fields to select' })
  @IsOptional()
  @IsString()
  $select?: string;

  @ApiPropertyOptional({ description: 'Relations to include' })
  @IsOptional()
  @IsString()
  $include?: string;

  @ApiPropertyOptional({ description: 'Number of records to skip' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  $skip?: number;

  @ApiPropertyOptional({ description: 'Number of records to take' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  $take?: number;

  @ApiPropertyOptional({ description: 'Search keyword' })
  @IsOptional()
  @IsString()
  $search?: string;
}
