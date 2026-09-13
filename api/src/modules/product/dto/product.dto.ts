import { IsString, IsOptional, IsBoolean, IsInt, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ description: 'Unique product code' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: 'Product barcode' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({ description: 'Product name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsInt()
  categoryId?: number;

  @ApiProperty({ description: 'Unit ID (required)' })
  @IsInt()
  unitId: number;

  @ApiPropertyOptional({ description: 'Brand ID' })
  @IsOptional()
  @IsInt()
  brandId?: number;

  @ApiPropertyOptional({ description: 'Default warehouse ID' })
  @IsOptional()
  @IsInt()
  warehouseId?: number;

  @ApiProperty({ description: 'Purchase price' })
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  purchasePrice: number;

  @ApiProperty({ description: 'Selling price' })
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  sellingPrice: number;

  @ApiPropertyOptional({ description: 'Initial stock quantity', default: 0 })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  stock?: number;

  @ApiPropertyOptional({ description: 'Minimum stock level for alerts', default: 0 })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  minimumStock?: number;

  @ApiPropertyOptional({ description: 'Discount percent' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  discountPercent?: number;

  @ApiPropertyOptional({ description: 'Product image URL' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: 'Product description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: true, description: 'Is product active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ description: 'Unique product code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'Product barcode' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional({ description: 'Product name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional({ description: 'Unit ID' })
  @IsOptional()
  @IsInt()
  unitId?: number;

  @ApiPropertyOptional({ description: 'Brand ID' })
  @IsOptional()
  @IsInt()
  brandId?: number;

  @ApiPropertyOptional({ description: 'Default warehouse ID' })
  @IsOptional()
  @IsInt()
  warehouseId?: number;

  @ApiPropertyOptional({ description: 'Purchase price' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  purchasePrice?: number;

  @ApiPropertyOptional({ description: 'Selling price' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  sellingPrice?: number;

  @ApiPropertyOptional({ description: 'Minimum stock level for alerts' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  minimumStock?: number;

  @ApiPropertyOptional({ description: 'Discount percent' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  discountPercent?: number;

  @ApiPropertyOptional({ description: 'Product image URL' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: 'Product description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Is product active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AdjustStockDto {
  @ApiProperty({ description: 'Quantity to adjust (positive to add, negative to subtract)' })
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  quantity: number;

  @ApiPropertyOptional({ description: 'Warehouse ID for warehouse-specific stock' })
  @IsOptional()
  @IsInt()
  warehouseId?: number;

  @ApiPropertyOptional({ description: 'Reason for adjustment' })
  @IsOptional()
  @IsString()
  reason?: string;
}
