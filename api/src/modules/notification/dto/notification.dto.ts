import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ description: 'userId' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'message' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'type' })
  type: any;

  @ApiProperty({ description: 'isRead' })
  @IsBoolean()
  isRead: boolean;

  @ApiProperty({ description: 'referenceType' })
  @IsString()
  referenceType: string;

  @ApiProperty({ description: 'referenceId' })
  @IsNumber()
  referenceId: number;

  @ApiProperty({ description: 'isActive' })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ description: 'user' })
  user: any;

}

export class UpdateNotificationDto {
  @ApiPropertyOptional({ description: 'userId' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'message' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ description: 'type' })
  @IsOptional()
  type?: any;

  @ApiPropertyOptional({ description: 'isRead' })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @ApiPropertyOptional({ description: 'referenceType' })
  @IsOptional()
  @IsString()
  referenceType?: string;

  @ApiPropertyOptional({ description: 'referenceId' })
  @IsOptional()
  @IsNumber()
  referenceId?: number;

  @ApiPropertyOptional({ description: 'isActive' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'user' })
  @IsOptional()
  user?: any;

}

export class NotificationResponseDto {
  @ApiProperty({ description: 'userId' })
  userId: string;

  @ApiProperty({ description: 'title' })
  title: string;

  @ApiProperty({ description: 'message' })
  message: string;

  @ApiProperty({ description: 'type' })
  type: any;

  @ApiProperty({ description: 'isRead' })
  isRead: boolean;

  @ApiProperty({ description: 'referenceType' })
  referenceType: string;

  @ApiProperty({ description: 'referenceId' })
  referenceId: number;

  @ApiProperty({ description: 'isActive' })
  isActive: boolean;

  @ApiProperty({ description: 'user' })
  user: any;

}

export class QueryNotificationDto {
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
