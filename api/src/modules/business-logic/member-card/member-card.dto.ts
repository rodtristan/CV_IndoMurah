import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  Min,
  IsNotEmpty,
} from 'class-validator';

// ─────────────────────────────────────────────────────────────────────────────
// MEMBER CARD DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class CreateMemberCardDto {
  @ApiProperty({ description: 'Card number' })
  @IsString()
  @IsNotEmpty()
  CardNumber: string;

  @ApiProperty({ description: 'Customer ID' })
  @IsNumber()
  CustomerId: number;

  @ApiPropertyOptional({ description: 'Card Type: STANDARD, SILVER, GOLD, PLATINUM' })
  @IsOptional()
  @IsString()
  CardType?: string;

  @ApiPropertyOptional({ description: 'Initial deposit Amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  InitialDeposit?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class UpdateMemberCardDto {
  @ApiPropertyOptional({ description: 'Card Type' })
  @IsOptional()
  @IsString()
  CardType?: string;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class CardTopUpDto {
  @ApiProperty({ description: 'Top-up Amount' })
  @IsNumber()
  @Min(1)
  Amount: number;

  @ApiPropertyOptional({ description: 'Payment method ID' })
  @IsOptional()
  @IsNumber()
  PaymentMethodId?: number;

  @ApiPropertyOptional({ description: 'Reference number' })
  @IsOptional()
  @IsString()
  ReferenceNumber?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class CardWithdrawDto {
  @ApiProperty({ description: 'Withdrawal Amount' })
  @IsNumber()
  @Min(1)
  Amount: number;

  @ApiPropertyOptional({ description: 'Reference number' })
  @IsOptional()
  @IsString()
  ReferenceNumber?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class CardTransferDto {
  @ApiProperty({ description: 'Target card ID' })
  @IsNumber()
  TargetCardId: number;

  @ApiProperty({ description: 'Transfer Amount' })
  @IsNumber()
  @Min(1)
  Amount: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class ReplaceCardDto {
  @ApiProperty({ description: 'Reason for replacement' })
  @IsString()
  @IsNotEmpty()
  Reason: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class MemberCardFilterDto {
  @ApiPropertyOptional({ description: 'Search keyword (card number, customer Name)' })
  @IsOptional()
  @IsString()
  Search?: string;

  @ApiPropertyOptional({ description: 'Card Type' })
  @IsOptional()
  @IsString()
  CardType?: string;

  @ApiPropertyOptional({ description: 'Active only' })
  @IsOptional()
  @IsBoolean()
  ActiveOnly?: boolean;

  @ApiPropertyOptional({ description: 'Customer group ID' })
  @IsOptional()
  @IsNumber()
  CustomerGroupId?: number;

  @ApiPropertyOptional({ description: 'Low balance only (below minimum)' })
  @IsOptional()
  @IsBoolean()
  LowBalanceOnly?: boolean;

  @ApiPropertyOptional({ description: 'Minimum balance threshold for low balance filter' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  MinBalance?: number;

  @ApiPropertyOptional({ description: 'Page number' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  Page?: number;

  @ApiPropertyOptional({ description: 'Items per page' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  Limit?: number;
}

export class CardTransactionFilterDto {
  @ApiPropertyOptional({ description: 'Transaction Type: TOP_UP, WITHDRAW, PURCHASE, REFUND, TRANSFER_IN, TRANSFER_OUT' })
  @IsOptional()
  @IsString()
  TransactionType?: string;

  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;
}

export class CardBalanceReportDto {
  @ApiPropertyOptional({ description: 'As of Date' })
  @IsOptional()
  @IsDateString()
  AsOfDate?: string;

  @ApiPropertyOptional({ description: 'Customer group ID' })
  @IsOptional()
  @IsNumber()
  CustomerGroupId?: number;

  @ApiPropertyOptional({ description: 'Minimum balance filter' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  MinBalance?: number;
}

export class BulkCardActivationDto {
  @ApiProperty({ description: 'Card IDs to activate', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  CardIds: number[];
}

export class BulkCardDeactivationDto {
  @ApiProperty({ description: 'Card IDs to deactivate', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  CardIds: number[];
}
