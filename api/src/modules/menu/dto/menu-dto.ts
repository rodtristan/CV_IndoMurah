import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMenuDto {
  @ApiProperty({ description: 'Menu name/key for routing' })
  @IsString()
  menuName: string;

  @ApiPropertyOptional({ description: 'Menu type (e.g., sidebar, header)' })
  @IsOptional()
  @IsString()
  menuType?: string;

  @ApiPropertyOptional({ description: 'Icon class or name' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: 'Route path' })
  @IsOptional()
  @IsString()
  route?: string;

  @ApiPropertyOptional({ description: 'Parent menu ID for hierarchy' })
  @IsOptional()
  @IsInt()
  parentMenuId?: number;

  @ApiPropertyOptional({ default: true, description: 'Is menu active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: 0, description: 'Sort order' })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class UpdateMenuDto {
  @ApiPropertyOptional({ description: 'Menu name/key' })
  @IsOptional()
  @IsString()
  menuName?: string;

  @ApiPropertyOptional({ description: 'Menu type' })
  @IsOptional()
  @IsString()
  menuType?: string;

  @ApiPropertyOptional({ description: 'Icon class or name' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: 'Route path' })
  @IsOptional()
  @IsString()
  route?: string;

  @ApiPropertyOptional({ description: 'Parent menu ID' })
  @IsOptional()
  @IsInt()
  parentMenuId?: number;

  @ApiPropertyOptional({ description: 'Is menu active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Sort order' })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class AssignMenuDto {
  @ApiProperty({ description: 'Menu ID to assign' })
  @IsInt()
  menuId: number;
}
