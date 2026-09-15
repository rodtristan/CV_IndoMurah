import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({ description: 'code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'departmentId' })
  @IsNumber()
  departmentId: number;

  @ApiProperty({ description: 'positionId' })
  @IsNumber()
  positionId: number;

  @ApiProperty({ description: 'joinDate' })
  joinDate: Date;

  @ApiProperty({ description: 'endDate' })
  endDate: Date;

  @ApiProperty({ description: 'birthDate' })
  birthDate: Date;

  @ApiProperty({ description: 'gender' })
  @IsString()
  gender: string;

  @ApiProperty({ description: 'phone' })
  @IsString()
  phone: string;

  @ApiProperty({ description: 'email' })
  @IsString()
  email: string;

  @ApiProperty({ description: 'address' })
  @IsString()
  address: string;

  @ApiProperty({ description: 'emergencyContact' })
  @IsString()
  emergencyContact: string;

  @ApiProperty({ description: 'emergencyPhone' })
  @IsString()
  emergencyPhone: string;

  @ApiProperty({ description: 'basicSalary' })
  @IsNumber()
  basicSalary: number;

  @ApiProperty({ description: 'status' })
  status: any;

  @ApiProperty({ description: 'isActive' })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ description: 'department' })
  department: any;

  @ApiProperty({ description: 'position' })
  position: any;

}

export class UpdateEmployeeDto {
  @ApiPropertyOptional({ description: 'code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'departmentId' })
  @IsOptional()
  @IsNumber()
  departmentId?: number;

  @ApiPropertyOptional({ description: 'positionId' })
  @IsOptional()
  @IsNumber()
  positionId?: number;

  @ApiPropertyOptional({ description: 'joinDate' })
  @IsOptional()
  joinDate?: Date;

  @ApiPropertyOptional({ description: 'endDate' })
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional({ description: 'birthDate' })
  @IsOptional()
  birthDate?: Date;

  @ApiPropertyOptional({ description: 'gender' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ description: 'phone' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'email' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'emergencyContact' })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiPropertyOptional({ description: 'emergencyPhone' })
  @IsOptional()
  @IsString()
  emergencyPhone?: string;

  @ApiPropertyOptional({ description: 'basicSalary' })
  @IsOptional()
  @IsNumber()
  basicSalary?: number;

  @ApiPropertyOptional({ description: 'status' })
  @IsOptional()
  status?: any;

  @ApiPropertyOptional({ description: 'isActive' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'department' })
  @IsOptional()
  department?: any;

  @ApiPropertyOptional({ description: 'position' })
  @IsOptional()
  position?: any;

}

export class EmployeeResponseDto {
  @ApiProperty({ description: 'code' })
  code: string;

  @ApiProperty({ description: 'name' })
  name: string;

  @ApiProperty({ description: 'departmentId' })
  departmentId: number;

  @ApiProperty({ description: 'positionId' })
  positionId: number;

  @ApiProperty({ description: 'joinDate' })
  joinDate: Date;

  @ApiProperty({ description: 'endDate' })
  endDate: Date;

  @ApiProperty({ description: 'birthDate' })
  birthDate: Date;

  @ApiProperty({ description: 'gender' })
  gender: string;

  @ApiProperty({ description: 'phone' })
  phone: string;

  @ApiProperty({ description: 'email' })
  email: string;

  @ApiProperty({ description: 'address' })
  address: string;

  @ApiProperty({ description: 'emergencyContact' })
  emergencyContact: string;

  @ApiProperty({ description: 'emergencyPhone' })
  emergencyPhone: string;

  @ApiProperty({ description: 'basicSalary' })
  basicSalary: number;

  @ApiProperty({ description: 'status' })
  status: any;

  @ApiProperty({ description: 'isActive' })
  isActive: boolean;

  @ApiProperty({ description: 'department' })
  department: any;

  @ApiProperty({ description: 'position' })
  position: any;

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
