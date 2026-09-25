import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsDateString, IsBoolean } from 'class-validator';

export class YearCloseDto {
  @ApiProperty({ description: 'Fiscal Year to close' })
  @IsNumber()
  fiscalYear: number;

  @ApiProperty({ description: 'Closing date (YYYY-MM-DD)' })
  @IsDateString()
  closingDate: string;

  @ApiPropertyOptional({ description: 'Create opening entries for new year', default: true })
  @IsOptional()
  @IsBoolean()
  createOpeningEntries?: boolean;

  @ApiPropertyOptional({ description: 'Notes/Description' })
  @IsOptional()
  notes?: string;
}

export class YearCloseResultDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  closedYear: number;

  @ApiProperty()
  closingDate: Date;

  @ApiProperty()
  netIncome: number;

  @ApiProperty()
  totalRevenue: number;

  @ApiProperty()
  totalExpenses: number;

  @ApiProperty()
  closingEntriesCreated: number;

  @ApiProperty()
  openingEntriesCreated: boolean;

  @ApiProperty()
  fiscalYearsLocked: string[];

  @ApiPropertyOptional()
  message?: string;
}

export class FiscalYearDto {
  @ApiProperty()
  year: number;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty()
  isLocked: boolean;

  @ApiProperty()
  totalRevenue: number;

  @ApiProperty()
  totalExpenses: number;

  @ApiProperty()
  netIncome: number;
}
