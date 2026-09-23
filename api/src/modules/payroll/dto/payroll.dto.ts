import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePayrollDto {
  @ApiProperty({ description: 'code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'employeeId' })
  @IsNumber()
  employeeId: number;

  @ApiProperty({ description: 'period' })
  @IsString()
  period: string;

  @ApiProperty({ description: 'basicSalary' })
  @IsNumber()
  basicSalary: number;

  @ApiPropertyOptional({ description: 'allowances' })
  @IsOptional()
  @IsNumber()
  allowances?: number;

  @ApiPropertyOptional({ description: 'deductions' })
  @IsOptional()
  @IsNumber()
  deductions?: number;

  @ApiPropertyOptional({ description: 'overtimePay' })
  @IsOptional()
  @IsNumber()
  overtimePay?: number;

  @ApiPropertyOptional({ description: 'totalSalary' })
  @IsOptional()
  @IsNumber()
  totalSalary?: number;

  @ApiPropertyOptional({ description: 'paymentDate' })
  @IsOptional()
  paymentDate?: Date;

  @ApiPropertyOptional({ description: 'notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'isPaid' })
  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @ApiPropertyOptional({ description: 'isActive' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;


}

export class UpdatePayrollDto {
  @ApiPropertyOptional({ description: 'code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'employeeId' })
  @IsOptional()
  @IsNumber()
  employeeId?: number;

  @ApiPropertyOptional({ description: 'period' })
  @IsOptional()
  @IsString()
  period?: string;

  @ApiPropertyOptional({ description: 'basicSalary' })
  @IsOptional()
  @IsNumber()
  basicSalary?: number;

  @ApiPropertyOptional({ description: 'allowances' })
  @IsOptional()
  @IsNumber()
  allowances?: number;

  @ApiPropertyOptional({ description: 'deductions' })
  @IsOptional()
  @IsNumber()
  deductions?: number;

  @ApiPropertyOptional({ description: 'overtimePay' })
  @IsOptional()
  @IsNumber()
  overtimePay?: number;

  @ApiPropertyOptional({ description: 'totalSalary' })
  @IsOptional()
  @IsNumber()
  totalSalary?: number;

  @ApiPropertyOptional({ description: 'paymentDate' })
  @IsOptional()
  paymentDate?: Date;

  @ApiPropertyOptional({ description: 'notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'isPaid' })
  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @ApiPropertyOptional({ description: 'isActive' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;


}

export class PayrollResponseDto {
  @ApiProperty({ description: 'code' })
  code: string;

  @ApiProperty({ description: 'employeeId' })
  employeeId: number;

  @ApiProperty({ description: 'period' })
  period: string;

  @ApiProperty({ description: 'basicSalary' })
  basicSalary: number;

  @ApiProperty({ description: 'allowances' })
  allowances: number;

  @ApiProperty({ description: 'deductions' })
  deductions: number;

  @ApiProperty({ description: 'overtimePay' })
  overtimePay: number;

  @ApiProperty({ description: 'totalSalary' })
  totalSalary: number;

  @ApiProperty({ description: 'paymentDate' })
  paymentDate: Date;

  @ApiProperty({ description: 'notes' })
  notes: string;

  @ApiProperty({ description: 'isPaid' })
  isPaid: boolean;

  @ApiProperty({ description: 'isActive' })
  isActive: boolean;

  @ApiProperty({ description: 'employee' })
  employee: any;

}

export class QueryPayrollDto {
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
