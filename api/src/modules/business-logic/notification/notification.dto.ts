import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  Min,
  IsNotEmpty,
} from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ description: 'User ID to send notification to' })
  @IsString()
  @IsNotEmpty()
  UserId: string;

  @ApiProperty({ description: 'Notification title' })
  @IsString()
  @IsNotEmpty()
  Title: string;

  @ApiProperty({ description: 'Notification message' })
  @IsString()
  @IsNotEmpty()
  Message: string;

  @ApiPropertyOptional({ description: 'Notification Type ID' })
  @IsOptional()
  @IsNumber()
  TypeId?: number;

  @ApiPropertyOptional({ description: 'Reference Type (e.g., SALE, PURCHASE)' })
  @IsOptional()
  @IsString()
  ReferenceType?: string;

  @ApiPropertyOptional({ description: 'Reference ID' })
  @IsOptional()
  @IsNumber()
  ReferenceId?: number;
}

export class NotificationFilterDto {
  @ApiPropertyOptional({ description: 'User ID filter' })
  @IsOptional()
  @IsString()
  UserId?: string;

  @ApiPropertyOptional({ description: 'Notification Type ID' })
  @IsOptional()
  @IsNumber()
  TypeId?: number;

  @ApiPropertyOptional({ description: 'Show only unread' })
  @IsOptional()
  @IsBoolean()
  UnreadOnly?: boolean;

  @ApiPropertyOptional({ description: 'Page number' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  Page?: number;

  @ApiPropertyOptional({ description: 'Page size' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  Limit?: number;
}

export class MarkReadDto {
  @ApiProperty({ description: 'Notification IDs to mark as read', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  NotificationIds: number[];
}

export class UpdateNotificationSettingsDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  @IsNotEmpty()
  UserId: string;

  @ApiPropertyOptional({ description: 'Email enabled' })
  @IsOptional()
  @IsBoolean()
  EmailEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Push enabled' })
  @IsOptional()
  @IsBoolean()
  PushEnabled?: boolean;

  @ApiPropertyOptional({ description: 'In-app enabled' })
  @IsOptional()
  @IsBoolean()
  InAppEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Threshold Amount' })
  @IsOptional()
  @IsNumber()
  Threshold?: number;
}

export class BulkNotificationDto {
  @ApiProperty({ description: 'User IDs to send notification to', type: [String] })
  @IsArray()
  @IsString({}, { each: true })
  UserIds: string[];

  @ApiProperty({ description: 'Notification title' })
  @IsString()
  @IsNotEmpty()
  Title: string;

  @ApiProperty({ description: 'Notification message' })
  @IsString()
  @IsNotEmpty()
  Message: string;

  @ApiPropertyOptional({ description: 'Notification Type ID' })
  @IsOptional()
  @IsNumber()
  TypeId?: number;
}
