import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateEMoneyDto {
  @ApiProperty({ example: 'EMN001' })
  @IsString()
  Code: string;

  @ApiProperty({ example: 'GoPay' })
  @IsString()
  Name: string;

  @ApiPropertyOptional({ example: '081234567890' })
  @IsString()
  @IsOptional()
  AccountNumber?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  AccountName?: string;

  @ApiPropertyOptional({ example: 'E-Money provider for digital payments' })
  @IsString()
  @IsOptional()
  Description?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  IsActive?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsNumber()
  @IsOptional()
  SortOrder?: number;
}

export class UpdateEMoneyDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  Code?: string;

  @ApiPropertyOptional({ example: 'GoPay' })
  @IsString()
  @IsOptional()
  Name?: string;

  @ApiPropertyOptional({ example: '081234567890' })
  @IsString()
  @IsOptional()
  AccountNumber?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  AccountName?: string;

  @ApiPropertyOptional({ example: 'E-Money provider for digital payments' })
  @IsString()
  @IsOptional()
  Description?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  IsActive?: boolean;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  SortOrder?: number;
}
