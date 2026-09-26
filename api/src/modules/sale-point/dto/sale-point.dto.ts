import { IsString, IsOptional, IsBoolean, IsInt, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSalePointDto {
  @ApiProperty({ description: 'SalePoint code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'SalePoint name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: true, description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Warehouse (stock source) ID' })
  @IsOptional()
  @IsInt()
  warehouseId?: number;
}

export class UpdateSalePointDto {
  @ApiPropertyOptional({ description: 'SalePoint code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'SalePoint name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Warehouse (stock source) ID' })
  @IsOptional()
  @IsInt()
  warehouseId?: number;
}
