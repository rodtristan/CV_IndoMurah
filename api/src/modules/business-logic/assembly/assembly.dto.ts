import { IsOptional, IsString, IsNumber, IsDateString, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// ─────────────────────────────────────────────────────────────────────────────
// ASSEMBLY / RAKITAN
// ─────────────────────────────────────────────────────────────────────────────

export class AssemblyItemDto {
  @IsNumber()
  ProductId: number;

  @IsNumber()
  Quantity: number;

  @IsOptional()
  @IsNumber()
  UnitId?: number;

  @IsOptional()
  @IsNumber()
  UnitPrice?: number;
}

export class CreateAssemblyDto {
  @IsDateString()
  AssemblyDate: string;

  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @IsString()
  Description: string;

  @IsOptional()
  @IsString()
  ReferenceNumber?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssemblyItemDto)
  Components: AssemblyItemDto[];

  @IsOptional()
  @IsString()
  Notes?: string;
}

export class UpdateAssemblyDto {
  @IsOptional()
  @IsString()
  Description?: string;

  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @IsOptional()
  @IsString()
  Notes?: string;
}

export class AssemblyFilterDto {
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  Search?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// BILL OF MATERIALS / KOMPOSISI
// ─────────────────────────────────────────────────────────────────────────────

export class BOMItemDto {
  @IsNumber()
  ProductId: number;

  @IsNumber()
  Quantity: number;

  @IsOptional()
  @IsNumber()
  UnitId?: number;

  @IsOptional()
  @IsNumber()
  WastePercent?: number; // Persentase waste/susut
}

export class CreateBOMDto {
  @IsString()
  Name: string;

  @IsOptional()
  @IsString()
  Code?: string;

  @IsOptional()
  @IsNumber()
  ProductId?: number; // Output product (result of assembly)

  @IsOptional()
  @IsNumber()
  QuantityProduced?: number; // Default Quantity when using this BOM

  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @IsOptional()
  @IsString()
  Description?: string;

  @IsOptional()
  @IsNumber()
  DefaultCost?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BOMItemDto)
  Items: BOMItemDto[];

  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;
}

export class UpdateBOMDto {
  @IsOptional()
  @IsString()
  Name?: string;

  @IsOptional()
  @IsNumber()
  ProductId?: number;

  @IsOptional()
  @IsNumber()
  QuantityProduced?: number;

  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @IsOptional()
  @IsString()
  Description?: string;

  @IsOptional()
  @IsNumber()
  DefaultCost?: number;

  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BOMItemDto)
  Items?: BOMItemDto[];
}

export class BOMFilterDto {
  @IsOptional()
  @IsString()
  Search?: string;

  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;

  @IsOptional()
  @IsNumber()
  ProductId?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// ASSEMBLY USING BOM
// ─────────────────────────────────────────────────────────────────────────────

export class AssembleFromBOMDto {
  @IsNumber()
  BOMId: number;

  @IsDateString()
  AssemblyDate: string;

  @IsNumber()
  Quantity: number;

  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @IsOptional()
  @IsString()
  Notes?: string;

  @IsOptional()
  @IsBoolean()
  AutoAssembly?: boolean; // If true, automatically create semi-finished goods
}

// ─────────────────────────────────────────────────────────────────────────────
// BOM COSTING
// ─────────────────────────────────────────────────────────────────────────────

export class CalculateBOMCostDto {
  @IsOptional()
  @IsNumber()
  BOMId?: number;

  @IsOptional()
  @IsNumber()
  ProductId?: number;

  @IsOptional()
  @IsNumber()
  Quantity?: number;
}

export class CompareBOMDto {
  @IsNumber()
  BOMId1: number;

  @IsNumber()
  BOMId2: number;
}
