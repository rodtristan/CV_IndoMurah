import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDateString, IsNumber, IsOptional, IsString, Min, IsNotEmpty } from 'class-validator';

export class RecordPaymentDto {
  @ApiProperty({ description: 'Payment Amount' })
  @IsNumber()
  @Min(0.01)
  Amount: number;

  @ApiProperty({ description: 'Payment method ID' })
  @IsNumber()
  PaymentMethodId: number;

  @ApiPropertyOptional({ description: 'Reference number (cheque, transfer ref, etc)' })
  @IsOptional()
  @IsString()
  ReferenceNumber?: string;

  @ApiPropertyOptional({ description: 'Payment Date' })
  @IsOptional()
  @IsDateString()
  PaymentDate?: string;

  @ApiPropertyOptional({ description: 'Payment Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class RecordBulkPaymentDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsNumber()
  CustomerId: number;

  @ApiProperty({ description: 'Total payment Amount' })
  @IsNumber()
  @Min(0.01)
  Amount: number;

  @ApiProperty({ description: 'Payment method ID' })
  @IsNumber()
  PaymentMethodId: number;

  @ApiProperty({ description: 'Sale IDs to be paid off', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  SaleIds: number[];

  @ApiPropertyOptional({ description: 'Reference number' })
  @IsOptional()
  @IsString()
  ReferenceNumber?: string;

  @ApiPropertyOptional({ description: 'Payment Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class ReceivableFilterDto {
  @ApiPropertyOptional({ description: 'Customer ID' })
  @IsOptional()
  @IsNumber()
  CustomerId?: number;

  @ApiPropertyOptional({ description: 'Status filter (ACTIVE, OVERDUE, PAID, ALL)' })
  @IsOptional()
  @IsString()
  Status?: string;

  @ApiPropertyOptional({ description: 'Start Date filter (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date filter (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Include overdue only' })
  @IsOptional()
  @IsBoolean()
  OverdueOnly?: boolean;

  @ApiPropertyOptional({ description: 'Minimum Amount filter' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  MinAmount?: number;
}

export class CustomerCreditLimitDto {
  @ApiProperty({ description: 'New credit limit' })
  @IsNumber()
  @Min(0)
  CreditLimit: number;

  @ApiPropertyOptional({ description: 'Reason for change' })
  @IsOptional()
  @IsString()
  Reason?: string;
}

export class SendReminderDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsNumber()
  CustomerId: number;

  @ApiProperty({ description: 'Reminder message' })
  @IsString()
  @IsNotEmpty()
  Message: string;

  @ApiPropertyOptional({ description: 'Channel (EMAIL, SMS, WHATSAPP)' })
  @IsOptional()
  @IsString()
  Channel?: string;
}

export class AgingReportDto {
  @ApiPropertyOptional({ description: 'As of Date (default: today)' })
  @IsOptional()
  @IsDateString()
  AsOfDate?: string;

  @ApiPropertyOptional({ description: 'Customer group ID' })
  @IsOptional()
  @IsNumber()
  CustomerGroupId?: number;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;
}

export class WriteOffReceivableDto {
  @ApiProperty({ description: 'Receivable ID' })
  @IsNumber()
  ReceivableId: number;

  @ApiProperty({ description: 'Reason for write-off' })
  @IsString()
  @IsNotEmpty()
  Reason: string;

  @ApiPropertyOptional({ description: 'Write-off Amount (partial write-off)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  Amount?: number;
}
