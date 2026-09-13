import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWarehouseDto {
  @ApiProperty({ description: 'Unique warehouse code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Warehouse name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Warehouse address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Warehouse phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ default: false, description: 'Is this the default warehouse' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ default: true, description: 'Is warehouse active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateWarehouseDto {
  @ApiPropertyOptional({ description: 'Unique warehouse code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'Warehouse name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Warehouse address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Warehouse phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Is this the default warehouse' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Is warehouse active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
