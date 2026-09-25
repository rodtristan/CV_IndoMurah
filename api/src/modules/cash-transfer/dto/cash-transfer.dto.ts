import { IsString, IsOptional, IsInt, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCashTransferDto {
  @ApiPropertyOptional({ description: 'Kode transfer kas (auto bila kosong)' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ description: 'Akun asal' })
  @IsInt()
  fromAccountId: number;

  @ApiProperty({ description: 'Akun tujuan' })
  @IsInt()
  toAccountId: number;

  @ApiProperty({ description: 'Jumlah' })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Tanggal transaksi (ISO)' })
  @IsOptional()
  @IsDateString()
  date?: string;
}

export class UpdateCashTransferDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  fromAccountId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  toAccountId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Tanggal transaksi (ISO)' })
  @IsOptional()
  @IsDateString()
  date?: string;
}
