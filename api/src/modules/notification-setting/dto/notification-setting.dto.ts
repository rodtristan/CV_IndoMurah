import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationSettingDto {
  @ApiProperty({ description: 'userId' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'type' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'emailEnabled' })
  @IsBoolean()
  emailEnabled: boolean;

  @ApiProperty({ description: 'pushEnabled' })
  @IsBoolean()
  pushEnabled: boolean;

  @ApiProperty({ description: 'inAppEnabled' })
  @IsBoolean()
  inAppEnabled: boolean;

  @ApiProperty({ description: 'threshold' })
  @IsNumber()
  threshold: number;

  @ApiProperty({ description: 'user' })
  user: any;

}

export class UpdateNotificationSettingDto {
  @ApiPropertyOptional({ description: 'userId' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'type' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'emailEnabled' })
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @ApiPropertyOptional({ description: 'pushEnabled' })
  @IsOptional()
  @IsBoolean()
  pushEnabled?: boolean;

  @ApiPropertyOptional({ description: 'inAppEnabled' })
  @IsOptional()
  @IsBoolean()
  inAppEnabled?: boolean;

  @ApiPropertyOptional({ description: 'threshold' })
  @IsOptional()
  @IsNumber()
  threshold?: number;

  @ApiPropertyOptional({ description: 'user' })
  @IsOptional()
  user?: any;

}

export class NotificationSettingResponseDto {
  @ApiProperty({ description: 'userId' })
  userId: string;

  @ApiProperty({ description: 'type' })
  type: string;

  @ApiProperty({ description: 'emailEnabled' })
  emailEnabled: boolean;

  @ApiProperty({ description: 'pushEnabled' })
  pushEnabled: boolean;

  @ApiProperty({ description: 'inAppEnabled' })
  inAppEnabled: boolean;

  @ApiProperty({ description: 'threshold' })
  threshold: number;

  @ApiProperty({ description: 'user' })
  user: any;

}

export class QueryNotificationSettingDto {
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
