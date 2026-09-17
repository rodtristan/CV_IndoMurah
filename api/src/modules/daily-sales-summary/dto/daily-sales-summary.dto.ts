import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDailySalesSummaryDto {
  @ApiProperty({ description: 'date' })
  date: Date;

  @ApiProperty({ description: 'totalTransactions' })
  @IsNumber()
  totalTransactions: number;

  @ApiProperty({ description: 'totalCost' })
  @IsNumber()
  totalCost: number;

  @ApiProperty({ description: 'totalSales' })
  @IsNumber()
  totalSales: number;

  @ApiProperty({ description: 'totalProfit' })
  @IsNumber()
  totalProfit: number;

  @ApiProperty({ description: 'totalReturns' })
  @IsNumber()
  totalReturns: number;

  @ApiProperty({ description: 'totalExpenses' })
  @IsNumber()
  totalExpenses: number;

}

export class UpdateDailySalesSummaryDto {
  @ApiPropertyOptional({ description: 'date' })
  @IsOptional()
  date?: Date;

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

export class DailySalesSummaryResponseDto {
  @ApiProperty({ description: 'date' })
  date: Date;

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

export class QueryDailySalesSummaryDto {
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
