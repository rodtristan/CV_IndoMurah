import { Type } from 'class-transformer';
import { IsString, IsOptional, IsInt, IsNumber, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CashOutLineDto {
  @ApiProperty({ description: 'Kode akun rincian (penggunaan dana)' })
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

export class CreateCashOutDto {
  @ApiPropertyOptional({ description: 'Kode kas keluar (auto bila kosong)' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ description: 'Akun kas/bank sumber' })
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

  @ApiPropertyOptional({ type: [CashOutLineDto], description: 'Rincian akun lawan; total harus = amount. Default: Setting Perkiraan Biaya Lain' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CashOutLineDto)
  lines?: CashOutLineDto[];
}

export class UpdateCashOutDto {
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

  @ApiPropertyOptional({ type: [CashOutLineDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CashOutLineDto)
  lines?: CashOutLineDto[];
}
