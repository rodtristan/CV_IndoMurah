import { IsString, IsOptional, IsInt, IsNumber, IsIn, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerDepositDto {
  @ApiPropertyOptional({ description: 'Kode deposit; awalan DPIN/DPOUT menentukan jenis bila "type" kosong (auto bila kosong)' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ description: 'Pelanggan' })
  @IsInt()
  customerId: number;

  @ApiProperty({ description: 'Jumlah deposit' })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ description: 'IN = dana diterima dari pelanggan, OUT = dana ditarik pelanggan' })
  @IsOptional()
  @IsIn(['IN', 'OUT'])
  type?: 'IN' | 'OUT';

  @ApiPropertyOptional({ description: 'Tanggal (ISO)' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ description: 'Akun kas/bank (default Setting Perkiraan Kas)' })
  @IsOptional()
  @IsInt()
  cashAccountId?: number;

  @ApiPropertyOptional({ description: 'Akun deposit (default Setting Perkiraan Deposit Pelanggan)' })
  @IsOptional()
  @IsInt()
  depositAccountId?: number;

  @ApiPropertyOptional({ description: 'Metode pembayaran' })
  @IsOptional()
  @IsInt()
  paymentMethodId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateCustomerDepositDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  customerId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['IN', 'OUT'])
  type?: 'IN' | 'OUT';

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  cashAccountId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  depositAccountId?: number;

  @ApiPropertyOptional({ description: 'Metode pembayaran' })
  @IsOptional()
  @IsInt()
  paymentMethodId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
