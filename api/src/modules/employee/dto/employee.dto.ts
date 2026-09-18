import { IsString, IsOptional, IsBoolean, IsNumber, IsInt, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({ description: 'Employee code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Employee name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Department ID' })
  @IsOptional()
  @IsInt()
  departmentId?: number;

  @ApiPropertyOptional({ description: 'Position ID' })
  @IsOptional()
  @IsInt()
  positionId?: number;

  @ApiPropertyOptional({ description: 'Join date', type: String })
  @IsOptional()
  @IsDateString()
  joinDate?: string;

  @ApiPropertyOptional({ description: 'End date', type: String })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Birth date', type: String })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ description: 'Gender' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ description: 'Phone' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Email' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Emergency contact name' })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiPropertyOptional({ description: 'Emergency contact phone' })
  @IsOptional()
  @IsString()
  emergencyPhone?: string;

  @ApiPropertyOptional({ description: 'Basic salary', default: 0 })
  @IsOptional()
  @IsNumber()
  basicSalary?: number;

  @ApiPropertyOptional({ description: 'Status code (ACTIVE, ON_LEAVE, SUSPENDED, RESIGNED, TERMINATED)', default: 'ACTIVE' })
  @IsOptional()
  @IsString()
  statusCode?: string;
}

export class UpdateEmployeeDto {
  @ApiPropertyOptional({ description: 'Employee code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'Employee name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Department ID' })
  @IsOptional()
  @IsInt()
  departmentId?: number;

  @ApiPropertyOptional({ description: 'Position ID' })
  @IsOptional()
  @IsInt()
  positionId?: number;

  @ApiPropertyOptional({ description: 'Join date', type: String })
  @IsOptional()
  @IsDateString()
  joinDate?: string;

  @ApiPropertyOptional({ description: 'End date', type: String })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Birth date', type: String })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ description: 'Gender' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ description: 'Phone' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Email' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Emergency contact name' })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiPropertyOptional({ description: 'Emergency contact phone' })
  @IsOptional()
  @IsString()
  emergencyPhone?: string;

  @ApiPropertyOptional({ description: 'Basic salary' })
  @IsOptional()
  @IsNumber()
  basicSalary?: number;

  @ApiPropertyOptional({ description: 'Status code' })
  @IsOptional()
  @IsString()
  statusCode?: string;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class QueryEmployeeDto {
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
