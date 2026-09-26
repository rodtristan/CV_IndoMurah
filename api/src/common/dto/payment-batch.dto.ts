// Dokumen "Bayar Hutang" / "Bayar Piutang" Ketoko: satu nomor transaksi, satu cara bayar,
// banyak faktur (Jml Bayar + Pot per faktur).
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDateString, IsIn, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min, ValidateNested } from 'class-validator';

export class PaymentBatchLineDto {
  @ApiProperty({ description: 'ID faktur (pembelian / penjualan)' })
  @IsInt()
  InvoiceID: number;

  @ApiProperty({ description: 'Jml Bayar' })
  @IsNumber()
  @Min(0)
  Amount: number;

  @ApiPropertyOptional({ description: 'Pot (potongan pelunasan)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  Discount?: number;
}

export class CreatePaymentBatchDto {
  @ApiProperty({ description: 'Supplier / Pelanggan' })
  @IsInt()
  PartnerID: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  Date?: string;

  @ApiProperty({ description: 'Cara Bayar (metode)' })
  @IsInt()
  MethodID: number;

  @ApiPropertyOptional({ enum: ['CASH', 'CEK', 'BG', 'DEPOSIT'] })
  @IsOptional()
  @IsIn(['CASH', 'CEK', 'BG', 'DEPOSIT'])
  InstrumentType?: string;

  @ApiPropertyOptional({ description: 'Kode Akun kas/bank' })
  @IsOptional()
  @IsInt()
  AccountID?: number | null;

  @ApiPropertyOptional({ description: 'Nomor (no. cek/BG/referensi)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  Number?: string;

  @ApiPropertyOptional({ description: 'Jatuh tempo cek/BG' })
  @IsOptional()
  @IsDateString()
  DueDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  Notes?: string;

  @ApiProperty({ type: [PaymentBatchLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PaymentBatchLineDto)
  Lines: PaymentBatchLineDto[];
}
