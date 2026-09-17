import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBrandLogoDto {
  @ApiProperty({ description: 'brandId' })
  @IsNumber()
  brandId: number;

  @ApiProperty({ description: 'name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'logoUrl' })
  @IsString()
  logoUrl: string;

  @ApiProperty({ description: 'website' })
  @IsString()
  website: string;

  @ApiProperty({ description: 'sortOrder' })
  @IsNumber()
  sortOrder: number;

  @ApiProperty({ description: 'isActive' })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ description: 'brand' })
  brand: any;

}

export class UpdateBrandLogoDto {
  @ApiPropertyOptional({ description: 'brandId' })
  @IsOptional()
  @IsNumber()
  brandId?: number;

  @ApiPropertyOptional({ description: 'name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'logoUrl' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'website' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ description: 'sortOrder' })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'isActive' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'brand' })
  @IsOptional()
  brand?: any;

}

export class BrandLogoResponseDto {
  @ApiProperty({ description: 'brandId' })
  brandId: number;

  @ApiProperty({ description: 'name' })
  name: string;

  @ApiProperty({ description: 'logoUrl' })
  logoUrl: string;

  @ApiProperty({ description: 'website' })
  website: string;

  @ApiProperty({ description: 'sortOrder' })
  sortOrder: number;

  @ApiProperty({ description: 'isActive' })
  isActive: boolean;

  @ApiProperty({ description: 'brand' })
  brand: any;

}

export class QueryBrandLogoDto {
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
