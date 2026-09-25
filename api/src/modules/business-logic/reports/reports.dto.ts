import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  IsBoolean,
  Min,
} from 'class-validator';

// ─────────────────────────────────────────────────────────────────────────────
// REPORT DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class SalesReportDto {
  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @ApiPropertyOptional({ description: 'Sales person ID' })
  @IsOptional()
  @IsNumber()
  SalesPersonId?: number;

  @ApiPropertyOptional({ description: 'Customer ID' })
  @IsOptional()
  @IsNumber()
  CustomerId?: number;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsNumber()
  CategoryId?: number;

  @ApiPropertyOptional({ description: 'Group by: day, week, month' })
  @IsOptional()
  @IsString()
  GroupBy?: string;
}

export class InventoryReportDto {
  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsNumber()
  CategoryId?: number;

  @ApiPropertyOptional({ description: 'Brand ID' })
  @IsOptional()
  @IsNumber()
  BrandId?: number;

  @ApiPropertyOptional({ description: 'Show only low stock' })
  @IsOptional()
  @IsBoolean()
  lowStockOnly?: boolean;

  @ApiPropertyOptional({ description: 'Show only out of stock' })
  @IsOptional()
  @IsBoolean()
  OutOfStockOnly?: boolean;

  @ApiPropertyOptional({ description: 'As of Date' })
  @IsOptional()
  @IsDateString()
  AsOfDate?: string;
}

export class StockMovementReportDto {
  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @ApiPropertyOptional({ description: 'Product ID' })
  @IsOptional()
  @IsNumber()
  ProductId?: number;

  @ApiPropertyOptional({ description: 'Movement Type: STOCK_IN, STOCK_OUT, TRANSFER, ADJUSTMENT' })
  @IsOptional()
  @IsString()
  MovementType?: string;
}

export class ReceivableAgingReportDto {
  @ApiPropertyOptional({ description: 'As of Date' })
  @IsOptional()
  @IsDateString()
  AsOfDate?: string;

  @ApiPropertyOptional({ description: 'Customer ID' })
  @IsOptional()
  @IsNumber()
  CustomerId?: number;

  @ApiPropertyOptional({ description: 'Customer group ID' })
  @IsOptional()
  @IsNumber()
  CustomerGroupId?: number;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;
}

export class PayableAgingReportDto {
  @ApiPropertyOptional({ description: 'As of Date' })
  @IsOptional()
  @IsDateString()
  AsOfDate?: string;

  @ApiPropertyOptional({ description: 'Supplier ID' })
  @IsOptional()
  @IsNumber()
  SupplierId?: number;
}

export class CashFlowReportDto {
  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Account ID' })
  @IsOptional()
  @IsNumber()
  AccountId?: number;
}

export class ProfitLossReportDto {
  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @ApiPropertyOptional({ description: 'Compare with previous period' })
  @IsOptional()
  @IsBoolean()
  CompareWithPrevious?: boolean;
}

export class AttendanceSummaryReportDto {
  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Department ID' })
  @IsOptional()
  @IsNumber()
  DepartmentId?: number;

  @ApiPropertyOptional({ description: 'Employee ID' })
  @IsOptional()
  @IsNumber()
  EmployeeId?: number;
}

export class PayrollSummaryReportDto {
  @ApiPropertyOptional({ description: 'Period (YYYY-MM)' })
  @IsOptional()
  @IsString()
  Period?: string;

  @ApiPropertyOptional({ description: 'Department ID' })
  @IsOptional()
  @IsNumber()
  DepartmentId?: number;
}

export class TopProductsReportDto {
  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsNumber()
  CategoryId?: number;

  @ApiPropertyOptional({ description: 'Sort by: Quantity, revenue, profit' })
  @IsOptional()
  @IsString()
  SortBy?: string;

  @ApiPropertyOptional({ description: 'Limit results' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  Limit?: number;
}

export class CustomerRevenueReportDto {
  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Sort by: revenue, transactions, profit' })
  @IsOptional()
  @IsString()
  SortBy?: string;

  @ApiPropertyOptional({ description: 'Limit results' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  Limit?: number;
}

export class SupplierPurchaseReportDto {
  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Supplier ID' })
  @IsOptional()
  @IsNumber()
  SupplierId?: number;

  @ApiPropertyOptional({ description: 'Sort by: total, transactions' })
  @IsOptional()
  @IsString()
  SortBy?: string;

  @ApiPropertyOptional({ description: 'Limit results' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  Limit?: number;
}

export class ExpenseReportDto {
  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsNumber()
  CategoryId?: number;

  @ApiPropertyOptional({ description: 'Group by: category, month' })
  @IsOptional()
  @IsString()
  GroupBy?: string;
}

export class DashboardSummaryDto {
  @ApiPropertyOptional({ description: 'Date (default: today)' })
  @IsOptional()
  @IsDateString()
  Date?: string;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// DEPOSIT BALANCE REPORT DTO
// ─────────────────────────────────────────────────────────────────────────────

export class DepositBalanceReportDto {
  @ApiPropertyOptional({ description: 'As of date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  AsOfDate?: string;

  @ApiPropertyOptional({ description: 'Customer ID filter' })
  @IsOptional()
  @IsNumber()
  CustomerId?: number;

  @ApiPropertyOptional({ description: 'Supplier ID filter' })
  @IsOptional()
  @IsNumber()
  SupplierId?: number;
}
