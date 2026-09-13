import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSalesPersonDto {
  @ApiProperty({ description: 'Unique sales person code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Sales person name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Sales person phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Sales person email' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Sales person address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ default: true, description: 'Is sales person active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateSalesPersonDto {
  @ApiPropertyOptional({ description: 'Unique sales person code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'Sales person name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Sales person phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Sales person email' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Sales person address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Is sales person active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
