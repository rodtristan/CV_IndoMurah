import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsOptional, IsBoolean, IsArray, Min } from 'class-validator';

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE CATEGORY
// ─────────────────────────────────────────────────────────────────────────────

export class CreateServiceCategoryDto {
  @ApiProperty({ description: 'Category Code', example: 'SVC-GADGET' })
  @IsString()
  Code: string;

  @ApiProperty({ description: 'Category Name', example: 'Service Gadget' })
  @IsString()
  Name: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;

  @ApiPropertyOptional({ description: 'Default labor cost' })
  @IsOptional()
  @IsNumber()
  DefaultLaborCost?: number;
}

export class UpDateServiceCategoryDto {
  @ApiPropertyOptional({ description: 'Category Name' })
  @IsOptional()
  @IsString()
  Name?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;

  @ApiPropertyOptional({ description: 'Default labor cost' })
  @IsOptional()
  @IsNumber()
  DefaultLaborCost?: number;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE PACKAGE
// ─────────────────────────────────────────────────────────────────────────────

export class PackageItemDto {
  @ApiPropertyOptional({ description: 'Product ID (if using inventory product)' })
  @IsOptional()
  @IsNumber()
  ProductId?: number;

  @ApiProperty({ description: 'Item Name', example: 'LCD Replacement' })
  @IsString()
  ItemName: string;

  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  @Min(0.001)
  Quantity: number;

  @ApiPropertyOptional({ description: 'Unit price' })
  @IsOptional()
  @IsNumber()
  UnitPrice?: number;
}

export class CreateServicePackageDto {
  @ApiProperty({ description: 'Package Code', example: 'PKG-SCREEN-001' })
  @IsString()
  Code: string;

  @ApiProperty({ description: 'Package Name', example: 'Screen Replacement Package' })
  @IsString()
  Name: string;

  @ApiProperty({ description: 'Service category ID' })
  @IsNumber()
  ServiceCategoryId: number;

  @ApiPropertyOptional({ description: 'Estimated duration in minutes' })
  @IsOptional()
  @IsNumber()
  EstimatedDuration?: number;

  @ApiPropertyOptional({ description: 'Selling price' })
  @IsOptional()
  @IsNumber()
  SellingPrice?: number;

  @ApiPropertyOptional({ description: 'Cost price' })
  @IsOptional()
  @IsNumber()
  CostPrice?: number;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;

  @ApiPropertyOptional({ description: 'Package Items', type: [PackageItemDto] })
  @IsOptional()
  @IsArray()
  Items?: PackageItemDto[];
}

export class UpDateServicePackageDto {
  @ApiPropertyOptional({ description: 'Package Name' })
  @IsOptional()
  @IsString()
  Name?: string;

  @ApiPropertyOptional({ description: 'Service category ID' })
  @IsOptional()
  @IsNumber()
  ServiceCategoryId?: number;

  @ApiPropertyOptional({ description: 'Estimated duration in minutes' })
  @IsOptional()
  @IsNumber()
  EstimatedDuration?: number;

  @ApiPropertyOptional({ description: 'Selling price' })
  @IsOptional()
  @IsNumber()
  SellingPrice?: number;

  @ApiPropertyOptional({ description: 'Cost price' })
  @IsOptional()
  @IsNumber()
  CostPrice?: number;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;

  @ApiPropertyOptional({ description: 'Package Items', type: [PackageItemDto] })
  @IsOptional()
  @IsArray()
  Items?: PackageItemDto[];
}

export class ServicePackageFilterDto {
  @ApiPropertyOptional({ description: 'Service category ID' })
  @IsOptional()
  @IsNumber()
  ServiceCategoryId?: number;

  @ApiPropertyOptional({ description: 'Search by Code or Name' })
  @IsOptional()
  @IsString()
  Search?: string;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE PACKAGE QUOTE
// ─────────────────────────────────────────────────────────────────────────────

export class CalculatePackageQuoteDto {
  @ApiProperty({ description: 'Package ID' })
  @IsNumber()
  PackageId: number;

  @ApiPropertyOptional({ description: 'Custom Quantity multiplier' })
  @IsOptional()
  @IsNumber()
  Quantity?: number;

  @ApiPropertyOptional({ description: 'Apply discount percentage' })
  @IsOptional()
  @IsNumber()
  DiscountPercent?: number;
}

export class ComparePackagesDto {
  @ApiProperty({ description: 'Package IDs to compare', type: [Number] })
  @IsArray()
  PackageIds: number[];
}
