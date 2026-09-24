import { IsOptional, IsString, IsBoolean, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ImportItemSatuanDto {
  @IsString()
  Code: string;

  @IsString()
  Name: string;

  @IsOptional()
  @IsString()
  Barcode?: string;

  @IsNumber()
  PurchasePrice: number;

  @IsNumber()
  SalePrice: number;

  @IsOptional()
  @IsNumber()
  Hpp?: number;

  @IsOptional()
  @IsString()
  CategoryCode?: string;

  @IsOptional()
  @IsString()
  BrandName?: string;

  @IsOptional()
  @IsString()
  UnitName?: string;

  @IsOptional()
  @IsNumber()
  Stock?: number;

  @IsOptional()
  @IsNumber()
  MinimumStock?: number;

  @IsOptional()
  @IsString()
  WarehouseCode?: string;
}

export class ImportItemLevelDto {
  @IsString()
  Code: string;

  @IsString()
  Name: string;

  @IsOptional()
  @IsString()
  Barcode?: string;

  @IsNumber()
  PurchasePrice: number;

  @IsNumber()
  SalePrice1: number;

  @IsNumber()
  SalePrice2: number;

  @IsNumber()
  MinQty1: number;

  @IsNumber()
  MinQty2: number;

  @IsOptional()
  @IsNumber()
  SalePrice3?: number;

  @IsOptional()
  @IsNumber()
  MinQty3?: number;

  @IsOptional()
  @IsString()
  CategoryCode?: string;

  @IsOptional()
  @IsString()
  BrandName?: string;

  @IsOptional()
  @IsString()
  UnitName?: string;

  @IsOptional()
  @IsNumber()
  Stock?: number;
}

export class ImportItemJumlahDto {
  @IsString()
  Code: string;

  @IsString()
  Name: string;

  @IsOptional()
  @IsString()
  Barcode?: string;

  @IsNumber()
  PurchasePrice: number;

  @IsArray()
  @IsNumber({}, { each: true })
  SalePrices: number[];

  @IsArray()
  @IsNumber({}, { each: true })
  Quantities: number[];

  @IsOptional()
  @IsString()
  CategoryCode?: string;

  @IsOptional()
  @IsString()
  BrandName?: string;

  @IsOptional()
  @IsString()
  BaseUnit?: string;

  @IsOptional()
  @IsString()
  ChildUnit?: string;

  @IsOptional()
  @IsNumber()
  Conversion?: number;

  @IsOptional()
  @IsNumber()
  Stock?: number;
}

export class ValidateImportDto {
  @IsString()
  type: 'satuan' | 'level' | 'jumlah';

  @IsArray()
  data: any[];
}

export class ImportResultDto {
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: ImportErrorDto[];
  createdItems: number[];
  updatedItems: number[];
}

export class ImportErrorDto {
  row: number;
  field: string;
  message: string;
  value: any;
}

export class ImportProgressDto {
  importId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalRows: number;
  processedRows: number;
  successCount: number;
  errorCount: number;
  errors: ImportErrorDto[];
  startedAt: Date;
  completedAt?: Date;
}
