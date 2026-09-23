import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
  Min,
  IsNotEmpty,
} from 'class-validator';

// ─────────────────────────────────────────────────────────────────────────────
// VOUCHER DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class CreateVoucherDto {
  @ApiProperty({ description: 'Voucher Code' })
  @IsString()
  @IsNotEmpty()
  Code: string;

  @ApiProperty({ description: 'Voucher Name' })
  @IsString()
  @IsNotEmpty()
  Name: string;

  @ApiProperty({ description: 'Voucher Type ID (1=Percent, 2=Fixed Amount)' })
  @IsNumber()
  TypeId: number;

  @ApiProperty({ description: 'Voucher value (percentage or fixed Amount)' })
  @IsNumber()
  @Min(0.01)
  Value: number;

  @ApiPropertyOptional({ description: 'Minimum purchase Amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  MinPurchaseAmount?: number;

  @ApiPropertyOptional({ description: 'Maximum discount Amount (for percentage)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  MaxDiscountAmount?: number;

  @ApiProperty({ description: 'Start Date' })
  @IsDateString()
  StartDate: string;

  @ApiProperty({ description: 'End Date' })
  @IsDateString()
  EndDate: string;

  @ApiPropertyOptional({ description: 'Usage limit (how many times can be used)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  UsageLimit?: number;

  @ApiPropertyOptional({ description: 'Voucher Description' })
  @IsOptional()
  @IsString()
  Description?: string;
}

export class UpDateVoucherDto {
  @ApiPropertyOptional({ description: 'Voucher Name' })
  @IsOptional()
  @IsString()
  Name?: string;

  @ApiPropertyOptional({ description: 'End Date' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Usage limit' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  UsageLimit?: number;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;
}

export class ValiDateVoucherDto {
  @ApiProperty({ description: 'Voucher Code' })
  @IsString()
  @IsNotEmpty()
  Code: string;

  @ApiProperty({ description: 'Purchase Amount to valiDate against' })
  @IsNumber()
  @Min(0)
  PurchaseAmount: number;

  @ApiPropertyOptional({ description: 'Customer ID (for customer-specific vouchers)' })
  @IsOptional()
  @IsNumber()
  CustomerId?: number;
}

export class VoucherFilterDto {
  @ApiPropertyOptional({ description: 'Active only' })
  @IsOptional()
  @IsBoolean()
  ActiveOnly?: boolean;

  @ApiPropertyOptional({ description: 'Valid only (within Date range)' })
  @IsOptional()
  @IsBoolean()
  ValidOnly?: boolean;
}
