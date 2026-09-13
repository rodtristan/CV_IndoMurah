import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBrandDto {
  @ApiProperty({ description: 'Unique brand code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Brand name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Brand description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Brand logo URL' })
  @IsOptional()
  @IsString()
  logo_url?: string;

  @ApiPropertyOptional({ default: true, description: 'Is brand active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateBrandDto {
  @ApiPropertyOptional({ description: 'Unique brand code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'Brand name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Brand description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Brand logo URL' })
  @IsOptional()
  @IsString()
  logo_url?: string;

  @ApiPropertyOptional({ description: 'Is brand active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
