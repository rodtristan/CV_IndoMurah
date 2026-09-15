import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVoucherDto {
  @ApiProperty({ description: 'code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'type' })
  type: any;

  @ApiProperty({ description: 'value' })
  @IsNumber()
  value: number;

  @ApiProperty({ description: 'minPurchaseAmount' })
  @IsNumber()
  minPurchaseAmount: number;

  @ApiProperty({ description: 'maxDiscountAmount' })
  @IsNumber()
  maxDiscountAmount: number;

  @ApiProperty({ description: 'startDate' })
  startDate: Date;

  @ApiProperty({ description: 'endDate' })
  endDate: Date;

  @ApiProperty({ description: 'usageLimit' })
  @IsNumber()
  usageLimit: number;

  @ApiProperty({ description: 'usedCount' })
  @IsNumber()
  usedCount: number;

  @ApiProperty({ description: 'isActive' })
  @IsBoolean()
  isActive: boolean;

}

export class UpdateVoucherDto {
  @ApiPropertyOptional({ description: 'code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'type' })
  @IsOptional()
  type?: any;

  @ApiPropertyOptional({ description: 'value' })
  @IsOptional()
  @IsNumber()
  value?: number;

  @ApiPropertyOptional({ description: 'minPurchaseAmount' })
  @IsOptional()
  @IsNumber()
  minPurchaseAmount?: number;

  @ApiPropertyOptional({ description: 'maxDiscountAmount' })
  @IsOptional()
  @IsNumber()
  maxDiscountAmount?: number;

  @ApiPropertyOptional({ description: 'startDate' })
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({ description: 'endDate' })
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional({ description: 'usageLimit' })
  @IsOptional()
  @IsNumber()
  usageLimit?: number;

  @ApiPropertyOptional({ description: 'usedCount' })
  @IsOptional()
  @IsNumber()
  usedCount?: number;

  @ApiPropertyOptional({ description: 'isActive' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

}

export class VoucherResponseDto {
  @ApiProperty({ description: 'code' })
  code: string;

  @ApiProperty({ description: 'name' })
  name: string;

  @ApiProperty({ description: 'type' })
  type: any;

  @ApiProperty({ description: 'value' })
  value: number;

  @ApiProperty({ description: 'minPurchaseAmount' })
  minPurchaseAmount: number;

  @ApiProperty({ description: 'maxDiscountAmount' })
  maxDiscountAmount: number;

  @ApiProperty({ description: 'startDate' })
  startDate: Date;

  @ApiProperty({ description: 'endDate' })
  endDate: Date;

  @ApiProperty({ description: 'usageLimit' })
  usageLimit: number;

  @ApiProperty({ description: 'usedCount' })
  usedCount: number;

  @ApiProperty({ description: 'isActive' })
  isActive: boolean;

}

export class QueryVoucherDto {
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
