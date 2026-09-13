import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSalePointDto {
  @ApiProperty({ description: 'Unique sale point code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Sale point name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Associated warehouse ID' })
  @IsOptional()
  @IsInt()
  warehouseId?: number;

  @ApiPropertyOptional({ description: 'Sale point description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: true, description: 'Is sale point active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateSalePointDto {
  @ApiPropertyOptional({ description: 'Unique sale point code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'Sale point name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Associated warehouse ID' })
  @IsOptional()
  @IsInt()
  warehouseId?: number;

  @ApiPropertyOptional({ description: 'Sale point description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Is sale point active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
