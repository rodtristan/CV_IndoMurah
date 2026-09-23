import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsNumber, IsOptional, IsString, ValidateNested, Min } from 'class-validator';

export class ProductionRequestItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNumber()
  ProductId: number;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @ApiPropertyOptional({ description: 'Unit ID' })
  @IsOptional()
  @IsNumber()
  UnitId?: number;

  @ApiProperty({ description: 'Quantity needed' })
  @IsNumber()
  @Min(0.0001)
  Quantity: number;

  @ApiPropertyOptional({ description: 'Price per unit' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  Price?: number;
}

export class CreateProductionRequestDto {
  @ApiPropertyOptional({ description: 'Supplier ID (optional, for outsourcing)' })
  @IsOptional()
  @IsNumber()
  SupplierId?: number;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @ApiPropertyOptional({ description: 'Request Date' })
  @IsOptional()
  @IsDateString()
  RequestDate?: string;

  @ApiPropertyOptional({ description: 'Status: PENDING, APPROVED, REJECTED' })
  @IsOptional()
  @IsString()
  Status?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;

  @ApiProperty({ description: 'Request Items', type: [ProductionRequestItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductionRequestItemDto)
  Items: ProductionRequestItemDto[];
}

export class ProductionRequestFilterDto {
  @ApiPropertyOptional({ description: 'Supplier ID filter' })
  @IsOptional()
  @IsNumber()
  SupplierId?: number;

  @ApiPropertyOptional({ description: 'Warehouse ID filter' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @ApiPropertyOptional({ description: 'Status filter' })
  @IsOptional()
  @IsString()
  Status?: string;

  @ApiPropertyOptional({ description: 'Start Date filter' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date filter' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;
}
