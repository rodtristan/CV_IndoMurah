import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTION CATEGORY DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class CreateProductionCategoryDto {
  @ApiProperty({ description: 'Category Code' })
  @IsString()
  Code: string;

  @ApiProperty({ description: 'Category Name' })
  @IsString()
  Name: string;

  @ApiPropertyOptional({ description: 'Category Description' })
  @IsOptional()
  @IsString()
  Description?: string;

  @ApiPropertyOptional({ description: 'Is for raw materials' })
  @IsOptional()
  @IsBoolean()
  isRawMaterial?: boolean;
}

export class UpdateProductionCategoryDto {
  @ApiPropertyOptional({ description: 'Category Name' })
  @IsOptional()
  @IsString()
  Name?: string;

  @ApiPropertyOptional({ description: 'Category Description' })
  @IsOptional()
  @IsString()
  Description?: string;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTION MATERIAL DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class CreateProductionMaterialDto {
  @ApiProperty({ description: 'Material Name' })
  @IsString()
  Name: string;

  @ApiProperty({ description: 'Production category ID' })
  @IsNumber()
  CategoryId: number;

  @ApiProperty({ description: 'Unit ID' })
  @IsNumber()
  UnitId: number;

  @ApiPropertyOptional({ description: 'Purchase price' })
  @IsOptional()
  @IsNumber()
  PurchasePrice?: number;

  @ApiPropertyOptional({ description: 'Minimum stock level' })
  @IsOptional()
  @IsNumber()
  MinimumStock?: number;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;
}

export class UpdateProductionMaterialDto {
  @ApiPropertyOptional({ description: 'Material Name' })
  @IsOptional()
  @IsString()
  Name?: string;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsNumber()
  CategoryId?: number;

  @ApiPropertyOptional({ description: 'Unit ID' })
  @IsOptional()
  @IsNumber()
  UnitId?: number;

  @ApiPropertyOptional({ description: 'Purchase price' })
  @IsOptional()
  @IsNumber()
  PurchasePrice?: number;

  @ApiPropertyOptional({ description: 'Minimum stock' })
  @IsOptional()
  @IsNumber()
  MinimumStock?: number;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;
}

export class ProductionMaterialFilterDto {
  @ApiPropertyOptional({ description: 'Category ID filter' })
  @IsOptional()
  @IsNumber()
  CategoryId?: number;

  @ApiPropertyOptional({ description: 'Search by Name' })
  @IsOptional()
  @IsString()
  Search?: string;

  @ApiPropertyOptional({ description: 'Raw materials only' })
  @IsOptional()
  @IsBoolean()
  isRawMaterial?: boolean;

  @ApiPropertyOptional({ description: 'Active only' })
  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;
}
