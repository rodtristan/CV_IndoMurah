import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  Min,
} from 'class-validator';

// ─────────────────────────────────────────────────────────────────────────────
// SMS DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class SendSmsDto {
  @ApiProperty({ description: 'Recipient phone number' })
  @IsString()
  @IsNotEmpty()
  PhoneNumber: string;

  @ApiProperty({ description: 'Message content' })
  @IsString()
  @IsNotEmpty()
  Message: string;

  @ApiPropertyOptional({ description: 'Sender ID/Name' })
  @IsOptional()
  @IsString()
  SenderName?: string;

  @ApiPropertyOptional({ description: 'Scheduled send time' })
  @IsOptional()
  @IsDateString()
  ScheduledAt?: string;
}

export class BulkSmsDto {
  @ApiProperty({ description: 'Recipient phone numbers', type: [String] })
  @IsArray()
  @IsString({ each: true })
  PhoneNumbers: string[];

  @ApiProperty({ description: 'Message content' })
  @IsString()
  @IsNotEmpty()
  Message: string;

  @ApiPropertyOptional({ description: 'Scheduled send time' })
  @IsOptional()
  @IsDateString()
  ScheduledAt?: string;
}

export class SmsTemplateDto {
  @ApiProperty({ description: 'Template Code' })
  @IsString()
  @IsNotEmpty()
  Code: string;

  @ApiProperty({ description: 'Template Name' })
  @IsString()
  @IsNotEmpty()
  Name: string;

  @ApiProperty({ description: 'Template content (use {variable} for placeholders)' })
  @IsString()
  @IsNotEmpty()
  Content: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;
}

export class SmsWithTemplateDto {
  @ApiProperty({ description: 'Recipient phone number' })
  @IsString()
  @IsNotEmpty()
  PhoneNumber: string;

  @ApiProperty({ description: 'Template Code' })
  @IsString()
  @IsNotEmpty()
  TemplateCode: string;

  @ApiPropertyOptional({ description: 'Template variables' })
  @IsOptional()
  TemplateVariables?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Scheduled send time' })
  @IsOptional()
  @IsDateString()
  ScheduledAt?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// WHATSAPP DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class SendWhatsAppDto {
  @ApiProperty({ description: 'Recipient phone number' })
  @IsString()
  @IsNotEmpty()
  PhoneNumber: string;

  @ApiProperty({ description: 'Message content' })
  @IsString()
  @IsNotEmpty()
  Message: string;

  @ApiPropertyOptional({ description: 'Media URL (for media messages)' })
  @IsOptional()
  @IsString()
  MediaUrl?: string;

  @ApiPropertyOptional({ description: 'Media Type' })
  @IsOptional()
  @IsString()
  MediaType?: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AUDIO';

  @ApiPropertyOptional({ description: 'Scheduled send time' })
  @IsOptional()
  @IsDateString()
  ScheduledAt?: string;
}

export class BulkWhatsAppDto {
  @ApiProperty({ description: 'Recipient phone numbers', type: [String] })
  @IsArray()
  @IsString({ each: true })
  PhoneNumbers: string[];

  @ApiProperty({ description: 'Message content' })
  @IsString()
  @IsNotEmpty()
  Message: string;

  @ApiPropertyOptional({ description: 'Media URL' })
  @IsOptional()
  @IsString()
  MediaUrl?: string;

  @ApiPropertyOptional({ description: 'Scheduled send time' })
  @IsOptional()
  @IsDateString()
  ScheduledAt?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTO NOTIFICATION DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class PaymentReminderDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsNumber()
  CustomerId: number;

  @ApiProperty({ description: 'Invoice/Sale ID' })
  @IsNumber()
  SaleId: number;

  @ApiProperty({ description: 'Amount due' })
  @IsNumber()
  @Min(0)
  Amount: number;

  @ApiProperty({ description: 'Due Date' })
  @IsDateString()
  DueDate: string;

