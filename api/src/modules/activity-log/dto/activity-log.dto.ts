import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateActivityLogDto {
  @ApiProperty({ description: 'type' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'referenceType' })
  @IsString()
  referenceType: string;

  @ApiProperty({ description: 'referenceId' })
  @IsNumber()
  referenceId: number;

  @ApiProperty({ description: 'amount' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'createdById' })
  @IsString()
  createdById: string;

}

export class UpdateActivityLogDto {
  @ApiPropertyOptional({ description: 'type' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'referenceType' })
  @IsOptional()
  @IsString()
  referenceType?: string;

  @ApiPropertyOptional({ description: 'referenceId' })
  @IsOptional()
  @IsNumber()
  referenceId?: number;

  @ApiPropertyOptional({ description: 'amount' })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ description: 'createdById' })
  @IsOptional()
  @IsString()
  createdById?: string;

}

export class ActivityLogResponseDto {
  @ApiProperty({ description: 'type' })
  type: string;

  @ApiProperty({ description: 'title' })
  title: string;

  @ApiProperty({ description: 'description' })
  description: string;

  @ApiProperty({ description: 'referenceType' })
  referenceType: string;

  @ApiProperty({ description: 'referenceId' })
  referenceId: number;

  @ApiProperty({ description: 'amount' })
  amount: number;

  @ApiProperty({ description: 'createdById' })
  createdById: string;

}

export class QueryActivityLogDto {
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
