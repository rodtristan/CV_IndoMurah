import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested, Min } from 'class-validator';

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT UNIT DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class ProductUnitItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNumber()
  ProductId: number;

  @ApiProperty({ description: 'Unit ID' })
  @IsNumber()
  UnitId: number;

  @ApiPropertyOptional({ description: 'Is base unit' })
  @IsOptional()
  @IsBoolean()
  isBase?: boolean;

  @ApiPropertyOptional({ description: 'Conversion value from base unit' })
  @IsOptional()
  @IsNumber()
  @Min(0.0001)
  ConversionValue?: number;

  @ApiPropertyOptional({ description: 'Is primary unit' })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ description: 'Can be used for selling' })
  @IsOptional()
  @IsBoolean()
  isSell?: boolean;

  @ApiPropertyOptional({ description: 'Can be used for purchase' })
  @IsOptional()
  @IsBoolean()
  isPurchase?: boolean;
}

export class CreateProductUnitDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNumber()
  ProductId: number;

  @ApiProperty({ description: 'Unit configurations', type: [ProductUnitItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductUnitItemDto)
  Units: ProductUnitItemDto[];
}

export class ProductUnitFilterDto {
  @ApiPropertyOptional({ description: 'Product ID filter' })
  @IsOptional()
  @IsNumber()
  ProductId?: number;

  @ApiPropertyOptional({ description: 'Unit ID filter' })
  @IsOptional()
  @IsNumber()
  UnitId?: number;

  @ApiPropertyOptional({ description: 'Primary only' })
  @IsOptional()
  @IsBoolean()
  PrimaryOnly?: boolean;
}

export class ConvertUnitDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNumber()
  ProductId: number;

  @ApiProperty({ description: 'Quantity to convert' })
  @IsNumber()
  @Min(0.0001)
  Quantity: number;

  @ApiProperty({ description: 'Source unit ID' })
  @IsNumber()
  FromUnitId: number;

  @ApiProperty({ description: 'Target unit ID' })
  @IsNumber()
  ToUnitId: number;
}
