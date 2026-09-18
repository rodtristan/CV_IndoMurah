import { IsString, IsOptional, IsNumber, IsInt, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStockTransferItemDto {
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

export class CreateStockTransferDto {
  @ApiProperty({ description: 'From warehouse ID' })
  @IsInt()
  FromWarehouseID: number;

  @ApiProperty({ description: 'To warehouse ID' })
  @IsInt()
  ToWarehouseID: number;

  @ApiPropertyOptional({ description: 'Transfer date', type: String })
  @IsOptional()
  @IsDateString()
  Date?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;

  @ApiProperty({ description: 'Transfer items', type: [CreateStockTransferItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStockTransferItemDto)
  Items: CreateStockTransferItemDto[];
}

export class UpdateStockTransferDto {
  @ApiPropertyOptional({ description: 'From warehouse ID' })
  @IsOptional()
  @IsInt()
  FromWarehouseID?: number;

  @ApiPropertyOptional({ description: 'To warehouse ID' })
  @IsOptional()
  @IsInt()
  ToWarehouseID?: number;

  @ApiPropertyOptional({ description: 'Transfer date', type: String })
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
}

export class UpdateStockTransferStatusDto {
  @ApiProperty({ description: 'New status code (e.g., DRAFT, CONFIRMED, COMPLETED, CANCELLED)' })
  @IsString()
  StatusCode: string;
}
