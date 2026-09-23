import { IsString, IsOptional, IsNumber, IsInt, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSalePaymentDto {
  @ApiProperty({ description: 'Sale ID' })
  @IsInt()
  saleId: number;

  @ApiProperty({ description: 'Payment method ID' })
  @IsInt()
  methodId: number;

  @ApiProperty({ description: 'Payment amount' })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ description: 'Reference number' })
  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @ApiPropertyOptional({ description: 'Payment date', type: String })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateSalePaymentDto {
  @ApiPropertyOptional({ description: 'Payment method ID' })
  @IsOptional()
  @IsInt()
  methodId?: number;

  @ApiPropertyOptional({ description: 'Payment amount' })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ description: 'Reference number' })
  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @ApiPropertyOptional({ description: 'Payment date', type: String })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
