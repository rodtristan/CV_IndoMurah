import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMenuDto {
  @ApiProperty()
  @IsString()
  menu_name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  menu_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  parent_menu_id?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateMenuDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  menu_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  menu_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  parent_menu_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class AssignMenuDto {
  @ApiProperty()
  @IsInt()
  menu_id: number;
}
