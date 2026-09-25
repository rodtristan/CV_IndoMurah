import { IsString, IsOptional, IsInt, IsNumber, IsIn, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupplierDepositDto {
  @ApiPropertyOptional({ description: 'Kode deposit; awalan DBIN/DBOUT menentukan jenis bila "type" kosong (auto bila kosong)' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ description: 'Supplier' })
  @IsInt()
  supplierId: number;

  @ApiProperty({ description: 'Jumlah deposit' })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ description: 'IN = dana dikirim ke supplier, OUT = dana ditarik dari supplier' })
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

  @ApiPropertyOptional({ description: 'Akun deposit (default Setting Perkiraan Deposit Supplier)' })
  @IsOptional()
  @IsInt()
  depositAccountId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateSupplierDepositDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  supplierId?: number;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
