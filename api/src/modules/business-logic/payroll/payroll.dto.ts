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

export class CreatePayrollDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsNumber()
  EmployeeId: number;

  @ApiProperty({ description: 'Payroll period (e.g., 2024-01)' })
  @IsString()
  @IsNotEmpty()
  Period: string;

  @ApiProperty({ description: 'Basic salary' })
  @IsNumber()
  @Min(0)
  BasicSalary: number;

  @ApiPropertyOptional({ description: 'Allowances' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  Allowances?: number;

  @ApiPropertyOptional({ description: 'Deductions' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  Deductions?: number;

  @ApiPropertyOptional({ description: 'Overtime pay' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  OvertimePay?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class UpdatePayrollDto {
  @ApiPropertyOptional({ description: 'Allowances' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  Allowances?: number;

  @ApiPropertyOptional({ description: 'Deductions' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  Deductions?: number;

  @ApiPropertyOptional({ description: 'Overtime pay' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  OvertimePay?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class PayrollFilterDto {
  @ApiPropertyOptional({ description: 'Employee ID filter' })
  @IsOptional()
  @IsNumber()
  EmployeeId?: number;

  @ApiPropertyOptional({ description: 'Period filter (e.g., 2024-01)' })
  @IsOptional()
  @IsString()
  Period?: string;

  @ApiPropertyOptional({ description: 'Show only unpaid' })
  @IsOptional()
  @IsBoolean()
  UnpaidOnly?: boolean;

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

export class PaymentPayrollDto {
  @ApiProperty({ description: 'Payroll ID' })
  @IsNumber()
  PayrollId: number;

  @ApiPropertyOptional({ description: 'Payment Date' })
  @IsOptional()
  @IsDateString()
  PaymentDate?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class PayrollSummaryDto {
  @ApiProperty({ description: 'Period (e.g., 2024-01)' })
  @IsString()
  @IsNotEmpty()
  Period: string;
}
