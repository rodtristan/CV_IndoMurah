import { IsString, IsOptional, IsNumber, IsInt, IsDateString, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSalePaymentDto {
  @ApiProperty({ description: 'Sale ID' })
  @IsInt()
  SaleID: number;

  @ApiProperty({ description: 'Payment method ID' })
  @IsInt()
  MethodID: number;

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

  @ApiPropertyOptional({ description: 'CASH | CEK | BG' })
  @IsOptional()
  @IsIn(['CASH', 'CEK', 'BG'])
  InstrumentType?: string;

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

  @ApiPropertyOptional({ description: 'CASH | CEK | BG' })
  @IsOptional()
  @IsIn(['CASH', 'CEK', 'BG'])
  InstrumentType?: string;

  @ApiPropertyOptional({ description: 'Due date (cek/bg)', type: String })
  @IsOptional()
  @IsDateString()
  DueDate?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}
