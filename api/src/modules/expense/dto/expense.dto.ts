import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExpenseDto {
  @ApiProperty({ description: 'code' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: 'date' })
  @IsOptional()
  date?: Date;

  @ApiProperty({ description: 'expenseCategoryId' })
  @IsNumber()
  expenseCategoryId: number;

  @ApiProperty({ description: 'amount' })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ description: 'description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'referenceNumber' })
  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @ApiPropertyOptional({ description: 'isApproved' })
  @IsOptional()
  @IsBoolean()
  isApproved?: boolean;

  @ApiPropertyOptional({ description: 'approvedById' })
  @IsOptional()
  @IsString()
  approvedById?: string;

  @ApiPropertyOptional({ description: 'approvedAt' })
  @IsOptional()
  approvedAt?: Date;

  @ApiPropertyOptional({ description: 'notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'isActive' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'expenseCategory' })
  expenseCategory: any;


}

export class UpdateExpenseDto {
  @ApiPropertyOptional({ description: 'code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'date' })
  @IsOptional()
  date?: Date;

  @ApiPropertyOptional({ description: 'expenseCategoryId' })
  @IsOptional()
  @IsNumber()
  expenseCategoryId?: number;

  @ApiPropertyOptional({ description: 'amount' })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ description: 'description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'referenceNumber' })
  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @ApiPropertyOptional({ description: 'isApproved' })
  @IsOptional()
  @IsBoolean()
  isApproved?: boolean;

  @ApiPropertyOptional({ description: 'approvedById' })
  @IsOptional()
  @IsString()
  approvedById?: string;

  @ApiPropertyOptional({ description: 'approvedAt' })
  @IsOptional()
  approvedAt?: Date;

  @ApiPropertyOptional({ description: 'notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'isActive' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'expenseCategory' })
  @IsOptional()
  expenseCategory?: any;


}

export class ExpenseResponseDto {
  @ApiProperty({ description: 'code' })
  code: string;

  @ApiProperty({ description: 'date' })
  date: Date;

  @ApiProperty({ description: 'expenseCategoryId' })
  expenseCategoryId: number;

  @ApiProperty({ description: 'amount' })
  amount: number;

  @ApiProperty({ description: 'description' })
  description: string;

  @ApiProperty({ description: 'referenceNumber' })
  referenceNumber: string;

  @ApiProperty({ description: 'isApproved' })
  isApproved: boolean;

  @ApiProperty({ description: 'approvedById' })
  approvedById: string;

  @ApiProperty({ description: 'approvedAt' })
  approvedAt: Date;

  @ApiProperty({ description: 'notes' })
  notes: string;

  @ApiProperty({ description: 'isActive' })
  isActive: boolean;

  @ApiProperty({ description: 'expenseCategory' })
  expenseCategory: any;

  @ApiProperty({ description: 'approver' })
  approver: any;

}

export class QueryExpenseDto {
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