  @ApiPropertyOptional({ description: 'Send method: SMS, WHATSAPP, BOTH' })
  @IsOptional()
  @IsString()
  Method?: string;
}

export class StockAlertNotificationDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNumber()
  ProductId: number;

  @ApiProperty({ description: 'Current stock' })
  @IsNumber()
  CurrentStock: number;

  @ApiProperty({ description: 'Minimum stock level' })
  @IsNumber()
  MinimumStock: number;

  @ApiPropertyOptional({ description: 'Recipient phone numbers', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  Recipients?: string[];
}

export class BirthdayGreetingDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsNumber()
  CustomerId: number;

  @ApiPropertyOptional({ description: 'Send method: SMS, WHATSAPP, BOTH' })
  @IsOptional()
  @IsString()
  Method?: string;
}

export class PromotionDto {
  @ApiProperty({ description: 'Promotion title' })
  @IsString()
  @IsNotEmpty()
  Title: string;

  @ApiProperty({ description: 'Promotion message' })
  @IsString()
  @IsNotEmpty()
  Message: string;

  @ApiPropertyOptional({ description: 'Media URL' })
  @IsOptional()
  @IsString()
  MediaUrl?: string;

  @ApiPropertyOptional({ description: 'Target customer group ID' })
  @IsOptional()
  @IsNumber()
  CustomerGroupId?: number;

  @ApiPropertyOptional({ description: 'Target specific customer IDs', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  CustomerIds?: number[];

  @ApiPropertyOptional({ description: 'Send method: SMS, WHATSAPP, BOTH' })
  @IsOptional()
  @IsString()
  Method?: string;

  @ApiPropertyOptional({ description: 'Scheduled send time' })
  @IsOptional()
  @IsDateString()
  ScheduledAt?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION LOG DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class NotificationLogFilterDto {
  @ApiPropertyOptional({ description: 'Channel: SMS, WHATSAPP, EMAIL, PUSH' })
  @IsOptional()
  @IsString()
  Channel?: string;

  @ApiPropertyOptional({ description: 'Status: PENDING, SENT, DELIVERED, FAILED' })
  @IsOptional()
  @IsString()
  Status?: string;

  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Search keyword' })
  @IsOptional()
  @IsString()
  Search?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// GATEWAY CONFIG DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class SmsGatewayConfigDto {
  @ApiProperty({ description: 'Gateway Name' })
  @IsString()
  @IsNotEmpty()
  Name: string;

  @ApiProperty({ description: 'API URL' })
  @IsString()
  @IsNotEmpty()
  ApiUrl: string;

  @ApiPropertyOptional({ description: 'API Key' })
  @IsOptional()
  @IsString()
  ApiKey?: string;

  @ApiPropertyOptional({ description: 'Sender ID' })
  @IsOptional()
  @IsString()
  SenderId?: string;

  @ApiPropertyOptional({ description: 'Is default' })
  @IsOptional()
  @IsBoolean()
  IsDefault?: boolean;
}

export class WhatsAppGatewayConfigDto {
  @ApiProperty({ description: 'Gateway Name' })
  @IsString()
  @IsNotEmpty()
  Name: string;

  @ApiProperty({ description: 'Gateway Type: WHATSAPP_BUSINESS, FONNTE, WA_BLAST, etc' })
  @IsString()
  @IsNotEmpty()
  GatewayType: string;

  @ApiProperty({ description: 'API URL' })
  @IsString()
  @IsNotEmpty()
  ApiUrl: string;

  @ApiPropertyOptional({ description: 'API Key or Token' })
  @IsOptional()
  @IsString()
  ApiKey?: string;

  @ApiPropertyOptional({ description: 'Phone number ID' })
  @IsOptional()
  @IsString()
  PhoneNumberId?: string;

  @ApiPropertyOptional({ description: 'Is default' })
  @IsOptional()
  @IsBoolean()
  IsDefault?: boolean;
}
