import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductStockDto {
  @ApiProperty({ description: 'productId' })
  @IsNumber()
  productId: number;

  @ApiProperty({ description: 'warehouseId' })
  @IsNumber()
  warehouseId: number;

  @ApiPropertyOptional({ description: 'quantity' })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional({ description: 'minimumStock' })
  @IsOptional()
  @IsNumber()
  minimumStock?: number;

  @ApiPropertyOptional({ description: 'Harga pokok per satuan dasar (opsional, untuk HPP & kartu stok)' })
  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @ApiPropertyOptional({ description: 'Tanggal saldo awal (opsional)' })
  @IsOptional()
  @IsString()
  date?: string;
}

export class UpdateProductStockDto {
  @ApiPropertyOptional({ description: 'productId' })
  @IsOptional()
  @IsNumber()
  productId?: number;

  @ApiPropertyOptional({ description: 'warehouseId' })
  @IsOptional()
  @IsNumber()
  warehouseId?: number;

  @ApiPropertyOptional({ description: 'quantity' })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional({ description: 'minimumStock' })
  @IsOptional()
  @IsNumber()
  minimumStock?: number;

  @ApiPropertyOptional({ description: 'Harga pokok per satuan dasar (opsional, untuk HPP & kartu stok)' })
  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @ApiPropertyOptional({ description: 'Tanggal saldo awal (opsional)' })
  @IsOptional()
  @IsString()
  date?: string;
}

export class QueryProductStockDto {
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
  $skip?: number;

  @ApiPropertyOptional({ description: 'Number of records to take' })
  @IsOptional()
  @IsNumber()
  $take?: number;

  @ApiPropertyOptional({ description: 'Search keyword' })
  @IsOptional()
  @IsString()
  $search?: string;
}
