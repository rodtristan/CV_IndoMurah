import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  Min,
  IsNotEmpty,
} from 'class-validator';

// ─────────────────────────────────────────────────────────────────────────────
// EXPENSE DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class CreateExpenseDto {
  @ApiProperty({ description: 'Expense Date' })
  @IsDateString()
  Date: string;

  @ApiProperty({ description: 'Expense category ID' })
  @IsNumber()
  CategoryId: number;

  @ApiProperty({ description: 'Expense Amount' })
  @IsNumber()
  @Min(0.01)
  Amount: number;

  @ApiProperty({ description: 'Expense Description' })
  @IsString()
  @IsNotEmpty()
  Description: string;

  @ApiPropertyOptional({ description: 'Reference number' })
  @IsOptional()
  @IsString()
  ReferenceNumber?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class BulkCreateExpenseDto {
  @ApiProperty({ description: 'Expenses to create', type: [CreateExpenseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExpenseDto)
  Expenses: CreateExpenseDto[];
}

export class ApproveExpenseDto {
  @ApiPropertyOptional({ description: 'Approval Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class ExpenseFilterDto {
  @ApiPropertyOptional({ description: 'Category ID filter' })
  @IsOptional()
  @IsNumber()
  CategoryId?: number;

  @ApiPropertyOptional({ description: 'Start Date filter' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date filter' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Approved only' })
  @IsOptional()
  @IsBoolean()
  ApprovedOnly?: boolean;

  @ApiPropertyOptional({ description: 'Pending approval only' })
  @IsOptional()
  @IsBoolean()
  PendingOnly?: boolean;
}

export class CreateExpenseCategoryDto {
  @ApiProperty({ description: 'Category Code' })
  @IsString()
  @IsNotEmpty()
  Code: string;

  @ApiProperty({ description: 'Category Name' })
  @IsString()
  @IsNotEmpty()
  Name: string;

  @ApiPropertyOptional({ description: 'Category Description' })
  @IsOptional()
  @IsString()
  Description?: string;
}
