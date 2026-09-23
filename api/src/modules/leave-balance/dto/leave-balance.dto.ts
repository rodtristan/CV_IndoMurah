import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLeaveBalanceDto {
  @ApiProperty({ description: 'employeeId' })
  @IsNumber()
  employeeId: number;

  @ApiProperty({ description: 'year' })
  @IsNumber()
  year: number;

  @ApiProperty({ description: 'leaveType' })
  leaveType: any;

  @ApiPropertyOptional({ description: 'totalDays' })
  @IsOptional()
  @IsNumber()
  totalDays?: number;

  @ApiPropertyOptional({ description: 'usedDays' })
  @IsOptional()
  @IsNumber()
  usedDays?: number;

  @ApiPropertyOptional({ description: 'remainingDays' })
  @IsOptional()
  @IsNumber()
  remainingDays?: number;

  @ApiPropertyOptional({ description: 'isActive' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;


}

export class UpdateLeaveBalanceDto {
  @ApiPropertyOptional({ description: 'employeeId' })
  @IsOptional()
  @IsNumber()
  employeeId?: number;

  @ApiPropertyOptional({ description: 'year' })
  @IsOptional()
  @IsNumber()
  year?: number;

  @ApiPropertyOptional({ description: 'leaveType' })
  @IsOptional()
  leaveType?: any;

  @ApiPropertyOptional({ description: 'totalDays' })
  @IsOptional()
  @IsNumber()
  totalDays?: number;

  @ApiPropertyOptional({ description: 'usedDays' })
  @IsOptional()
  @IsNumber()
  usedDays?: number;

  @ApiPropertyOptional({ description: 'remainingDays' })
  @IsOptional()
  @IsNumber()
  remainingDays?: number;

  @ApiPropertyOptional({ description: 'isActive' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;


}

export class LeaveBalanceResponseDto {
  @ApiProperty({ description: 'employeeId' })
  employeeId: number;

  @ApiProperty({ description: 'year' })
  year: number;

  @ApiProperty({ description: 'leaveType' })
  leaveType: any;

  @ApiProperty({ description: 'totalDays' })
  totalDays: number;

  @ApiProperty({ description: 'usedDays' })
  usedDays: number;

  @ApiProperty({ description: 'remainingDays' })
  remainingDays: number;

  @ApiProperty({ description: 'isActive' })
  isActive: boolean;

  @ApiProperty({ description: 'employee' })
  employee: any;

}

export class QueryLeaveBalanceDto {
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
