import { IsString, IsOptional, IsNumber, IsInt, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSaleReturnItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsInt()
  ProductID: number;

  @ApiProperty({ description: 'Quantity to return' })
  @IsNumber()
  Quantity: number;

  @ApiPropertyOptional({ description: 'Unit ID' })
  @IsOptional()
  @IsInt()
  UnitID?: number;

  @ApiProperty({ description: 'Unit price' })
  @IsNumber()
  UnitPrice: number;

  @ApiPropertyOptional({ description: 'Subtotal' })
  @IsOptional()
  @IsNumber()
  Subtotal?: number;
}

export class CreateSaleReturnDto {
  @ApiProperty({ description: 'Sale ID' })
  @IsInt()
  SaleID: number;

  @ApiPropertyOptional({ description: 'Customer ID (auto-filled from sale)' })
  @IsOptional()
  @IsInt()
  CustomerID?: number;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsInt()
  WarehouseID?: number;

  @ApiPropertyOptional({ description: 'Return date' })
  @IsOptional()
  @IsDateString()
  Date?: string;

  @ApiPropertyOptional({ description: 'Return reason' })
  @IsOptional()
  @IsString()
  Reason?: string;

  @ApiProperty({ description: 'Return items', type: [CreateSaleReturnItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleReturnItemDto)
  Items: CreateSaleReturnItemDto[];
}

export class UpdateSaleReturnDto {
  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsInt()
  WarehouseID?: number;

  @ApiPropertyOptional({ description: 'Return date' })
  @IsOptional()
  @IsDateString()
  Date?: string;

  @ApiPropertyOptional({ description: 'Return reason' })
  @IsOptional()
  @IsString()
  Reason?: string;

  @ApiPropertyOptional({ description: 'Status ID' })
  @IsOptional()
  @IsInt()
  StatusID?: number;
}

export class UpdateSaleReturnStatusDto {
  @ApiProperty({ description: 'New status code: DRAFT, CONFIRMED, COMPLETED, CANCELLED' })
  @IsString()
  StatusCode: string;
}
