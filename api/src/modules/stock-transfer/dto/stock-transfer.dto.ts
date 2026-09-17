import { IsString, IsOptional, IsInt, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionStatus } from '@prisma/client';

export class CreateStockTransferDto {
  @ApiProperty({ description: 'Kode transfer' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Gudang asal' })
  @IsInt()
  fromWarehouseId: number;

  @ApiProperty({ description: 'Gudang tujuan' })
  @IsInt()
  toWarehouseId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: TransactionStatus })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;
}

export class UpdateStockTransferDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  fromWarehouseId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  toWarehouseId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: TransactionStatus })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;
}
