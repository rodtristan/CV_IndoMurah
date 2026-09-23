import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLogDto {
  @ApiPropertyOptional({ description: 'method' })
  @IsOptional()
  @IsString()
  method?: string;

  @ApiPropertyOptional({ description: 'endpoint' })
  @IsOptional()
  @IsString()
  endpoint?: string;

  @ApiProperty({ description: 'headers' })
  headers: any;

  @ApiProperty({ description: 'payload' })
  payload: any;

  @ApiPropertyOptional({ description: 'responseStatus' })
  @IsOptional()
  @IsNumber()
  responseStatus?: number;

  @ApiPropertyOptional({ description: 'message' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ description: 'requesterLoginId' })
  @IsOptional()
  @IsNumber()
  requesterLoginId?: number;

  @ApiPropertyOptional({ description: 'requesterFullName' })
  @IsOptional()
  @IsString()
  requesterFullName?: string;

  @ApiPropertyOptional({ description: 'ipAddress' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'userAgent' })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({ description: 'durationMs' })
  @IsOptional()
  @IsNumber()
  durationMs?: number;

  @ApiPropertyOptional({ description: 'logDatetime' })
  @IsOptional()
  logDatetime?: Date;

}

export class UpdateLogDto {
  @ApiPropertyOptional({ description: 'method' })
  @IsOptional()
  @IsString()
  method?: string;

  @ApiPropertyOptional({ description: 'endpoint' })
  @IsOptional()
  @IsString()
  endpoint?: string;

  @ApiPropertyOptional({ description: 'headers' })
  @IsOptional()
  headers?: any;

  @ApiPropertyOptional({ description: 'payload' })
  @IsOptional()
  payload?: any;

  @ApiPropertyOptional({ description: 'responseStatus' })
  @IsOptional()
  @IsNumber()
  responseStatus?: number;

  @ApiPropertyOptional({ description: 'message' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ description: 'requesterLoginId' })
  @IsOptional()
  @IsNumber()
  requesterLoginId?: number;

  @ApiPropertyOptional({ description: 'requesterFullName' })
  @IsOptional()
  @IsString()
  requesterFullName?: string;

  @ApiPropertyOptional({ description: 'ipAddress' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'userAgent' })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({ description: 'durationMs' })
  @IsOptional()
  @IsNumber()
  durationMs?: number;

  @ApiPropertyOptional({ description: 'logDatetime' })
  @IsOptional()
  logDatetime?: Date;

}

export class LogResponseDto {
  @ApiProperty({ description: 'method' })
  method: string;

  @ApiProperty({ description: 'endpoint' })
  endpoint: string;

  @ApiProperty({ description: 'headers' })
  headers: any;

  @ApiProperty({ description: 'payload' })
  payload: any;

  @ApiProperty({ description: 'responseStatus' })
  responseStatus: number;

  @ApiProperty({ description: 'message' })
  message: string;

  @ApiProperty({ description: 'requesterLoginId' })
  requesterLoginId: number;

  @ApiProperty({ description: 'requesterFullName' })
  requesterFullName: string;

  @ApiProperty({ description: 'ipAddress' })
  ipAddress: string;

  @ApiProperty({ description: 'userAgent' })
  userAgent: string;

  @ApiProperty({ description: 'durationMs' })
  durationMs: number;

  @ApiProperty({ description: 'logDatetime' })
  logDatetime: Date;

}

export class QueryLogDto {
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
