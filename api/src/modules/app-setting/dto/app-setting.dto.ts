import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAppSettingDto {
  @ApiPropertyOptional({ description: 'reportDesignEnabled' })
  @IsOptional()
  @IsBoolean()
  reportDesignEnabled?: boolean;

  @ApiPropertyOptional({ description: 'itemAddMode' })
  @IsOptional()
  @IsString()
  itemAddMode?: string;

  @ApiPropertyOptional({ description: 'displayMode' })
  @IsOptional()
  @IsString()
  displayMode?: string;

  @ApiPropertyOptional({ description: 'displayRowMode' })
  @IsOptional()
  @IsString()
  displayRowMode?: string;

  @ApiPropertyOptional({ description: 'timezone' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ description: 'maxSearchRows' })
  @IsOptional()
  @IsNumber()
  maxSearchRows?: number;

  @ApiPropertyOptional({ description: 'addressBinding' })
  @IsOptional()
  @IsString()
  addressBinding?: string;

  @ApiPropertyOptional({ description: 'showImageOnTransaction' })
  @IsOptional()
  @IsBoolean()
  showImageOnTransaction?: boolean;

  @ApiPropertyOptional({ description: 'warnPriceBelowCost' })
  @IsOptional()
  @IsBoolean()
  warnPriceBelowCost?: boolean;

  @ApiPropertyOptional({ description: 'showBrandColumn' })
  @IsOptional()
  @IsBoolean()
  showBrandColumn?: boolean;

  @ApiPropertyOptional({ description: 'showInfoColumn' })
  @IsOptional()
  @IsBoolean()
  showInfoColumn?: boolean;

  @ApiPropertyOptional({ description: 'editRequiresAccess' })
  @IsOptional()
  @IsBoolean()
  editRequiresAccess?: boolean;

  @ApiPropertyOptional({ description: 'autoShowSalesOnCustomer' })
  @IsOptional()
  @IsBoolean()
  autoShowSalesOnCustomer?: boolean;

  @ApiPropertyOptional({ description: 'decimalPrice' })
  @IsOptional()
  @IsNumber()
  decimalPrice?: number;

  @ApiPropertyOptional({ description: 'decimalQty' })
  @IsOptional()
  @IsNumber()
  decimalQty?: number;

  @ApiPropertyOptional({ description: 'decimalTax' })
  @IsOptional()
  @IsNumber()
  decimalTax?: number;

  @ApiPropertyOptional({ description: 'decimalDiscount' })
  @IsOptional()
  @IsNumber()
  decimalDiscount?: number;

}

export class UpdateAppSettingDto {
  @ApiPropertyOptional({ description: 'reportDesignEnabled' })
  @IsOptional()
  @IsBoolean()
  reportDesignEnabled?: boolean;

  @ApiPropertyOptional({ description: 'itemAddMode' })
  @IsOptional()
  @IsString()
  itemAddMode?: string;

  @ApiPropertyOptional({ description: 'displayMode' })
  @IsOptional()
  @IsString()
  displayMode?: string;

  @ApiPropertyOptional({ description: 'displayRowMode' })
  @IsOptional()
  @IsString()
  displayRowMode?: string;

  @ApiPropertyOptional({ description: 'timezone' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ description: 'maxSearchRows' })
  @IsOptional()
  @IsNumber()
  maxSearchRows?: number;

  @ApiPropertyOptional({ description: 'addressBinding' })
  @IsOptional()
  @IsString()
  addressBinding?: string;

  @ApiPropertyOptional({ description: 'showImageOnTransaction' })
  @IsOptional()
  @IsBoolean()
  showImageOnTransaction?: boolean;

  @ApiPropertyOptional({ description: 'warnPriceBelowCost' })
  @IsOptional()
  @IsBoolean()
  warnPriceBelowCost?: boolean;

  @ApiPropertyOptional({ description: 'showBrandColumn' })
  @IsOptional()
  @IsBoolean()
  showBrandColumn?: boolean;

  @ApiPropertyOptional({ description: 'showInfoColumn' })
  @IsOptional()
  @IsBoolean()
  showInfoColumn?: boolean;

  @ApiPropertyOptional({ description: 'editRequiresAccess' })
  @IsOptional()
  @IsBoolean()
  editRequiresAccess?: boolean;

  @ApiPropertyOptional({ description: 'autoShowSalesOnCustomer' })
  @IsOptional()
  @IsBoolean()
  autoShowSalesOnCustomer?: boolean;

  @ApiPropertyOptional({ description: 'decimalPrice' })
  @IsOptional()
  @IsNumber()
  decimalPrice?: number;

  @ApiPropertyOptional({ description: 'decimalQty' })
  @IsOptional()
  @IsNumber()
  decimalQty?: number;

  @ApiPropertyOptional({ description: 'decimalTax' })
  @IsOptional()
  @IsNumber()
  decimalTax?: number;

  @ApiPropertyOptional({ description: 'decimalDiscount' })
  @IsOptional()
  @IsNumber()
  decimalDiscount?: number;

}

export class AppSettingResponseDto {
  @ApiProperty({ description: 'reportDesignEnabled' })
  reportDesignEnabled: boolean;

  @ApiProperty({ description: 'itemAddMode' })
  itemAddMode: string;

  @ApiProperty({ description: 'displayMode' })
  displayMode: string;

  @ApiProperty({ description: 'displayRowMode' })
  displayRowMode: string;

  @ApiProperty({ description: 'timezone' })
  timezone: string;

  @ApiProperty({ description: 'maxSearchRows' })
  maxSearchRows: number;

  @ApiProperty({ description: 'addressBinding' })
  addressBinding: string;

  @ApiProperty({ description: 'showImageOnTransaction' })
  showImageOnTransaction: boolean;

  @ApiProperty({ description: 'warnPriceBelowCost' })
  warnPriceBelowCost: boolean;

  @ApiProperty({ description: 'showBrandColumn' })
  showBrandColumn: boolean;

  @ApiProperty({ description: 'showInfoColumn' })
  showInfoColumn: boolean;

  @ApiProperty({ description: 'editRequiresAccess' })
  editRequiresAccess: boolean;

  @ApiProperty({ description: 'autoShowSalesOnCustomer' })
  autoShowSalesOnCustomer: boolean;

  @ApiProperty({ description: 'decimalPrice' })
  decimalPrice: number;

  @ApiProperty({ description: 'decimalQty' })
  decimalQty: number;

  @ApiProperty({ description: 'decimalTax' })
  decimalTax: number;

  @ApiProperty({ description: 'decimalDiscount' })
  decimalDiscount: number;

}

export class QueryAppSettingDto {
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
