import { IsString, IsOptional, IsInt, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StockOpnameStatus } from '@prisma/client';

export class CreateStockOpnameDto {
  @ApiProperty({ description: 'Kode stock opname' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Gudang yang di-opname' })
  @IsInt()
  warehouseId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: StockOpnameStatus })
  @IsOptional()
  @IsEnum(StockOpnameStatus)
  status?: StockOpnameStatus;
}

export class UpdateStockOpnameDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  warehouseId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: StockOpnameStatus })
  @IsOptional()
  @IsEnum(StockOpnameStatus)
  status?: StockOpnameStatus;
}
