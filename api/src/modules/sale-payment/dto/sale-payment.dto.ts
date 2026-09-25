import { IsString, IsOptional, IsNumber, IsInt, IsDateString, IsIn, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSalePaymentDto {
  @ApiProperty({ description: 'Sale ID' })
  @IsInt()
  SaleID: number;

  @ApiPropertyOptional({ description: 'Payment method ID (tidak wajib bila InstrumentType DEPOSIT / UseDeposit)' })
  @IsOptional()
  @IsInt()
  MethodID?: number;

  @ApiProperty({ description: 'Payment amount' })
  @IsNumber()
  Amount: number;

  @ApiPropertyOptional({ description: 'Reference number' })
  @IsOptional()
  @IsString()
  ReferenceNumber?: string;

  @ApiPropertyOptional({ description: 'Payment date', type: String })
  @IsOptional()
  @IsDateString()
  Date?: string;

  @ApiPropertyOptional({ description: 'CASH | CEK | BG | DEPOSIT (DEPOSIT = bayar memakai saldo deposit)' })
  @IsOptional()
  @IsIn(['CASH', 'CEK', 'BG', 'DEPOSIT'])
  InstrumentType?: string;

  @ApiPropertyOptional({ description: 'true = bayar memakai saldo deposit (sama dengan InstrumentType DEPOSIT)' })
  @IsOptional()
  @IsBoolean()
  UseDeposit?: boolean;

  @ApiPropertyOptional({ description: 'Due date (cek/bg)', type: String })
  @IsOptional()
  @IsDateString()
  DueDate?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class UpdateSalePaymentDto {
  @ApiPropertyOptional({ description: 'Payment method ID' })
  @IsOptional()
  @IsInt()
  MethodID?: number;

  @ApiPropertyOptional({ description: 'Payment amount' })
  @IsOptional()
  @IsNumber()
  Amount?: number;

  @ApiPropertyOptional({ description: 'Reference number' })
  @IsOptional()
  @IsString()
  ReferenceNumber?: string;

  @ApiPropertyOptional({ description: 'Payment date', type: String })
  @IsOptional()
  @IsDateString()
  Date?: string;

  @ApiPropertyOptional({ description: 'CASH | CEK | BG | DEPOSIT (DEPOSIT = bayar memakai saldo deposit)' })
  @IsOptional()
  @IsIn(['CASH', 'CEK', 'BG', 'DEPOSIT'])
  InstrumentType?: string;

  @ApiPropertyOptional({ description: 'true = bayar memakai saldo deposit (sama dengan InstrumentType DEPOSIT)' })
  @IsOptional()
  @IsBoolean()
  UseDeposit?: boolean;

  @ApiPropertyOptional({ description: 'Due date (cek/bg)', type: String })
  @IsOptional()
  @IsDateString()
  DueDate?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}
