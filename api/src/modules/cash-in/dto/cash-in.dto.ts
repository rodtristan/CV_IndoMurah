import { Type } from 'class-transformer';
import { IsString, IsOptional, IsInt, IsNumber, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CashInLineDto {
  @ApiProperty({ description: 'Kode akun rincian (sumber dana)' })
  @IsInt()
  accountId: number;

  @ApiProperty({ description: 'Jumlah rincian' })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ description: 'Keterangan rincian' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateCashInDto {
  @ApiPropertyOptional({ description: 'Kode kas masuk (auto bila kosong)' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ description: 'Akun kas/bank tujuan' })
  @IsInt()
  accountId: number;

  @ApiProperty({ description: 'Jumlah' })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ description: 'Tanggal transaksi (ISO)' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referenceType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  referenceId?: number;

  @ApiPropertyOptional({ type: [CashInLineDto], description: 'Rincian akun lawan; total harus = amount. Default: Setting Perkiraan Pendapatan Lain' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CashInLineDto)
  lines?: CashInLineDto[];
}

export class UpdateCashInDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  accountId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referenceType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  referenceId?: number;

  @ApiPropertyOptional({ type: [CashInLineDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CashInLineDto)
  lines?: CashInLineDto[];
}
