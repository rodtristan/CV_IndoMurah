import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMonthlySalesSummaryDto {
  @ApiProperty({ description: 'year' })
  @IsNumber()
  year: number;

  @ApiProperty({ description: 'month' })
  @IsNumber()
  month: number;

  @ApiPropertyOptional({ description: 'totalTransactions' })
  @IsOptional()
  @IsNumber()
  totalTransactions?: number;

  @ApiPropertyOptional({ description: 'totalCost' })
  @IsOptional()
  @IsNumber()
  totalCost?: number;

  @ApiPropertyOptional({ description: 'totalSales' })
  @IsOptional()
  @IsNumber()
  totalSales?: number;

  @ApiPropertyOptional({ description: 'totalProfit' })
  @IsOptional()
  @IsNumber()
  totalProfit?: number;

  @ApiPropertyOptional({ description: 'totalReturns' })
  @IsOptional()
  @IsNumber()
  totalReturns?: number;

  @ApiPropertyOptional({ description: 'totalExpenses' })
  @IsOptional()
  @IsNumber()
  totalExpenses?: number;

}

export class UpdateMonthlySalesSummaryDto {
  @ApiPropertyOptional({ description: 'year' })
  @IsOptional()
  @IsNumber()
  year?: number;

  @ApiPropertyOptional({ description: 'month' })
  @IsOptional()
  @IsNumber()
  month?: number;

  @ApiPropertyOptional({ description: 'totalTransactions' })
  @IsOptional()
  @IsNumber()
  totalTransactions?: number;

  @ApiPropertyOptional({ description: 'totalCost' })
  @IsOptional()
  @IsNumber()
  totalCost?: number;

  @ApiPropertyOptional({ description: 'totalSales' })
  @IsOptional()
  @IsNumber()
  totalSales?: number;

  @ApiPropertyOptional({ description: 'totalProfit' })
  @IsOptional()
  @IsNumber()
  totalProfit?: number;

  @ApiPropertyOptional({ description: 'totalReturns' })
  @IsOptional()
  @IsNumber()
  totalReturns?: number;

  @ApiPropertyOptional({ description: 'totalExpenses' })
  @IsOptional()
  @IsNumber()
  totalExpenses?: number;

}

export class MonthlySalesSummaryResponseDto {
  @ApiProperty({ description: 'year' })
  year: number;

  @ApiProperty({ description: 'month' })
  month: number;

  @ApiProperty({ description: 'totalTransactions' })
  totalTransactions: number;

  @ApiProperty({ description: 'totalCost' })
  totalCost: number;

  @ApiProperty({ description: 'totalSales' })
  totalSales: number;

  @ApiProperty({ description: 'totalProfit' })
  totalProfit: number;

  @ApiProperty({ description: 'totalReturns' })
  totalReturns: number;

  @ApiProperty({ description: 'totalExpenses' })
  totalExpenses: number;

}

export class QueryMonthlySalesSummaryDto {
  @ApiPropertyOptional({ description: 'Fields to select' })
  @IsOptional()
  @IsString()
  $select?: string;

  @ApiPropertyOptional({ description: 'Relations to include' })
  @IsOptional()
  @IsString()
  $include?: string;

  @ApiPropertyOptional({ description: 'Number of records to skip' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  $skip?: number;

  @ApiPropertyOptional({ description: 'Number of records to take' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  $take?: number;

  @ApiPropertyOptional({ description: 'Search keyword' })
  @IsOptional()
  @IsString()
  $search?: string;
}
