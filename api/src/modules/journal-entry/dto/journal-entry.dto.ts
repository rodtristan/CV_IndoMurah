import { IsOptional, IsInt, IsNumber, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateJournalEntryDto {
  @ApiProperty({ description: 'Jurnal induk' })
  @IsInt()
  journalId: number;

  @ApiProperty({ description: 'Akun' })
  @IsInt()
  accountId: number;

  @ApiPropertyOptional({ description: 'Debit' })
  @IsOptional()
  @IsNumber()
  debit?: number;

  @ApiPropertyOptional({ description: 'Kredit' })
  @IsOptional()
  @IsNumber()
  credit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  memo?: string;
}

export class UpdateJournalEntryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  journalId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  accountId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  debit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  credit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  memo?: string;
}
