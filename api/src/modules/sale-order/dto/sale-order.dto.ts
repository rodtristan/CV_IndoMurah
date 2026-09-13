import { IsString, IsOptional, IsNumber, IsInt, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSaleOrderItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsInt()
  product_id: number;

  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Unit ID' })
  @IsInt()
  unit_id: number;

  @ApiProperty({ description: 'Price per unit' })
  @IsNumber()
  price: number;

  @ApiPropertyOptional({ description: 'Discount amount' })
  @IsOptional()
  @IsNumber()
  discount?: number;
}

export class CreateSaleOrderDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsInt()
  customer_id: number;

  @ApiPropertyOptional({ description: 'Sales person ID' })
  @IsOptional()
  @IsInt()
  sales_person_id?: number;

  @ApiPropertyOptional({ description: 'Sale order date' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ description: 'Due date' })
  @IsOptional()
  @IsDateString()
  due_date?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Items', type: [CreateSaleOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleOrderItemDto)
  items: CreateSaleOrderItemDto[];
}

export class UpdateSaleOrderDto {
  @ApiPropertyOptional({ description: 'Customer ID' })
  @IsOptional()
  @IsInt()
  customer_id?: number;

  @ApiPropertyOptional({ description: 'Sales person ID' })
  @IsOptional()
  @IsInt()
  sales_person_id?: number;

  @ApiPropertyOptional({ description: 'Sale order date' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ description: 'Due date' })
  @IsOptional()
  @IsDateString()
  due_date?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateStatusDto {
  @ApiProperty({ description: 'New status: confirmed, completed, cancelled' })
  @IsString()
  status: string;
}

export class AddSaleOrderItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsInt()
  product_id: number;

  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Unit ID' })
  @IsInt()
  unit_id: number;

  @ApiProperty({ description: 'Price per unit' })
  @IsNumber()
  price: number;

  @ApiPropertyOptional({ description: 'Discount amount' })
  @IsOptional()
  @IsNumber()
  discount?: number;
}
