import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  IsNotEmpty,
} from 'class-validator';

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class CreateCategoryDto {
  @ApiProperty({ description: 'Category Code' })
  @IsString()
  @IsNotEmpty()
  Code: string;

  @ApiProperty({ description: 'Category Name' })
  @IsString()
  @IsNotEmpty()
  Name: string;

  @ApiPropertyOptional({ description: 'Icon Name' })
  @IsOptional()
  @IsString()
  Icon?: string;

  @ApiPropertyOptional({ description: 'Image URL' })
  @IsOptional()
  @IsString()
  Image?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ description: 'Category Name' })
  @IsOptional()
  @IsString()
  Name?: string;

  @ApiPropertyOptional({ description: 'Icon Name' })
  @IsOptional()
  @IsString()
  Icon?: string;

  @ApiPropertyOptional({ description: 'Image URL' })
  @IsOptional()
  @IsString()
  Image?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;
}

export class CategoryFilterDto {
  @ApiPropertyOptional({ description: 'Search keyword' })
  @IsOptional()
  @IsString()
  Search?: string;

  @ApiPropertyOptional({ description: 'Include inactive' })
  @IsOptional()
  @IsBoolean()
  IncludeInactive?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// BRAND DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class CreateBrandDto {
  @ApiProperty({ description: 'Brand Code' })
  @IsString()
  @IsNotEmpty()
  Code: string;

  @ApiProperty({ description: 'Brand Name' })
  @IsString()
  @IsNotEmpty()
  Name: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsOptional()
  @IsString()
  LogoUrl?: string;
}

export class UpdateBrandDto {
  @ApiPropertyOptional({ description: 'Brand Name' })
  @IsOptional()
  @IsString()
  Name?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsOptional()
  @IsString()
  LogoUrl?: string;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;
}

export class BrandFilterDto {
  @ApiPropertyOptional({ description: 'Search keyword' })
  @IsOptional()
  @IsString()
  Search?: string;

  @ApiPropertyOptional({ description: 'Include inactive' })
  @IsOptional()
  @IsBoolean()
  IncludeInactive?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// UNIT DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class CreateUnitDto {
  @ApiProperty({ description: 'Unit Code' })
  @IsString()
  @IsNotEmpty()
  Code: string;

  @ApiProperty({ description: 'Unit Name' })
  @IsString()
  @IsNotEmpty()
  Name: string;

  @ApiPropertyOptional({ description: 'Abbreviation' })
  @IsOptional()
  @IsString()
  Abbreviation?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;
}

export class UpdateUnitDto {
  @ApiPropertyOptional({ description: 'Unit Name' })
  @IsOptional()
  @IsString()
  Name?: string;

  @ApiPropertyOptional({ description: 'Abbreviation' })
  @IsOptional()
  @IsString()
  Abbreviation?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT GROUP DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class CreateProductGroupDto {
  @ApiProperty({ description: 'Product group Code' })
  @IsString()
  @IsNotEmpty()
  Code: string;

  @ApiProperty({ description: 'Product group Name' })
  @IsString()
  @IsNotEmpty()
  Name: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;
}

export class UpdateProductGroupDto {
  @ApiPropertyOptional({ description: 'Product group Name' })
  @IsOptional()
  @IsString()
  Name?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;
}
