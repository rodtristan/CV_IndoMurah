import { IsString, IsOptional, IsNumber, IsInt, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSaleOrderItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsInt()
  productId: number;

  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Unit ID' })
  @IsInt()
  unitId: number;

  @ApiProperty({ description: 'Price per unit' })
  @IsNumber()
  unitPrice: number;

  @ApiPropertyOptional({ description: 'Discount amount' })
  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @ApiPropertyOptional({ description: 'Discount percent' })
  @IsOptional()
  @IsNumber()
  discountPercent?: number;
}

export class CreateSaleOrderDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsInt()
  customerId: number;

  @ApiPropertyOptional({ description: 'Sales person ID' })
  @IsOptional()
  @IsInt()
  salesPersonId?: number;

  @ApiPropertyOptional({ description: 'Sale order date' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ description: 'Due date' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

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
  customerId?: number;

  @ApiPropertyOptional({ description: 'Sales person ID' })
  @IsOptional()
  @IsInt()
  salesPersonId?: number;

  @ApiPropertyOptional({ description: 'Sale order date' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ description: 'Due date' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateStatusDto {
  @ApiProperty({ description: 'New status: DRAFT, CONFIRMED, COMPLETED, CANCELLED' })
  @IsString()
  status: string;
}

export class AddSaleOrderItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsInt()
  productId: number;

  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Unit ID' })
  @IsInt()
  unitId: number;

  @ApiProperty({ description: 'Price per unit' })
  @IsNumber()
  unitPrice: number;

  @ApiPropertyOptional({ description: 'Discount amount' })
  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @ApiPropertyOptional({ description: 'Discount percent' })
  @IsOptional()
  @IsNumber()
  discountPercent?: number;
}
