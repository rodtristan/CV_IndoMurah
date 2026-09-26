import { IsString, IsOptional, IsNumber, IsInt, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStockOpnameItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsInt()
  ProductID: number;

  @ApiProperty({ description: 'System stock' })
  @IsNumber()
  SystemStock: number;

  @ApiProperty({ description: 'Counted stock' })
  @IsNumber()
  CountedStock: number;

  @ApiProperty({ description: 'Difference' })
  @IsNumber()
  Difference: number;

  @ApiProperty({ description: 'Unit ID' })
  @IsInt()
  UnitID: number;

  @ApiPropertyOptional({ description: 'Unit price' })
  @IsOptional()
  @IsNumber()
  UnitPrice?: number;

  @ApiPropertyOptional({ description: 'Note' })
  @IsOptional()
  @IsString()
  Note?: string;
}

export class CreateStockOpnameDto {
  @ApiProperty({ description: 'Warehouse ID' })
  @IsInt()
  WarehouseID: number;

  @ApiPropertyOptional({ description: 'Stock opname date', type: String })
  @IsOptional()
  @IsDateString()
  Date?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;

  @ApiProperty({ description: 'Stock opname items', type: [CreateStockOpnameItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStockOpnameItemDto)
  Items: CreateStockOpnameItemDto[];

  @ApiPropertyOptional({ description: 'Kode Akun lawan persediaan' })
  @IsOptional()
  @IsInt()
  AccountID?: number | null;
}

export class UpdateStockOpnameDto {
  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsInt()
  WarehouseID?: number;

  @ApiPropertyOptional({ description: 'Stock opname date', type: String })
  @IsOptional()
  @IsDateString()
  Date?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;

  @ApiPropertyOptional({ description: 'Status ID' })
  @IsOptional()
  @IsInt()
  StatusID?: number;

  @ApiPropertyOptional({ description: 'Kode Akun lawan persediaan' })
  @IsOptional()
  @IsInt()
  AccountID?: number | null;
}

export class UpdateStockOpnameStatusDto {
  @ApiProperty({ description: 'New status code (e.g., DRAFT, IN_PROGRESS, COMPLETED, CANCELLED)' })
  @IsString()
  StatusCode: string;
}
