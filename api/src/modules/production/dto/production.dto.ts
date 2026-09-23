import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductionDto {
  @ApiProperty({ description: 'code' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: 'date' })
  @IsOptional()
  date?: Date;

  @ApiPropertyOptional({ description: 'productId' })
  @IsOptional()
  @IsNumber()
  productId?: number;

  @ApiPropertyOptional({ description: 'productName' })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiPropertyOptional({ description: 'quantity' })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional({ description: 'warehouseId' })
  @IsOptional()
  @IsNumber()
  warehouseId?: number;

  @ApiPropertyOptional({ description: 'rawMaterialCost' })
  @IsOptional()
  @IsNumber()
  rawMaterialCost?: number;

  @ApiPropertyOptional({ description: 'laborCost' })
  @IsOptional()
  @IsNumber()
  laborCost?: number;

  @ApiPropertyOptional({ description: 'overheadCost' })
  @IsOptional()
  @IsNumber()
  overheadCost?: number;

  @ApiPropertyOptional({ description: 'totalCost' })
  @IsOptional()
  @IsNumber()
  totalCost?: number;

  @ApiProperty({ description: 'status' })
  status: any;

  @ApiPropertyOptional({ description: 'notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'isActive' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;


}

export class UpdateProductionDto {
  @ApiPropertyOptional({ description: 'code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'date' })
  @IsOptional()
  date?: Date;

  @ApiPropertyOptional({ description: 'productId' })
  @IsOptional()
  @IsNumber()
  productId?: number;

  @ApiPropertyOptional({ description: 'productName' })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiPropertyOptional({ description: 'quantity' })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional({ description: 'warehouseId' })
  @IsOptional()
  @IsNumber()
  warehouseId?: number;

  @ApiPropertyOptional({ description: 'rawMaterialCost' })
  @IsOptional()
  @IsNumber()
  rawMaterialCost?: number;

  @ApiPropertyOptional({ description: 'laborCost' })
  @IsOptional()
  @IsNumber()
  laborCost?: number;

  @ApiPropertyOptional({ description: 'overheadCost' })
  @IsOptional()
  @IsNumber()
  overheadCost?: number;

  @ApiPropertyOptional({ description: 'totalCost' })
  @IsOptional()
  @IsNumber()
  totalCost?: number;

  @ApiPropertyOptional({ description: 'status' })
  @IsOptional()
  status?: any;

  @ApiPropertyOptional({ description: 'notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'isActive' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;


}

export class ProductionResponseDto {
  @ApiProperty({ description: 'code' })
  code: string;

  @ApiProperty({ description: 'date' })
  date: Date;

  @ApiProperty({ description: 'productId' })
  productId: number;

  @ApiProperty({ description: 'productName' })
  productName: string;

  @ApiProperty({ description: 'quantity' })
  quantity: number;

  @ApiProperty({ description: 'warehouseId' })
  warehouseId: number;

  @ApiProperty({ description: 'rawMaterialCost' })
  rawMaterialCost: number;

  @ApiProperty({ description: 'laborCost' })
  laborCost: number;

  @ApiProperty({ description: 'overheadCost' })
  overheadCost: number;

  @ApiProperty({ description: 'totalCost' })
  totalCost: number;

  @ApiProperty({ description: 'status' })
  status: any;

  @ApiProperty({ description: 'notes' })
  notes: string;

  @ApiProperty({ description: 'isActive' })
  isActive: boolean;

  @ApiProperty({ description: 'warehouse' })
  warehouse: any;

  @ApiProperty({ description: 'product' })
  product: any;

}

export class QueryProductionDto {
  @ApiPropertyOptional({ description: 'Fields to select' })
  @IsOptional()
  @IsString()
  $select?: string;

  @ApiPropertyOptional({ description: 'Relations to include' })
  @IsOptional()
  @IsString()
  $include?: string;

  @ApiPropertyOptional({ description: 'Number of records to skip' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  $skip?: number;

  @ApiPropertyOptional({ description: 'Number of records to take' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  $take?: number;

  @ApiPropertyOptional({ description: 'Search keyword' })
  @IsOptional()
  @IsString()
  $search?: string;
}
