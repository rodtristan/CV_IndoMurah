// Form "Bayar Komisi Sales" Ketoko: Sales, Periode Dari/s.d, Cara Bayar, Kode Akun, Nomor,
// daftar penjualan lunas (Transaksi, No Transaksi, Tanggal, Kode Sales, Total), Keterangan.
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsDateString, IsIn, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCommissionPaymentDto {
  @ApiProperty({ description: 'Sales' }) @IsInt() SalesPersonID: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() Date?: string;
  @ApiPropertyOptional({ description: 'Cara Bayar' }) @IsOptional() @IsInt() MethodID?: number | null;

  @ApiPropertyOptional({ enum: ['CASH', 'CEK', 'BG'] })
  @IsOptional()
  @IsIn(['CASH', 'CEK', 'BG'])
  InstrumentType?: string;

  @ApiPropertyOptional({ description: 'Kode Akun kas/bank' }) @IsOptional() @IsInt() AccountID?: number | null;
  @ApiPropertyOptional({ description: 'Nomor (cek/BG/referensi)' }) @IsOptional() @IsString() @MaxLength(100) Number?: string | null;
  @ApiPropertyOptional({ description: 'Jatuh tempo cek/BG' }) @IsOptional() @IsDateString() DueDate?: string | null;
  @ApiPropertyOptional({ description: 'Periode Dari' }) @IsOptional() @IsDateString() PeriodFrom?: string | null;
  @ApiPropertyOptional({ description: 'Periode s/d' }) @IsOptional() @IsDateString() PeriodTo?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(1000) Notes?: string | null;

  @ApiProperty({ type: [Number], description: 'Penjualan lunas yang komisinya dibayar' })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  SaleIDs: number[];
}

export class UpdateCommissionPaymentDto extends PartialType(CreateCommissionPaymentDto) {}

export class ClearCommissionChequeDto {
  @ApiProperty({ type: [Object], description: '[{ ID, IsCleared, ClearedAt }]' })
  @IsArray()
  Items: { ID: number; IsCleared: boolean; ClearedAt?: string | null }[];
}
