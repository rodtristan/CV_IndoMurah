import { ArrayMaxSize, IsArray, IsBoolean, IsIn, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export const ITEM_TYPES = ['GOODS', 'ASSEMBLY', 'SERVICE', 'NON_INVENTORY', 'EXPENSE'] as const;

/** Satu baris tab "Potongan Harga Jual": grup pelanggan + potongan bertingkat 1-4 (%). */
export class GroupDiscountDto {
  @IsInt() groupId: number;
  @IsNumber() @Min(0) @Max(100) p1: number;
  @IsNumber() @Min(0) @Max(100) p2: number;
  @IsNumber() @Min(0) @Max(100) p3: number;
  @IsNumber() @Min(0) @Max(100) p4: number;
}

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

  // ── Ketoko: form Item lengkap ──
  @ApiPropertyOptional({ enum: ITEM_TYPES, description: 'Tipe Item' })
  @IsOptional() @IsIn(ITEM_TYPES as unknown as string[]) itemType?: string;

  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasSerial?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) SKU?: string | null;
  @ApiPropertyOptional({ description: 'Rak' }) @IsOptional() @IsString() @MaxLength(100) shelf?: string | null;
  @ApiPropertyOptional({ description: 'Pajak Include %' }) @IsOptional() @IsNumber() @Min(0) @Max(100) taxIncludePercent?: number;
  @ApiPropertyOptional({ description: 'Status Jual (true = masih dijual)' }) @IsOptional() @IsBoolean() isSold?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsInt() supplierId?: number | null;
  @ApiPropertyOptional({ description: 'Poin' }) @IsOptional() @IsNumber() @Min(0) point?: number;
  @ApiPropertyOptional({ description: 'Komisi Sales' }) @IsOptional() @IsNumber() @Min(0) salesCommission?: number;

  @ApiPropertyOptional({ description: 'Berat (gram)' }) @IsOptional() @IsNumber() @Min(0) weight?: number;
  @ApiPropertyOptional({ description: 'Panjang (cm)' }) @IsOptional() @IsNumber() @Min(0) length?: number;
  @ApiPropertyOptional({ description: 'Lebar (cm)' }) @IsOptional() @IsNumber() @Min(0) width?: number;
  @ApiPropertyOptional({ description: 'Tinggi (cm)' }) @IsOptional() @IsNumber() @Min(0) height?: number;

  @ApiPropertyOptional({ type: [GroupDiscountDto], description: 'Potongan Harga Jual per grup' })
  @IsOptional() @IsArray() @ArrayMaxSize(50) @ValidateNested({ each: true }) @Type(() => GroupDiscountDto)
  groupDiscounts?: GroupDiscountDto[] | null;

  @ApiPropertyOptional() @IsOptional() @IsInt() cogsAccountId?: number | null;
  @ApiPropertyOptional() @IsOptional() @IsInt() salesAccountId?: number | null;
  @ApiPropertyOptional() @IsOptional() @IsInt() serviceIncomeAccountId?: number | null;
  @ApiPropertyOptional() @IsOptional() @IsInt() inventoryAccountId?: number | null;
  @ApiPropertyOptional() @IsOptional() @IsInt() nonInventoryAccountId?: number | null;
  @ApiPropertyOptional() @IsOptional() @IsInt() otherInventoryAccountId?: number | null;
  @ApiPropertyOptional() @IsOptional() @IsInt() laborCostAccountId?: number | null;
  @ApiPropertyOptional() @IsOptional() @IsInt() overheadAccountId?: number | null;

  @ApiPropertyOptional() @IsOptional() @IsBoolean() shareEnabled?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50) youtubeId?: string | null;
  @ApiPropertyOptional({ enum: ['NEW', 'USED'] }) @IsOptional() @IsIn(['NEW', 'USED']) condition?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() shareWarehouseId?: number | null;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(20000) shareDescription?: string | null;

  @ApiPropertyOptional({ enum: ['PPN', 'PPNBM', 'NON'] }) @IsOptional() @IsIn(['PPN', 'PPNBM', 'NON']) taxType?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(6) taxRefCode?: string | null;
  @ApiPropertyOptional({ enum: ['GOODS', 'SERVICE'] }) @IsOptional() @IsIn(['GOODS', 'SERVICE']) taxGoodsService?: string | null;
}

/** Update: semua field Create kecuali stok (stok hanya berubah lewat transaksi / penyesuaian). */
export class UpdateProductDto extends PartialType(OmitType(CreateProductDto, ['stock'] as const)) {}

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
