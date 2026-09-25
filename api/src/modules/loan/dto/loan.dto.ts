import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString, IsInt, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLoanDto {
  @ApiProperty({ description: 'code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'employeeId' })
  @IsNumber()
  employeeId: number;

  @ApiProperty({ description: 'LoanType ID' })
  @IsInt()
  loanTypeId: number;

  @ApiProperty({ description: 'principalAmount' })
  @IsNumber()
  principalAmount: number;

  @ApiPropertyOptional({ description: 'interestRate' })
  @IsOptional()
  @IsNumber()
  interestRate?: number;

  @ApiPropertyOptional({ description: 'tenorMonths' })
  @IsOptional()
  @IsNumber()
  tenorMonths?: number;

  @ApiProperty({ description: 'installmentAmount' })
  @IsNumber()
  installmentAmount: number;

  @ApiProperty({ description: 'totalAmount' })
  @IsNumber()
  totalAmount: number;

  @ApiProperty({ description: 'remainingAmount' })
  @IsNumber()
  remainingAmount: number;

  @ApiPropertyOptional({ description: 'startDate', type: String, format: 'date-time' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({ description: 'LoanStatus ID (default 1)' })
  @IsOptional()
  @IsInt()
  statusId?: number;

  @ApiPropertyOptional({ description: 'notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'isActive' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;


}

export class UpdateLoanDto {
  @ApiPropertyOptional({ description: 'code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'employeeId' })
  @IsOptional()
  @IsNumber()
  employeeId?: number;

  @ApiPropertyOptional({ description: 'LoanType ID' })
  @IsOptional()
  @IsInt()
  loanTypeId?: number;

  @ApiPropertyOptional({ description: 'principalAmount' })
  @IsOptional()
  @IsNumber()
  principalAmount?: number;

  @ApiPropertyOptional({ description: 'interestRate' })
  @IsOptional()
  @IsNumber()
  interestRate?: number;

  @ApiPropertyOptional({ description: 'tenorMonths' })
  @IsOptional()
  @IsNumber()
  tenorMonths?: number;

  @ApiPropertyOptional({ description: 'installmentAmount' })
  @IsOptional()
  @IsNumber()
  installmentAmount?: number;

  @ApiPropertyOptional({ description: 'totalAmount' })
  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @ApiPropertyOptional({ description: 'remainingAmount' })
  @IsOptional()
  @IsNumber()
  remainingAmount?: number;

  @ApiPropertyOptional({ description: 'startDate', type: String, format: 'date-time' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({ description: 'LoanStatus ID (default 1)' })
  @IsOptional()
  @IsInt()
  statusId?: number;

  @ApiPropertyOptional({ description: 'notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'isActive' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;


}

export class LoanResponseDto {
  @ApiProperty({ description: 'code' })
  code: string;

  @ApiProperty({ description: 'employeeId' })
  employeeId: number;

  @ApiProperty({ description: 'loanType' })
  loanType: string;

  @ApiProperty({ description: 'principalAmount' })
  principalAmount: number;

  @ApiProperty({ description: 'interestRate' })
  interestRate: number;

  @ApiProperty({ description: 'tenorMonths' })
  tenorMonths: number;

  @ApiProperty({ description: 'installmentAmount' })
  installmentAmount: number;

  @ApiProperty({ description: 'totalAmount' })
  totalAmount: number;

  @ApiProperty({ description: 'remainingAmount' })
  remainingAmount: number;

  @ApiProperty({ description: 'startDate' })
  startDate: Date;

  @ApiProperty({ description: 'status' })
  status: any;

  @ApiProperty({ description: 'notes' })
  notes: string;

  @ApiProperty({ description: 'isActive' })
  isActive: boolean;

  @ApiProperty({ description: 'employee' })
  employee: any;

}

export class QueryLoanDto {
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
