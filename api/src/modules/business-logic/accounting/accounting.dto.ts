import { IsOptional, IsString, IsNumber, IsDateString, IsBoolean, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNT MASTER DATA
// ─────────────────────────────────────────────────────────────────────────────

export class CreateAccountDto {
  @IsString()
  Code: string;

  @IsString()
  Name: string;

  @IsNumber()
  AccountTypeId: number;

  @IsOptional()
  @IsNumber()
  ParentId?: number;

  @IsOptional()
  @IsString()
  Description?: string;

  @IsOptional()
  @IsNumber()
  TaxRate?: number;

  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;

  @IsOptional()
  @IsString()
  DepreciationMethod?: string; // 'STRAIGHT_LINE', 'DECLINING_BALANCE'
}

export class UpdateAccountDto {
  @IsOptional()
  @IsString()
  Name?: string;

  @IsOptional()
  @IsNumber()
  AccountTypeId?: number;

  @IsOptional()
  @IsNumber()
  ParentId?: number;

  @IsOptional()
  @IsString()
  Description?: string;

  @IsOptional()
  @IsNumber()
  TaxRate?: number;

  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;

  @IsOptional()
  @IsString()
  DepreciationMethod?: string;
}

export class AccountFilterDto {
  @IsOptional()
  @IsNumber()
  AccountTypeId?: number;

  @IsOptional()
  @IsNumber()
  ParentId?: number;

  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;

  @IsOptional()
  @IsString()
  Search?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// JOURNAL ENTRIES (JURNAL UMUM)
// ─────────────────────────────────────────────────────────────────────────────

export class JournalEntryItemDto {
  @IsNumber()
  AccountId: number;

  @IsString()
  DebitCredit: 'DEBIT' | 'KREDIT';

  @IsNumber()
  Amount: number;

  @IsOptional()
  @IsString()
  Description?: string;
}

export class CreateJournalEntryDto {
  @IsDateString()
  Date: string;

  @IsString()
  Reference: string;

  @IsString()
  Description: string;

  @IsArray()
  Items: JournalEntryItemDto[];

  @IsOptional()
  @IsNumber()
  SourceDocumentId?: number;

  @IsOptional()
  @IsString()
  SourceDocumentType?: string; // 'SALE', 'PURCHASE', 'EXPENSE', 'PRODUCTION'
}

export class JournalEntryFilterDto {
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @IsOptional()
  @IsNumber()
  AccountId?: number;

  @IsOptional()
  @IsString()
  Reference?: string;

  @IsOptional()
  @IsString()
  SourceDocumentType?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERAL LEDGER (BUKU BESAR)
// ─────────────────────────────────────────────────────────────────────────────

export class GeneralLedgerFilterDto {
  @IsDateString()
  StartDate: string;

  @IsDateString()
  EndDate: string;

  @IsOptional()
  @IsNumber()
  AccountId?: number;

  @IsOptional()
  @IsNumber()
  AccountTypeId?: number;

  @IsOptional()
  @IsBoolean()
  ShowZeroBalance?: boolean;
}

export class TrialBalanceDto {
  @IsDateString()
  AsOfDate: string;

  @IsOptional()
  @IsNumber()
  WarehouseId?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// FINANCIAL REPORTS
// ─────────────────────────────────────────────────────────────────────────────

export class BalanceSheetDto {
  @IsDateString()
  AsOfDate: string;

  @IsOptional()
  @IsString()
  ComparisonDate?: string; // For comparing with previous period
}

export class ProfitLossDto {
  @IsDateString()
  StartDate: string;

  @IsDateString()
  EndDate: string;

  @IsOptional()
  @IsString()
  ComparisonStartDate?: string;

  @IsOptional()
  @IsString()
  ComparisonEndDate?: string;

  @IsOptional()
  @IsString()
  ReportType?: 'MULTI_STEP' | 'SINGLE_STEP';

  @IsOptional()
  @IsNumber()
  WarehouseId?: number;
}

export class CashFlowDto {
  @IsDateString()
  StartDate: string;

  @IsDateString()
  EndDate: string;

  @IsOptional()
  @IsString()
  Method?: 'DIRECT' | 'INDIRECT'; // Default: INDIRECT
}

export class EquityChangeDto {
  @IsDateString()
  StartDate: string;

  @IsDateString()
  EndDate: string;

  @IsOptional()
  @IsDateString()
  AsOfDate?: string;
}

export class CostOfGoodsSoldDto {
  @IsDateString()
  StartDate: string;

  @IsDateString()
  EndDate: string;

  @IsOptional()
  @IsNumber()
  WarehouseId?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// DEPRECIATION
// ─────────────────────────────────────────────────────────────────────────────

export class DepreciationMethodDto {
  @IsNumber()
  AssetId: number;

  @IsNumber()
  Method: number; // 1=Straight Line, 2=Double Declining, 3=Sum of Years

  @IsNumber()
  UsefulLife: number; // in months

  @IsNumber()
  SalvageValue: number;

  @IsOptional()
  @IsDateString()
  StartDate?: string;
}

export class CalculateDepreciationDto {
  @IsOptional()
  @IsDateString()
  AsOfDate?: string;

  @IsOptional()
  @IsNumber()
  AssetId?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// CLOSING ENTRIES
// ─────────────────────────────────────────────────────────────────────────────

export class ClosingEntryDto {
  @IsDateString()
  PeriodEndDate: string;

  @IsOptional()
  @IsBoolean()
  IncludeIncomeSummary?: boolean;
}

export class OpeningEntryDto {
  @IsDateString()
  PeriodStartDate: string;

  @IsOptional()
  @IsString()
  Description?: string;
}
