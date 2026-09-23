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
// ATTENDANCE DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class RecordAttendanceDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsNumber()
  EmployeeId: number;

  @ApiProperty({ description: 'Attendance Date' })
  @IsDateString()
  Date: string;

  @ApiPropertyOptional({ description: 'Check in time' })
  @IsOptional()
  @IsString()
  CheckIn?: string;

  @ApiPropertyOptional({ description: 'Check out time' })
  @IsOptional()
  @IsString()
  CheckOut?: string;

  @ApiPropertyOptional({ description: 'Status ID (1=Present, 2=Sick, 3=Leave, etc)' })
  @IsOptional()
  @IsNumber()
  StatusId?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class BulkAttendanceDto {
  @ApiProperty({ description: 'Attendance records', type: [RecordAttendanceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecordAttendanceDto)
  Records: RecordAttendanceDto[];
}

export class AttendanceFilterDto {
  @ApiPropertyOptional({ description: 'Employee ID filter' })
  @IsOptional()
  @IsNumber()
  EmployeeId?: number;

  @ApiPropertyOptional({ description: 'Department ID filter' })
  @IsOptional()
  @IsNumber()
  DepartmentId?: number;

  @ApiPropertyOptional({ description: 'Status ID filter' })
  @IsOptional()
  @IsNumber()
  StatusId?: number;

  @ApiPropertyOptional({ description: 'Start Date filter' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date filter' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// LEAVE DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class CreateLeaveDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsNumber()
  EmployeeId: number;

  @ApiProperty({ description: 'Leave Type ID' })
  @IsNumber()
  TypeId: number;

  @ApiProperty({ description: 'Start Date' })
  @IsDateString()
  StartDate: string;

  @ApiProperty({ description: 'End Date' })
  @IsDateString()
  EndDate: string;

  @ApiProperty({ description: 'Total days' })
  @IsNumber()
  @Min(1)
  TotalDays: number;

  @ApiPropertyOptional({ description: 'Leave reason' })
  @IsOptional()
  @IsString()
  Reason?: string;

  @ApiPropertyOptional({ description: 'Additional Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class ApproveLeaveDto {
  @ApiProperty({ description: 'Approval Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class RejectLeaveDto {
  @ApiProperty({ description: 'Rejection reason' })
  @IsString()
  @IsNotEmpty()
  Reason: string;
}

export class LeaveFilterDto {
  @ApiPropertyOptional({ description: 'Employee ID filter' })
  @IsOptional()
  @IsNumber()
  EmployeeId?: number;

  @ApiPropertyOptional({ description: 'Leave Type ID filter' })
  @IsOptional()
  @IsNumber()
  TypeId?: number;

  @ApiPropertyOptional({ description: 'Status ID filter' })
  @IsOptional()
  @IsNumber()
  StatusId?: number;

  @ApiPropertyOptional({ description: 'Year filter' })
  @IsOptional()
  @IsNumber()
  Year?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYROLL DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class CreatePayrollDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsNumber()
  EmployeeId: number;

  @ApiProperty({ description: 'Payroll period (e.g., "2026-09")' })
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

  @ApiPropertyOptional({ description: 'Payment Date' })
  @IsOptional()
  @IsDateString()
  PaymentDate?: string;

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

  @ApiPropertyOptional({ description: 'Period filter (e.g., "2026-09")' })
  @IsOptional()
  @IsString()
  Period?: string;

  @ApiPropertyOptional({ description: 'Paid status filter' })
  @IsOptional()
  @IsBoolean()
  IsPaid?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// LOAN DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class CreateLoanDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsNumber()
  EmployeeId: number;

  @ApiProperty({ description: 'Loan Type ID' })
  @IsNumber()
  LoanTypeId: number;

  @ApiProperty({ description: 'Principal Amount' })
  @IsNumber()
  @Min(0.01)
  PrincipalAmount: number;

  @ApiPropertyOptional({ description: 'Interest rate (percentage)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  InterestRate?: number;

  @ApiPropertyOptional({ description: 'Tenor in months' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  TenorMonths?: number;

  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class RecordLoanPaymentDto {
  @ApiProperty({ description: 'Loan installment ID' })
  @IsNumber()
  InstallmentId: number;

  @ApiPropertyOptional({ description: 'Payment Date' })
  @IsOptional()
  @IsDateString()
  PaymentDate?: string;

  @ApiPropertyOptional({ description: 'Payment Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class LoanFilterDto {
  @ApiPropertyOptional({ description: 'Employee ID filter' })
  @IsOptional()
  @IsNumber()
  EmployeeId?: number;

  @ApiPropertyOptional({ description: 'Loan Type ID filter' })
  @IsOptional()
  @IsNumber()
  LoanTypeId?: number;

  @ApiPropertyOptional({ description: 'Status ID filter' })
  @IsOptional()
  @IsNumber()
  StatusId?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// EMPLOYEE DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class CreateEmployeeDto {
  @ApiProperty({ description: 'Employee Code' })
  @IsString()
  @IsNotEmpty()
  Code: string;

  @ApiProperty({ description: 'Employee Name' })
  @IsString()
  @IsNotEmpty()
  Name: string;

  @ApiPropertyOptional({ description: 'Department ID' })
  @IsOptional()
  @IsNumber()
  DepartmentId?: number;

  @ApiPropertyOptional({ description: 'Position ID' })
  @IsOptional()
  @IsNumber()
  PositionId?: number;

  @ApiPropertyOptional({ description: 'Join Date' })
  @IsOptional()
  @IsDateString()
  JoinDate?: string;

  @ApiPropertyOptional({ description: 'Birth Date' })
  @IsOptional()
  @IsDateString()
  BirthDate?: string;

  @ApiPropertyOptional({ description: 'Gender' })
  @IsOptional()
  @IsString()
  Gender?: string;

  @ApiPropertyOptional({ description: 'Phone' })
  @IsOptional()
  @IsString()
  Phone?: string;

  @ApiPropertyOptional({ description: 'Email' })
  @IsOptional()
  @IsString()
  Email?: string;

  @ApiPropertyOptional({ description: 'Address' })
  @IsOptional()
  @IsString()
  Address?: string;

  @ApiPropertyOptional({ description: 'Emergency contact' })
  @IsOptional()
  @IsString()
  EmergencyContact?: string;

  @ApiPropertyOptional({ description: 'Emergency phone' })
  @IsOptional()
  @IsString()
  EmergencyPhone?: string;

  @ApiPropertyOptional({ description: 'Basic salary' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  BasicSalary?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class UpdateEmployeeDto {
  @ApiPropertyOptional({ description: 'Department ID' })
  @IsOptional()
  @IsNumber()
  DepartmentId?: number;

  @ApiPropertyOptional({ description: 'Position ID' })
  @IsOptional()
  @IsNumber()
  PositionId?: number;

  @ApiPropertyOptional({ description: 'End Date (for resigned employees)' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Phone' })
  @IsOptional()
  @IsString()
  Phone?: string;

  @ApiPropertyOptional({ description: 'Email' })
  @IsOptional()
  @IsString()
  Email?: string;

  @ApiPropertyOptional({ description: 'Address' })
  @IsOptional()
  @IsString()
  Address?: string;

  @ApiPropertyOptional({ description: 'Emergency contact' })
  @IsOptional()
  @IsString()
  EmergencyContact?: string;

  @ApiPropertyOptional({ description: 'Emergency phone' })
  @IsOptional()
  @IsString()
  EmergencyPhone?: string;

  @ApiPropertyOptional({ description: 'Basic salary' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  BasicSalary?: number;

  @ApiPropertyOptional({ description: 'Status ID' })
  @IsOptional()
  @IsNumber()
  StatusId?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class EmployeeFilterDto {
  @ApiPropertyOptional({ description: 'Department ID filter' })
  @IsOptional()
  @IsNumber()
  DepartmentId?: number;

  @ApiPropertyOptional({ description: 'Position ID filter' })
  @IsOptional()
  @IsNumber()
  PositionId?: number;

  @ApiPropertyOptional({ description: 'Status ID filter' })
  @IsOptional()
  @IsNumber()
  StatusId?: number;

  @ApiPropertyOptional({ description: 'Active only' })
  @IsOptional()
  @IsBoolean()
  ActiveOnly?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// LEAVE BALANCE DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class InitializeLeaveBalanceDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsNumber()
  EmployeeId: number;

  @ApiProperty({ description: 'Year' })
  @IsNumber()
  Year: number;

  @ApiProperty({ description: 'Leave Type ID' })
  @IsNumber()
  TypeId: number;

  @ApiProperty({ description: 'Total days allocated' })
  @IsNumber()
  @Min(0)
  TotalDays: number;
}

export class LeaveBalanceFilterDto {
  @ApiPropertyOptional({ description: 'Employee ID filter' })
  @IsOptional()
  @IsNumber()
  EmployeeId?: number;

  @ApiPropertyOptional({ description: 'Year filter' })
  @IsOptional()
  @IsNumber()
  Year?: number;

  @ApiPropertyOptional({ description: 'Leave Type ID filter' })
  @IsOptional()
  @IsNumber()
  TypeId?: number;
}
