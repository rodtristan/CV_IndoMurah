import { IsOptional, IsNumber, IsDateString, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class RepairBalanceDto {
  @IsOptional()
  @IsNumber()
  accountId?: number;

  @IsOptional()
  @IsBoolean()
  repairAll?: boolean;

  @IsOptional()
  @IsDateString()
  asOfDate?: string;
}

export class BalanceDiscrepancyDto {
  accountId: number;
  accountCode: string;
  accountName: string;
  accountType: string;
  expectedBalance: number;
  currentBalance: number;
  difference: number;
  transactionCount: number;
  lastTransactionDate: Date | null;
}

export class BalanceHistoryDto {
  accountId: number;
  accountCode: string;
  accountName: string;
  date: Date;
  reference: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  source: string;
}

export class RepairResultDto {
  accountId: number;
  accountCode: string;
  accountName: string;
  repaired: boolean;
  expectedBalance: number;
  previousBalance: number;
  adjustmentAmount: number;
  journalCode: string | null;
  repairDate: Date;
}

export class BalanceRepairReportDto {
  totalAccountsChecked: number;
  accountsWithDiscrepancy: number;
  accountsRepaired: number;
  totalAdjustmentAmount: number;
  repairs: RepairResultDto[];
  discrepancies: BalanceDiscrepancyDto[];
  repairDate: Date;
  repairedBy: string;
}

export class BalanceCheckDto {
  @IsOptional()
  @IsNumber()
  accountId?: number;

  @IsOptional()
  @IsDateString()
  asOfDate?: string;

  @IsOptional()
  @IsBoolean()
  showZeroBalance?: boolean;
}
