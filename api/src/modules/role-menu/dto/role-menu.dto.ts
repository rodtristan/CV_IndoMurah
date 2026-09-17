import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleMenuDto {
  @ApiProperty({ description: 'roleId' })
  @IsNumber()
  roleId: number;

  @ApiProperty({ description: 'menuId' })
  @IsNumber()
  menuId: number;

  @ApiProperty({ description: 'isActive' })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ description: 'role' })
  role: any;

  @ApiProperty({ description: 'menu' })
  menu: any;

}

export class UpdateRoleMenuDto {
  @ApiPropertyOptional({ description: 'roleId' })
  @IsOptional()
  @IsNumber()
  roleId?: number;

  @ApiPropertyOptional({ description: 'menuId' })
  @IsOptional()
  @IsNumber()
  menuId?: number;

  @ApiPropertyOptional({ description: 'isActive' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'role' })
  @IsOptional()
  role?: any;

  @ApiPropertyOptional({ description: 'menu' })
  @IsOptional()
  menu?: any;

}

export class RoleMenuResponseDto {
  @ApiProperty({ description: 'roleId' })
  roleId: number;

  @ApiProperty({ description: 'menuId' })
  menuId: number;

  @ApiProperty({ description: 'isActive' })
  isActive: boolean;

  @ApiProperty({ description: 'role' })
  role: any;

  @ApiProperty({ description: 'menu' })
  menu: any;

}

export class QueryRoleMenuDto {
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
