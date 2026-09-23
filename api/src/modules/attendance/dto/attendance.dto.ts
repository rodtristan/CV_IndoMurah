import { IsString, IsOptional, IsBoolean, IsNumber, IsInt, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAttendanceDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsInt()
  employeeId: number;

  @ApiProperty({ description: 'Attendance date', type: String })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ description: 'Check-in time', type: String })
  @IsOptional()
  @IsDateString()
  checkIn?: string;

  @ApiPropertyOptional({ description: 'Check-in GPS latitude (for mobile check-in)' })
  @IsOptional()
  @IsNumber()
  checkInLatitude?: number;

  @ApiPropertyOptional({ description: 'Check-in GPS longitude (for mobile check-in)' })
  @IsOptional()
  @IsNumber()
  checkInLongitude?: number;

  @ApiPropertyOptional({ description: 'Check-out time', type: String })
  @IsOptional()
  @IsDateString()
  checkOut?: string;

  @ApiPropertyOptional({ description: 'Check-out GPS latitude (for mobile check-in)' })
  @IsOptional()
  @IsNumber()
  checkOutLatitude?: number;

  @ApiPropertyOptional({ description: 'Check-out GPS longitude (for mobile check-in)' })
  @IsOptional()
  @IsNumber()
  checkOutLongitude?: number;

  @ApiPropertyOptional({ description: 'Status code (PRESENT, ABSENT, LATE, LEAVE, SICK, PERMIT)', default: 'PRESENT' })
  @IsOptional()
  @IsString()
  statusCode?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateAttendanceDto {
  @ApiPropertyOptional({ description: 'Employee ID' })
  @IsOptional()
  @IsInt()
  employeeId?: number;

  @ApiPropertyOptional({ description: 'Attendance date', type: String })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ description: 'Check-in time', type: String })
  @IsOptional()
  @IsDateString()
  checkIn?: string;

  @ApiPropertyOptional({ description: 'Check-in GPS latitude' })
  @IsOptional()
  @IsNumber()
  checkInLatitude?: number;

  @ApiPropertyOptional({ description: 'Check-in GPS longitude' })
  @IsOptional()
  @IsNumber()
  checkInLongitude?: number;

  @ApiPropertyOptional({ description: 'Check-out time', type: String })
  @IsOptional()
  @IsDateString()
  checkOut?: string;

  @ApiPropertyOptional({ description: 'Check-out GPS latitude' })
  @IsOptional()
  @IsNumber()
  checkOutLatitude?: number;

  @ApiPropertyOptional({ description: 'Check-out GPS longitude' })
  @IsOptional()
  @IsNumber()
  checkOutLongitude?: number;

  @ApiPropertyOptional({ description: 'Status code' })
  @IsOptional()
  @IsString()
  statusCode?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class QueryAttendanceDto {
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
