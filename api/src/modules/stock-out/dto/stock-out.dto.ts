import { IsString, IsOptional, IsNumber, IsInt, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStockOutItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsInt()
  ProductID: number;

  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  Quantity: number;

  @ApiProperty({ description: 'Unit ID' })
  @IsInt()
  UnitID: number;

  @ApiProperty({ description: 'Unit price' })
  @IsNumber()
  UnitPrice: number;

  @ApiPropertyOptional({ description: 'Subtotal' })
  @IsOptional()
  @IsNumber()
  Subtotal?: number;
}

export class CreateStockOutDto {
  @ApiProperty({ description: 'Warehouse ID' })
  @IsInt()
  WarehouseID: number;

  @ApiPropertyOptional({ description: 'Reference type ID' })
  @IsOptional()
  @IsInt()
  ReferenceTypeID?: number;

  @ApiPropertyOptional({ description: 'Reference ID' })
  @IsOptional()
  @IsInt()
  ReferenceID?: number;

  @ApiPropertyOptional({ description: 'Stock out date', type: String })
  @IsOptional()
  @IsDateString()
  Date?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;

  @ApiProperty({ description: 'Stock out items', type: [CreateStockOutItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStockOutItemDto)
  Items: CreateStockOutItemDto[];
}

export class UpdateStockOutDto {
  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsInt()
  WarehouseID?: number;

  @ApiPropertyOptional({ description: 'Stock out date', type: String })
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
}

export class UpdateStockOutStatusDto {
  @ApiProperty({ description: 'New status code (e.g., DRAFT, CONFIRMED, COMPLETED, CANCELLED)' })
  @IsString()
  StatusCode: string;
}
