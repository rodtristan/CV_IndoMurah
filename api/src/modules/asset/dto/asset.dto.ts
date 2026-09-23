import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAssetDto {
  @ApiProperty({ description: 'code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'assetCategoryId' })
  @IsOptional()
  @IsNumber()
  assetCategoryId?: number;

  @ApiPropertyOptional({ description: 'purchaseDate' })
  @IsOptional()
  purchaseDate?: Date;

  @ApiPropertyOptional({ description: 'purchasePrice' })
  @IsOptional()
  @IsNumber()
  purchasePrice?: number;

  @ApiPropertyOptional({ description: 'currentValue' })
  @IsOptional()
  @IsNumber()
  currentValue?: number;

  @ApiProperty({ description: 'depreciationMethod' })
  depreciationMethod: any;

  @ApiPropertyOptional({ description: 'usefulLifeYears' })
  @IsOptional()
  @IsNumber()
  usefulLifeYears?: number;

  @ApiPropertyOptional({ description: 'location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'assignedTo' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional({ description: 'serialNumber' })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({ description: 'description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'status' })
  status: any;

  @ApiPropertyOptional({ description: 'isActive' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;


}

export class UpdateAssetDto {
  @ApiPropertyOptional({ description: 'code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'assetCategoryId' })
  @IsOptional()
  @IsNumber()
  assetCategoryId?: number;

  @ApiPropertyOptional({ description: 'purchaseDate' })
  @IsOptional()
  purchaseDate?: Date;

  @ApiPropertyOptional({ description: 'purchasePrice' })
  @IsOptional()
  @IsNumber()
  purchasePrice?: number;

  @ApiPropertyOptional({ description: 'currentValue' })
  @IsOptional()
  @IsNumber()
  currentValue?: number;

  @ApiPropertyOptional({ description: 'depreciationMethod' })
  @IsOptional()
  depreciationMethod?: any;

  @ApiPropertyOptional({ description: 'usefulLifeYears' })
  @IsOptional()
  @IsNumber()
  usefulLifeYears?: number;

  @ApiPropertyOptional({ description: 'location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'assignedTo' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional({ description: 'serialNumber' })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({ description: 'description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'status' })
  @IsOptional()
  status?: any;

  @ApiPropertyOptional({ description: 'isActive' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;


}

export class AssetResponseDto {
  @ApiProperty({ description: 'code' })
  code: string;

  @ApiProperty({ description: 'name' })
  name: string;

  @ApiProperty({ description: 'assetCategoryId' })
  assetCategoryId: number;

  @ApiProperty({ description: 'purchaseDate' })
  purchaseDate: Date;

  @ApiProperty({ description: 'purchasePrice' })
  purchasePrice: number;

  @ApiProperty({ description: 'currentValue' })
  currentValue: number;

  @ApiProperty({ description: 'depreciationMethod' })
  depreciationMethod: any;

  @ApiProperty({ description: 'usefulLifeYears' })
  usefulLifeYears: number;

  @ApiProperty({ description: 'location' })
  location: string;

  @ApiProperty({ description: 'assignedTo' })
  assignedTo: string;

  @ApiProperty({ description: 'serialNumber' })
  serialNumber: string;

  @ApiProperty({ description: 'description' })
  description: string;

  @ApiProperty({ description: 'status' })
  status: any;

  @ApiProperty({ description: 'isActive' })
  isActive: boolean;

  @ApiProperty({ description: 'category' })
  category: any;

}

export class QueryAssetDto {
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
