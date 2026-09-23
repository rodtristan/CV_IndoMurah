import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsArray,
  ValidateNested,
  Min,
  IsNotEmpty,
} from 'class-validator';

export class RecordAttendanceDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsNumber()
  EmployeeId: number;

  @ApiProperty({ description: 'Attendance Date' })
  @IsDateString()
  Date: string;

  @ApiPropertyOptional({ description: 'Check-in time' })
  @IsOptional()
  @IsDateString()
  CheckIn?: string;

  @ApiPropertyOptional({ description: 'Check-out time' })
  @IsOptional()
  @IsDateString()
  CheckOut?: string;

  @ApiPropertyOptional({ description: 'Attendance status ID' })
  @IsOptional()
  @IsNumber()
  StatusId?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class BulkAttendanceDto {
  @ApiProperty({ description: 'List of attendance records', type: [RecordAttendanceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecordAttendanceDto)
  records: RecordAttendanceDto[];
}

export class AttendanceFilterDto {
  @ApiPropertyOptional({ description: 'Employee ID filter' })
  @IsOptional()
  @IsNumber()
  EmployeeId?: number;

  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Status ID filter' })
  @IsOptional()
  @IsNumber()
  StatusId?: number;

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

export class AttendanceSummaryDto {
  @ApiProperty({ description: 'Start Date' })
  @IsDateString()
  StartDate: string;

  @ApiProperty({ description: 'End Date' })
  @IsDateString()
  EndDate: string;

  @ApiPropertyOptional({ description: 'Employee ID (optional)' })
  @IsOptional()
  @IsNumber()
  EmployeeId?: number;
}

export class UpdateAttendanceDto {
  @ApiPropertyOptional({ description: 'Check-in time' })
  @IsOptional()
  @IsDateString()
  CheckIn?: string;

  @ApiPropertyOptional({ description: 'Check-out time' })
  @IsOptional()
  @IsDateString()
  CheckOut?: string;

  @ApiPropertyOptional({ description: 'Status ID' })
  @IsOptional()
  @IsNumber()
  StatusId?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}
