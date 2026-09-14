import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePointRedemptionDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsInt()
  customerId: number;

  @ApiProperty({ description: 'Redemption code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Points redeemed' })
  @IsInt()
  pointsRedeemed: number;

  @ApiProperty({ description: 'Reward name' })
  @IsString()
  rewardName: string;

  @ApiProperty({ description: 'Reward value' })
  @IsNumber()
  rewardValue: number;

  @ApiPropertyOptional({ description: 'Redemption date' })
  @IsOptional()
  @IsDateString()
  date?: Date;

}

export class UpdatePointRedemptionDto {
  @ApiPropertyOptional({ description: 'Customer ID' })
  @IsOptional()
  @IsInt()
  customerId?: number;

  @ApiPropertyOptional({ description: 'Redemption code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'Points redeemed' })
  @IsOptional()
  @IsInt()
  pointsRedeemed?: number;

  @ApiPropertyOptional({ description: 'Reward name' })
  @IsOptional()
  @IsString()
  rewardName?: string;

  @ApiPropertyOptional({ description: 'Reward value' })
  @IsOptional()
  @IsNumber()
  rewardValue?: number;

  @ApiPropertyOptional({ description: 'Redemption date' })
  @IsOptional()
  @IsDateString()
  date?: Date;

}

export class PointRedemptionResponseDto {
  @ApiProperty({ description: 'ID' })
  id: number;

  @ApiProperty({ description: 'Customer ID' })
  customerId: number;

  @ApiProperty({ description: 'Redemption code' })
  code: string;

  @ApiProperty({ description: 'Points redeemed' })
  pointsRedeemed: number;

  @ApiProperty({ description: 'Reward name' })
  rewardName: string;

  @ApiProperty({ description: 'Reward value' })
  rewardValue: number;

  @ApiProperty({ description: 'Redemption date' })
  date: Date;

  @ApiProperty({ description: 'Created by ID' })
  createdById: string;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;
}

export class QueryPointRedemptionDto {
  @ApiPropertyOptional({ description: 'Fields to select' })
  @IsOptional()
  @IsString()
  $select?: string;

  @ApiPropertyOptional({ description: 'Relations to include (e.g., customer,creator)' })
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
