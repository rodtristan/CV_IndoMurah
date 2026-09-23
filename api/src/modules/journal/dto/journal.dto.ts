import { IsString, IsOptional, IsInt, IsBoolean, IsNumber, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateJournalEntryLineDto {
  @ApiProperty({ description: 'Account ID' })
  @IsInt()
  accountId: number;

  @ApiPropertyOptional({ description: 'Debit amount' })
  @IsOptional()
  @IsNumber()
  debit?: number;

  @ApiPropertyOptional({ description: 'Credit amount' })
  @IsOptional()
  @IsNumber()
  credit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  memo?: string;
}

export class CreateJournalDto {
  @ApiPropertyOptional({ description: 'Journal date', type: String })
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

  @ApiProperty({ description: 'Journal entry lines (debit/credit per account), must balance', type: [CreateJournalEntryLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateJournalEntryLineDto)
  entries: CreateJournalEntryLineDto[];
}

export class UpdateJournalDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  code?: string;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPosted?: boolean;

  @ApiPropertyOptional({ description: 'Replace all entry lines (debit/credit per account), must balance', type: [CreateJournalEntryLineDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateJournalEntryLineDto)
  entries?: CreateJournalEntryLineDto[];
}
