import { IsString, IsNumber, IsOptional, IsArray, IsDateString, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class JournalItemDto {
  @ApiProperty()
  @IsInt()
  account_id: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  debit?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  credit?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateJournalEntryDto {
  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reference_type?: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  reference_id?: number;

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JournalItemDto)
  items: JournalItemDto[];
}

export class UpdateJournalEntryDto {
  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reference_type?: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  reference_id?: number;

  @ApiPropertyOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JournalItemDto)
  items?: JournalItemDto[];
}
