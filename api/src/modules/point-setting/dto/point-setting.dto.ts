import { IsString, IsOptional, IsBoolean, IsNumber, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePointSettingDto {
  @ApiProperty({ description: 'Setting name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Points per Rupiah' })
  @IsNumber()
  pointsPerRupiah: number;

  @ApiProperty({ description: 'Minimum transaction amount' })
  @IsNumber()
  minimumTransaction: number;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePointSettingDto {
  @ApiPropertyOptional({ description: 'Setting name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Points per Rupiah' })
  @IsOptional()
  @IsNumber()
  pointsPerRupiah?: number;

  @ApiPropertyOptional({ description: 'Minimum transaction amount' })
  @IsOptional()
  @IsNumber()
  minimumTransaction?: number;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class PointSettingResponseDto {
  @ApiProperty({ description: 'ID' })
  id: number;

  @ApiProperty({ description: 'Setting name' })
  name: string;

  @ApiProperty({ description: 'Points per Rupiah' })
  pointsPerRupiah: number;

  @ApiProperty({ description: 'Minimum transaction amount' })
  minimumTransaction: number;

  @ApiProperty({ description: 'Is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date;
}

export class QueryPointSettingDto {
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
