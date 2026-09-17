import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLeaveDto {
  @ApiProperty({ description: 'code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'employeeId' })
  @IsNumber()
  employeeId: number;

  @ApiProperty({ description: 'type' })
  type: any;

  @ApiProperty({ description: 'startDate' })
  startDate: Date;

  @ApiProperty({ description: 'endDate' })
  endDate: Date;

  @ApiProperty({ description: 'totalDays' })
  @IsNumber()
  totalDays: number;

  @ApiProperty({ description: 'reason' })
  @IsString()
  reason: string;

  @ApiProperty({ description: 'status' })
  status: any;

  @ApiProperty({ description: 'approvedById' })
  @IsString()
  approvedById: string;

  @ApiProperty({ description: 'approvedAt' })
  approvedAt: Date;

  @ApiProperty({ description: 'rejectedReason' })
  @IsString()
  rejectedReason: string;

  @ApiProperty({ description: 'notes' })
  @IsString()
  notes: string;

  @ApiProperty({ description: 'isActive' })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ description: 'employee' })
  employee: any;

  @ApiProperty({ description: 'approver' })
  approver: any;

}

export class UpdateLeaveDto {
  @ApiPropertyOptional({ description: 'code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'employeeId' })
  @IsOptional()
  @IsNumber()
  employeeId?: number;

  @ApiPropertyOptional({ description: 'type' })
  @IsOptional()
  type?: any;

  @ApiPropertyOptional({ description: 'startDate' })
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({ description: 'endDate' })
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional({ description: 'totalDays' })
  @IsOptional()
  @IsNumber()
  totalDays?: number;

  @ApiPropertyOptional({ description: 'reason' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'status' })
  @IsOptional()
  status?: any;

  @ApiPropertyOptional({ description: 'approvedById' })
  @IsOptional()
  @IsString()
  approvedById?: string;

  @ApiPropertyOptional({ description: 'approvedAt' })
  @IsOptional()
  approvedAt?: Date;

  @ApiPropertyOptional({ description: 'rejectedReason' })
  @IsOptional()
  @IsString()
  rejectedReason?: string;

  @ApiPropertyOptional({ description: 'notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'isActive' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'employee' })
  @IsOptional()
  employee?: any;

  @ApiPropertyOptional({ description: 'approver' })
  @IsOptional()
  approver?: any;

}

export class LeaveResponseDto {
  @ApiProperty({ description: 'code' })
  code: string;

  @ApiProperty({ description: 'employeeId' })
  employeeId: number;

  @ApiProperty({ description: 'type' })
  type: any;

  @ApiProperty({ description: 'startDate' })
  startDate: Date;

  @ApiProperty({ description: 'endDate' })
  endDate: Date;

  @ApiProperty({ description: 'totalDays' })
  totalDays: number;

  @ApiProperty({ description: 'reason' })
  reason: string;

  @ApiProperty({ description: 'status' })
  status: any;

  @ApiProperty({ description: 'approvedById' })
  approvedById: string;

  @ApiProperty({ description: 'approvedAt' })
  approvedAt: Date;

  @ApiProperty({ description: 'rejectedReason' })
  rejectedReason: string;

  @ApiProperty({ description: 'notes' })
  notes: string;

  @ApiProperty({ description: 'isActive' })
  isActive: boolean;

  @ApiProperty({ description: 'employee' })
  employee: any;

  @ApiProperty({ description: 'approver' })
  approver: any;

}

export class QueryLeaveDto {
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
