import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  Min,
  IsNotEmpty,
} from 'class-validator';

// ─────────────────────────────────────────────────────────────────────────────
// ASSET MANAGEMENT DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class CreateAssetDto {
  @ApiProperty({ description: 'Asset Code' })
  @IsString()
  @IsNotEmpty()
  Code: string;

  @ApiProperty({ description: 'Asset Name' })
  @IsString()
  @IsNotEmpty()
  Name: string;

  @ApiPropertyOptional({ description: 'Asset category ID' })
  @IsOptional()
  @IsNumber()
  CategoryId?: number;

  @ApiPropertyOptional({ description: 'Purchase Date' })
  @IsOptional()
  @IsDateString()
  PurchaseDate?: string;

  @ApiProperty({ description: 'Purchase price' })
  @IsNumber()
  @Min(0)
  PurchasePrice: number;

  @ApiPropertyOptional({ description: 'Depreciation method ID' })
  @IsOptional()
  @IsNumber()
  DepreciationMethodId?: number;

  @ApiPropertyOptional({ description: 'Useful life in years' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  UsefulLifeYears?: number;

  @ApiPropertyOptional({ description: 'Location' })
  @IsOptional()
  @IsString()
  Location?: string;

  @ApiPropertyOptional({ description: 'Assigned to' })
  @IsOptional()
  @IsString()
  AssignedTo?: string;

  @ApiPropertyOptional({ description: 'Serial number' })
  @IsOptional()
  @IsString()
  SerialNumber?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class UpDateAssetDto {
  @ApiPropertyOptional({ description: 'Asset Name' })
  @IsOptional()
  @IsString()
  Name?: string;

  @ApiPropertyOptional({ description: 'Asset category ID' })
  @IsOptional()
  @IsNumber()
  CategoryId?: number;

  @ApiPropertyOptional({ description: 'Useful life in years' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  UsefulLifeYears?: number;

  @ApiPropertyOptional({ description: 'Current value' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  CurrentValue?: number;

  @ApiPropertyOptional({ description: 'Location' })
  @IsOptional()
  @IsString()
  Location?: string;

  @ApiPropertyOptional({ description: 'Assigned to' })
  @IsOptional()
  @IsString()
  AssignedTo?: string;

  @ApiPropertyOptional({ description: 'Serial number' })
  @IsOptional()
  @IsString()
  SerialNumber?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;

  @ApiPropertyOptional({ description: 'Status ID' })
  @IsOptional()
  @IsNumber()
  StatusId?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class AssetFilterDto {
  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsNumber()
  CategoryId?: number;

  @ApiPropertyOptional({ description: 'Status ID' })
  @IsOptional()
  @IsNumber()
  StatusId?: number;

  @ApiPropertyOptional({ description: 'Location filter' })
  @IsOptional()
  @IsString()
  Location?: string;

  @ApiPropertyOptional({ description: 'Search keyword' })
  @IsOptional()
  @IsString()
  Search?: string;

  @ApiPropertyOptional({ description: 'Show active only', default: true })
  @IsOptional()
  @IsBoolean()
  ActiveOnly?: boolean;
}

export class CalculateDepreciationDto {
  @ApiPropertyOptional({ description: 'Asset ID' })
  @IsOptional()
  @IsNumber()
  AssetId?: number;

  @ApiPropertyOptional({ description: 'As of Date' })
  @IsOptional()
  @IsDateString()
  AsOfDate?: string;
}

export class DisposeAssetDto {
  @ApiProperty({ description: 'Disposal Date' })
  @IsDateString()
  Date: string;

  @ApiProperty({ description: 'Disposal value/proceeds' })
  @IsNumber()
  @Min(0)
  DisposalValue: number;

  @ApiProperty({ description: 'Disposal reason' })
  @IsString()
  @IsNotEmpty()
  Reason: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class TransferAssetDto {
  @ApiProperty({ description: 'New location' })
  @IsString()
  @IsNotEmpty()
  NewLocation: string;

  @ApiPropertyOptional({ description: 'New assigned person' })
  @IsOptional()
  @IsString()
  NewAssignedTo?: string;

  @ApiPropertyOptional({ description: 'Transfer Date' })
  @IsOptional()
  @IsDateString()
  Date?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class AssetDepreciationReportDto {
  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsNumber()
  CategoryId?: number;

  @ApiPropertyOptional({ description: 'As of Date' })
  @IsOptional()
  @IsDateString()
  AsOfDate?: string;
}

export class AssetValuationDto {
  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsNumber()
  CategoryId?: number;

  @ApiPropertyOptional({ description: 'As of Date' })
  @IsOptional()
  @IsDateString()
  AsOfDate?: string;
}
