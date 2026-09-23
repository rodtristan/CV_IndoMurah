import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  Min,
  IsNotEmpty,
} from 'class-validator';

export class CreateWarehouseDto {
  @ApiProperty({ description: 'Warehouse Code' })
  @IsString()
  @IsNotEmpty()
  Code: string;

  @ApiProperty({ description: 'Warehouse Name' })
  @IsString()
  @IsNotEmpty()
  Name: string;

  @ApiPropertyOptional({ description: 'Warehouse address' })
  @IsOptional()
  @IsString()
  Address?: string;

  @ApiPropertyOptional({ description: 'Contact phone' })
  @IsOptional()
  @IsString()
  Phone?: string;

  @ApiPropertyOptional({ description: 'Set as default warehouse' })
  @IsOptional()
  @IsBoolean()
  IsDefault?: boolean;
}

export class UpDateWarehouseDto {
  @ApiPropertyOptional({ description: 'Warehouse Name' })
  @IsOptional()
  @IsString()
  Name?: string;

  @ApiPropertyOptional({ description: 'Warehouse address' })
  @IsOptional()
  @IsString()
  Address?: string;

  @ApiPropertyOptional({ description: 'Contact phone' })
  @IsOptional()
  @IsString()
  Phone?: string;

  @ApiPropertyOptional({ description: 'Set as default warehouse' })
  @IsOptional()
  @IsBoolean()
  IsDefault?: boolean;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;
}

export class WarehouseFilterDto {
  @ApiPropertyOptional({ description: 'Search keyword' })
  @IsOptional()
  @IsString()
  Search?: string;

  @ApiPropertyOptional({ description: 'Include inactive' })
  @IsOptional()
  @IsBoolean()
  IncludeInactive?: boolean;
}

export class WarehouseStockDto {
  @ApiPropertyOptional({ description: 'Product ID filter' })
  @IsOptional()
  @IsNumber()
  ProductId?: number;

  @ApiPropertyOptional({ description: 'Category ID filter' })
  @IsOptional()
  @IsNumber()
  CategoryId?: number;

  @ApiPropertyOptional({ description: 'Show only low stock' })
  @IsOptional()
  @IsBoolean()
  LowStockOnly?: boolean;

  @ApiPropertyOptional({ description: 'Page number' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  Page?: number;

  @ApiPropertyOptional({ description: 'Page size' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  Limit?: number;
}

export class CreateShelfDto {
  @ApiProperty({ description: 'Warehouse ID' })
  @IsNumber()
  WarehouseId: number;

  @ApiProperty({ description: 'Shelf Code' })
  @IsString()
  @IsNotEmpty()
  Code: string;

  @ApiProperty({ description: 'Shelf Name' })
  @IsString()
  @IsNotEmpty()
  Name: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;
}

export class UpDateShelfDto {
  @ApiPropertyOptional({ description: 'Shelf Name' })
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
