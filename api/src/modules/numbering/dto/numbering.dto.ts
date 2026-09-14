import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNumberingDto {
  @ApiProperty({ description: 'Numbering type (e.g., sale, purchase, invoice)' })
  @IsString()
  type: string;

  @ApiPropertyOptional({ description: 'Prefix before number (e.g., INV-)' })
  @IsOptional()
  @IsString()
  prefix?: string;

  @ApiPropertyOptional({ description: 'Last used number' })
  @IsOptional()
  @IsInt()
  lastNumber?: number;

  @ApiPropertyOptional({ description: 'Suffix after number' })
  @IsOptional()
  @IsString()
  suffix?: string;

  @ApiPropertyOptional({ description: 'Number of digits (e.g., 4 = 0001)' })
  @IsOptional()
  @IsInt()
  digitCount?: number;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateNumberingDto {
  @ApiPropertyOptional({ description: 'Numbering type' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Prefix before number' })
  @IsOptional()
  @IsString()
  prefix?: string;

  @ApiPropertyOptional({ description: 'Last used number' })
  @IsOptional()
  @IsInt()
  lastNumber?: number;

  @ApiPropertyOptional({ description: 'Suffix after number' })
  @IsOptional()
  @IsString()
  suffix?: string;

  @ApiPropertyOptional({ description: 'Number of digits' })
  @IsOptional()
  @IsInt()
  digitCount?: number;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class NumberingResponseDto {
  @ApiProperty({ description: 'ID' })
  id: number;

  @ApiProperty({ description: 'Numbering type' })
  type: string;

  @ApiProperty({ description: 'Prefix' })
  prefix: string;

  @ApiProperty({ description: 'Last used number' })
  lastNumber: number;

  @ApiProperty({ description: 'Suffix' })
  suffix: string;

  @ApiProperty({ description: 'Number of digits' })
  digitCount: number;

  @ApiProperty({ description: 'Is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date;
}

export class QueryNumberingDto {
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
  @Type(() => Number)
  $skip?: number;

  @ApiPropertyOptional({ description: 'Number of records to take' })
  @IsOptional()
  @Type(() => Number)
  $take?: number;

  @ApiPropertyOptional({ description: 'Search keyword' })
  @IsOptional()
  @IsString()
  $search?: string;
}
