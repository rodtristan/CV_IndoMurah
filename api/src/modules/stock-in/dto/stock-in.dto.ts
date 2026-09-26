import { IsString, IsOptional, IsNumber, IsInt, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStockInItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsInt()
  ProductID: number;

  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  Quantity: number;

  @ApiProperty({ description: 'Unit ID' })
  @IsInt()
  UnitID: number;

  @ApiPropertyOptional({ description: 'Unit price' })
  @IsOptional()
  @IsNumber()
  UnitPrice?: number;

  @ApiPropertyOptional({ description: 'Subtotal' })
  @IsOptional()
  @IsNumber()
  Subtotal?: number;
}

export class CreateStockInDto {
  @ApiProperty({ description: 'Warehouse ID' })
  @IsInt()
  WarehouseID: number;

  @ApiPropertyOptional({ description: 'Supplier ID' })
  @IsOptional()
  @IsInt()
  SupplierID?: number;

  @ApiPropertyOptional({ description: 'Reference type ID' })
  @IsOptional()
  @IsInt()
  ReferenceTypeID?: number;

  @ApiPropertyOptional({ description: 'Reference ID' })
  @IsOptional()
  @IsInt()
  ReferenceID?: number;

  @ApiPropertyOptional({ description: 'Stock in date', type: String })
  @IsOptional()
  @IsDateString()
  Date?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;

  @ApiProperty({ description: 'Stock in items', type: [CreateStockInItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStockInItemDto)
  Items: CreateStockInItemDto[];

  @ApiPropertyOptional({ description: 'Kode Akun lawan persediaan' })
  @IsOptional()
  @IsInt()
  AccountID?: number | null;
}

export class UpdateStockInDto {
  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsInt()
  WarehouseID?: number;

  @ApiPropertyOptional({ description: 'Supplier ID' })
  @IsOptional()
  @IsInt()
  SupplierID?: number;

  @ApiPropertyOptional({ description: 'Stock in date', type: String })
  @IsOptional()
  @IsDateString()
  Date?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;

  @ApiPropertyOptional({ description: 'Status ID' })
  @IsOptional()
  @IsInt()
  StatusID?: number;

  @ApiPropertyOptional({ description: 'Kode Akun lawan persediaan' })
  @IsOptional()
  @IsInt()
  AccountID?: number | null;

  @ApiPropertyOptional({ type: [CreateStockInItemDto], description: 'Mengganti seluruh item' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStockInItemDto)
  Items?: CreateStockInItemDto[];
}

export class UpdateStockInStatusDto {
  @ApiProperty({ description: 'New status code (e.g., DRAFT, CONFIRMED, COMPLETED, CANCELLED)' })
  @IsString()
  StatusCode: string;
}
