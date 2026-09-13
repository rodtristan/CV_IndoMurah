import { IsString, IsOptional, IsBoolean, IsInt, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccountType } from '@prisma/client';

export class CreateAccountDto {
  @ApiProperty({ description: 'Unique account code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Account name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Account type: ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE', enum: AccountType })
  @IsEnum(AccountType)
  type: AccountType;

  @ApiPropertyOptional({ description: 'Parent account ID for hierarchy' })
  @IsOptional()
  @IsInt()
  parent_id?: number;

  @ApiPropertyOptional({ default: true, description: 'Is account active' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateAccountDto {
  @ApiPropertyOptional({ description: 'Unique account code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'Account name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Account type: ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE', enum: AccountType })
  @IsOptional()
  @IsEnum(AccountType)
  type?: AccountType;

  @ApiPropertyOptional({ description: 'Parent account ID for hierarchy' })
  @IsOptional()
  @IsInt()
  parent_id?: number;

  @ApiPropertyOptional({ description: 'Is account active' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
