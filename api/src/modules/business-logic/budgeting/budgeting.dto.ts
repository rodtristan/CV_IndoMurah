import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  IsBoolean,
  Min,
  IsNotEmpty,
  IsArray,
} from 'class-validator';

// ─────────────────────────────────────────────────────────────────────────────
// BUDGET DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class CreateBudgetDto {
  @ApiProperty({ description: 'Budget Name' })
  @IsString()
  @IsNotEmpty()
  Name: string;

  @ApiProperty({ description: 'Budget Type' })
  @IsString()
  Type: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

  @ApiProperty({ description: 'Period start Date' })
  @IsDateString()
  StartDate: string;

  @ApiProperty({ description: 'Period end Date' })
  @IsDateString()
  EndDate: string;

  @ApiPropertyOptional({ description: 'Category ID (for category-based budget)' })
  @IsOptional()
  @IsNumber()
  CategoryId?: number;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @ApiPropertyOptional({ description: 'Department ID' })
  @IsOptional()
  @IsNumber()
  DepartmentId?: number;

  @ApiProperty({ description: 'Budgeted Amount' })
  @IsNumber()
  @Min(0)
  BudgetedAmount: number;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;
}

export class UpdateBudgetDto {
  @ApiPropertyOptional({ description: 'Budget Name' })
  @IsOptional()
  @IsString()
  Name?: string;

  @ApiPropertyOptional({ description: 'Budgeted Amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  BudgetedAmount?: number;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;
}

export class BudgetFilterDto {
  @ApiPropertyOptional({ description: 'Budget Type' })
  @IsOptional()
  @IsString()
  Type?: string;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsNumber()
  CategoryId?: number;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @ApiPropertyOptional({ description: 'Department ID' })
  @IsOptional()
  @IsNumber()
  DepartmentId?: number;

  @ApiPropertyOptional({ description: 'Active only' })
  @IsOptional()
  @IsBoolean()
  ActiveOnly?: boolean;

  @ApiPropertyOptional({ description: 'Period year' })
  @IsOptional()
  @IsNumber()
  Year?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// SALES TARGET DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class CreateSalesTargetDto {
  @ApiProperty({ description: 'Target Name' })
  @IsString()
  @IsNotEmpty()
  Name: string;

  @ApiProperty({ description: 'Target Type' })
  @IsString()
  Type: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

  @ApiProperty({ description: 'Period start Date' })
  @IsDateString()
  StartDate: string;

  @ApiProperty({ description: 'Period end Date' })
  @IsDateString()
  EndDate: string;

  @ApiPropertyOptional({ description: 'Employee ID (for personal target)' })
  @IsOptional()
  @IsNumber()
  EmployeeId?: number;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsNumber()
  CategoryId?: number;

  @ApiProperty({ description: 'Target revenue' })
  @IsNumber()
  @Min(0)
  TargetRevenue: number;

  @ApiPropertyOptional({ description: 'Target Quantity' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  TargetQuantity?: number;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;
}

export class UpdateSalesTargetDto {
  @ApiPropertyOptional({ description: 'Target Name' })
  @IsOptional()
  @IsString()
  Name?: string;

  @ApiPropertyOptional({ description: 'Target revenue' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  TargetRevenue?: number;

  @ApiPropertyOptional({ description: 'Target Quantity' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  TargetQuantity?: number;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;
}

export class SalesTargetFilterDto {
  @ApiPropertyOptional({ description: 'Employee ID' })
  @IsOptional()
  @IsNumber()
  EmployeeId?: number;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @ApiPropertyOptional({ description: 'Period year' })
  @IsOptional()
  @IsNumber()
  Year?: number;

  @ApiPropertyOptional({ description: 'Period month' })
  @IsOptional()
  @IsNumber()
  Month?: number;

  @ApiPropertyOptional({ description: 'Active only' })
  @IsOptional()
  @IsBoolean()
  ActiveOnly?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// BUDGET REPORT DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class BudgetComparisonDto {
  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Budget ID' })
  @IsOptional()
  @IsNumber()
  BudgetId?: number;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsNumber()
  CategoryId?: number;

  @ApiPropertyOptional({ description: 'Department ID' })
  @IsOptional()
  @IsNumber()
  DepartmentId?: number;
}

export class SalesTargetReportDto {
  @ApiPropertyOptional({ description: 'Period year' })
  @IsOptional()
  @IsNumber()
  Year?: number;

  @ApiPropertyOptional({ description: 'Period month' })
  @IsOptional()
  @IsNumber()
  Month?: number;

  @ApiPropertyOptional({ description: 'Employee ID' })
  @IsOptional()
  @IsNumber()
  EmployeeId?: number;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @ApiPropertyOptional({ description: 'Show only underperforming' })
  @IsOptional()
  @IsBoolean()
  UnderperformingOnly?: boolean;
}

export class BudgetAlertDto {
  @ApiPropertyOptional({ description: 'Alert threshold percentage' })
  @IsOptional()
  @IsNumber()
  @Min(50)
  Threshold?: number;

  @ApiPropertyOptional({ description: 'Budget ID' })
  @IsOptional()
  @IsNumber()
  BudgetId?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// BULK OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

export class CopyBudgetDto {
  @ApiProperty({ description: 'Source budget ID' })
  @IsNumber()
  SourceBudgetId: number;

  @ApiProperty({ description: 'New period start Date' })
  @IsDateString()
  NewStartDate: string;

  @ApiProperty({ description: 'New period end Date' })
  @IsDateString()
  NewEndDate: string;

  @ApiPropertyOptional({ description: 'Apply percentage Adjustment' })
  @IsOptional()
  @IsNumber()
  AdjustmentPercent?: number;
}
