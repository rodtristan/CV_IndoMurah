import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
  IsNotEmpty,
} from 'class-validator';

// ─────────────────────────────────────────────────────────────────────────────
// POINT SETTINGS DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class UpDatePointSettingsDto {
  @ApiProperty({ description: 'Points earned per Rupiah spent' })
  @IsNumber()
  @Min(0)
  PointsPerRupiah: number;

  @ApiProperty({ description: 'Minimum transaction to earn points' })
  @IsNumber()
  @Min(0)
  MinimumTransaction: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// POINT REDEMPTION DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class CreatePointRedemptionDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsNumber()
  CustomerId: number;

  @ApiProperty({ description: 'Points to redeem' })
  @IsNumber()
  @Min(1)
  PointsRedeemed: number;

  @ApiProperty({ description: 'Reward Name' })
  @IsString()
  @IsNotEmpty()
  RewardName: string;

  @ApiProperty({ description: 'Reward value in Rupiah' })
  @IsNumber()
  @Min(0)
  RewardValue: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class RedeemPointsDto {
  @ApiProperty({ description: 'Points to redeem' })
  @IsNumber()
  @Min(1)
  Points: number;

  @ApiProperty({ description: 'Reward/Product Name' })
  @IsString()
  @IsNotEmpty()
  RewardName: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// POINT EARNING DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class CalculatePointsDto {
  @ApiProperty({ description: 'Transaction Amount' })
  @IsNumber()
  @Min(0)
  Amount: number;
}

export class AwardPointsDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsNumber()
  CustomerId: number;

  @ApiProperty({ description: 'Points to award' })
  @IsNumber()
  @Min(1)
  Points: number;

  @ApiPropertyOptional({ description: 'Reason' })
  @IsOptional()
  @IsString()
  Reason?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class CustomerPointsFilterDto {
  @ApiPropertyOptional({ description: 'Customer ID' })
  @IsOptional()
  @IsNumber()
  CustomerId?: number;
}

export class RedemptionFilterDto {
  @ApiPropertyOptional({ description: 'Customer ID filter' })
  @IsOptional()
  @IsNumber()
  CustomerId?: number;

  @ApiPropertyOptional({ description: 'Start Date filter' })
  @IsOptional()
  @IsString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date filter' })
  @IsOptional()
  @IsString()
  EndDate?: string;
}
