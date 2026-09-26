import { IsString, IsOptional, IsBoolean, IsNumber, IsDate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreatePromotionDto {
  @ApiProperty({ description: 'Promotion code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Promotion name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Promotion type: DISCOUNT, BOGO, GIFT, BUY_GET' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Discount type: PERCENTAGE, FIXED' })
  @IsString()
  discountType: string;

  @ApiPropertyOptional({ description: 'Discount value (percentage or fixed amount)' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  discountValue?: number;

  @ApiPropertyOptional({ description: 'Minimum purchase amount' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  minPurchase?: number;

  @ApiPropertyOptional({ description: 'Maximum discount amount' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  maxDiscountAmount?: number;

  @ApiProperty({ description: 'Promotion start date' })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({ description: 'Promotion end date' })
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @ApiPropertyOptional({ description: 'Usage limit (null = unlimited)' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value ? parseInt(value, 10) : undefined)
  usageLimit?: number;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: true, description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePromotionDto {
  @ApiPropertyOptional({ description: 'Promotion code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'Promotion name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Promotion type: DISCOUNT, BOGO, GIFT, BUY_GET' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Discount type: PERCENTAGE, FIXED' })
  @IsOptional()
  @IsString()
  discountType?: string;

  @ApiPropertyOptional({ description: 'Discount value' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  discountValue?: number;

  @ApiPropertyOptional({ description: 'Minimum purchase amount' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  minPurchase?: number;

  @ApiPropertyOptional({ description: 'Maximum discount amount' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  maxDiscountAmount?: number;

  @ApiPropertyOptional({ description: 'Promotion start date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({ description: 'Promotion end date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @ApiPropertyOptional({ description: 'Usage limit' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value ? parseInt(value, 10) : undefined)
  usageLimit?: number;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
