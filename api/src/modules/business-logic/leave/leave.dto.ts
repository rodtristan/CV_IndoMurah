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

  @ApiPropertyOptional({ description: 'Reason' })
  @IsOptional()
  @IsString()
  Reason?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class UpdateLeaveDto {
  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Total days' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  TotalDays?: number;

  @ApiPropertyOptional({ description: 'Reason' })
  @IsOptional()
  @IsString()
  Reason?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class ApproveLeaveDto {
  @ApiPropertyOptional({ description: 'Approver Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class RejectLeaveDto {
  @ApiProperty({ description: 'Rejection reason' })
  @IsString()
  @IsNotEmpty()
  Reason: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class LeaveFilterDto {
  @ApiPropertyOptional({ description: 'Employee ID' })
  @IsOptional()
  @IsNumber()
  EmployeeId?: number;

  @ApiPropertyOptional({ description: 'Leave Type ID' })
  @IsOptional()
  @IsNumber()
  TypeId?: number;

  @ApiPropertyOptional({ description: 'Status ID' })
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

export class LeaveBalanceDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsNumber()
  EmployeeId: number;

  @ApiProperty({ description: 'Year' })
  @IsNumber()
  Year: number;
}

export class InitializeLeaveBalanceDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsNumber()
  EmployeeId: number;

  @ApiProperty({ description: 'Year' })
  @IsNumber()
  Year: number;

  @ApiProperty({ description: 'Leave balances' })
  @IsString()
  @IsNotEmpty()
  Balances: { TypeId: number; TotalDays: number }[];
}
