import { IsString, IsOptional, IsInt, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCashTransferDto {
  @ApiProperty({ description: 'Kode transfer kas' })
  @IsString()
  code: string;

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
}
