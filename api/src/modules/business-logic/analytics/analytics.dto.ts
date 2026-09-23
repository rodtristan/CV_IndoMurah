import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class DashboardSummaryDto {
  @ApiPropertyOptional({ description: 'Start Date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;
}

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

  @ApiPropertyOptional({ description: 'Group by (day, week, month)' })
  @IsOptional()
  @IsString()
  GroupBy?: 'day' | 'week' | 'month';

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsNumber()
  CategoryId?: number;

  @ApiPropertyOptional({ description: 'Product ID' })
  @IsOptional()
  @IsNumber()
  ProductId?: number;

  @ApiPropertyOptional({ description: 'Customer ID' })
  @IsOptional()
  @IsNumber()
  CustomerId?: number;
}

export class ProfitReportDto {
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

  @ApiPropertyOptional({ description: 'Include returns in calculation' })
  @IsOptional()
  @IsBoolean()
  IncludeReturns?: boolean;
}

export class TopProductsDto {
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

  @ApiPropertyOptional({ description: 'Limit results' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  Limit?: number;

  @ApiPropertyOptional({ description: 'Sort by (Quantity, revenue, profit)' })
  @IsOptional()
  @IsString()
  SortBy?: 'Quantity' | 'revenue' | 'profit';

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsNumber()
  CategoryId?: number;
}

export class TopCustomersDto {
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

  @ApiPropertyOptional({ description: 'Limit results' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  Limit?: number;

  @ApiPropertyOptional({ description: 'Sort by (Quantity, revenue)' })
  @IsOptional()
  @IsString()
  SortBy?: 'Quantity' | 'revenue';
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

  @ApiPropertyOptional({ description: 'Include zero stock products' })
  @IsOptional()
  @IsBoolean()
  IncludeZeroStock?: boolean;
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

export class TaxReportDto {
  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Tax rate filter' })
  @IsOptional()
  @IsNumber()
  TaxRate?: number;
}

export class PeriodicReportDto {
  @ApiPropertyOptional({ description: 'Report Type (daily, weekly, monthly, yearly)' })
  @IsOptional()
  @IsString()
  Type?: 'daily' | 'weekly' | 'monthly' | 'yearly';

  @ApiPropertyOptional({ description: 'Specific Date for daily report' })
  @IsOptional()
  @IsDateString()
  Date?: string;

  @ApiPropertyOptional({ description: 'Year for monthly/yearly report' })
  @IsOptional()
  @IsNumber()
  Year?: number;

  @ApiPropertyOptional({ description: 'Month for monthly report (1-12)' })
  @IsOptional()
  @IsNumber()
  Month?: number;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;
}

export class SalesTrendDto {
  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Compare with previous period' })
  @IsOptional()
  @IsBoolean()
  CompareWithPrevious?: boolean;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsNumber()
  CategoryId?: number;
}
