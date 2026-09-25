import { IsString, IsOptional, IsBoolean, IsNumber, IsDecimal } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateCustomerGroupDto {
  @ApiProperty({ description: 'Customer group code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Customer group name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Discount percent for this group' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  discountPercent?: number;

  @ApiPropertyOptional({ description: 'Point multiplier for this group' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  pointMultiplier?: number;

  @ApiPropertyOptional({ default: true, description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: 0, description: 'Sort order' })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class UpdateCustomerGroupDto {
  @ApiPropertyOptional({ description: 'Customer group code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'Customer group name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Discount percent for this group' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  discountPercent?: number;

  @ApiPropertyOptional({ description: 'Point multiplier for this group' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  pointMultiplier?: number;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Sort order' })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
