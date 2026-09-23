import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  Min,
  IsNotEmpty,
  IsDateString,
} from 'class-validator';

// ─────────────────────────────────────────────────────────────────────────────
// JOURNAL ENTRY DTOs - Jurnal Umum
// ─────────────────────────────────────────────────────────────────────────────

export class JournalEntryItemDto {
  @ApiProperty({ description: 'Account ID' })
  @IsNumber()
  AccountId: number;

  @ApiProperty({ description: 'Debit Amount' })
  @IsNumber()
  @Min(0)
  Debit: number;

  @ApiProperty({ description: 'Credit Amount' })
  @IsNumber()
  @Min(0)
  Credit: number;

  @ApiPropertyOptional({ description: 'Description for this line' })
  @IsOptional()
  @IsString()
  Description?: string;
}

export class CreateJournalEntryDto {
  @ApiProperty({ description: 'Entry Date' })
  @IsOptional()
  @IsDateString()
  Date?: string;

  @ApiProperty({ description: 'Entry Type: GENERAL, ADJUSTMENT, CLOSING', example: 'GENERAL' })
  @IsString()
  @IsNotEmpty()
  Type: string;

  @ApiPropertyOptional({ description: 'Reference Type (SALE, PURCHASE, etc)' })
  @IsOptional()
  @IsString()
  ReferenceType?: string;

  @ApiPropertyOptional({ description: 'Reference ID' })
  @IsOptional()
  @IsNumber()
  ReferenceId?: number;

  @ApiPropertyOptional({ description: 'Reference number' })
  @IsOptional()
  @IsString()
  ReferenceNumber?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;

  @ApiPropertyOptional({ description: 'Created by user ID' })
  @IsOptional()
  @IsNumber()
  CreatedById?: number;

  @ApiProperty({ description: 'Journal entry Items', type: [JournalEntryItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JournalEntryItemDto)
  Items: JournalEntryItemDto[];

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class UpDateJournalEntryDto {
  @ApiPropertyOptional({ description: 'Entry Date' })
  @IsOptional()
  @IsDateString()
  Date?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class JournalEntryQueryDto {
  @ApiPropertyOptional({ description: 'Search keyword' })
  @IsOptional()
  @IsString()
  Search?: string;

  @ApiPropertyOptional({ description: 'Entry Type' })
  @IsOptional()
  @IsString()
  Type?: string;

  @ApiPropertyOptional({ description: 'Reference Type' })
  @IsOptional()
  @IsString()
  ReferenceType?: string;

  @ApiPropertyOptional({ description: 'Account ID' })
  @IsOptional()
  @IsNumber()
  AccountId?: number;

  @ApiPropertyOptional({ description: 'Start Date filter' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date filter' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  Page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  Limit?: number;
}

export class CancelJournalEntryDto {
  @ApiProperty({ description: 'Cancellation reason' })
  @IsString()
  @IsNotEmpty()
  Reason: string;
}

export class AccountBalanceDto {
  @ApiProperty({ description: 'Account ID' })
  @IsNumber()
  AccountId: number;

  @ApiPropertyOptional({ description: 'As of Date' })
  @IsOptional()
  @IsDateString()
  AsOfDate?: string;
}

export class TrialBalanceDto {
  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;
}
