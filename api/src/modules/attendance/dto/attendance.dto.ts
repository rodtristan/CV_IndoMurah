import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAttendanceDto {
  @ApiProperty({ description: 'employeeId' })
  @IsNumber()
  employeeId: number;

  @ApiProperty({ description: 'date' })
  date: Date;

  @ApiProperty({ description: 'checkIn' })
  checkIn: Date;

  @ApiProperty({ description: 'checkOut' })
  checkOut: Date;

  @ApiProperty({ description: 'status' })
  status: any;

  @ApiProperty({ description: 'notes' })
  @IsString()
  notes: string;

  @ApiProperty({ description: 'isActive' })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ description: 'employee' })
  employee: any;

}

export class UpdateAttendanceDto {
  @ApiPropertyOptional({ description: 'employeeId' })
  @IsOptional()
  @IsNumber()
  employeeId?: number;

  @ApiPropertyOptional({ description: 'date' })
  @IsOptional()
  date?: Date;

  @ApiPropertyOptional({ description: 'checkIn' })
  @IsOptional()
  checkIn?: Date;

  @ApiPropertyOptional({ description: 'checkOut' })
  @IsOptional()
  checkOut?: Date;

  @ApiPropertyOptional({ description: 'status' })
  @IsOptional()
  status?: any;

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

}

export class AttendanceResponseDto {
  @ApiProperty({ description: 'employeeId' })
  employeeId: number;

  @ApiProperty({ description: 'date' })
  date: Date;

  @ApiProperty({ description: 'checkIn' })
  checkIn: Date;

  @ApiProperty({ description: 'checkOut' })
  checkOut: Date;

  @ApiProperty({ description: 'status' })
  status: any;

  @ApiProperty({ description: 'notes' })
  notes: string;

  @ApiProperty({ description: 'isActive' })
  isActive: boolean;

  @ApiProperty({ description: 'employee' })
  employee: any;

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
