import { IsString, IsOptional, IsBoolean, IsEmail, IsInt, IsNumber, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ description: 'Customer code' })
  @IsString()
  Code: string;

  @ApiProperty({ description: 'Customer name' })
  @IsString()
  Name: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  Phone?: string;

  @ApiPropertyOptional({ description: 'Email' })
  @IsOptional()
  @IsEmail()
  Email?: string;

  @ApiPropertyOptional({ description: 'Address' })
  @IsOptional()
  @IsString()
  Address?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;

  @ApiPropertyOptional({ description: 'Customer group ID' })
  @IsOptional()
  @IsInt()
  CustomerGroupID?: number;

  @ApiPropertyOptional({ description: 'Region (Wilayah) ID' })
  @IsOptional()
  @IsInt()
  RegionID?: number;

  @ApiPropertyOptional({ description: 'Sub-region (Sub Wilayah) ID' })
  @IsOptional()
  @IsInt()
  SubRegionID?: number;

  @ApiPropertyOptional({ description: 'City' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  City?: string;

  @ApiPropertyOptional({ description: 'Tax ID (NPWP)' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  TaxID?: string;

  @ApiPropertyOptional({ description: 'Receivable credit limit (0 = unlimited)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  CreditLimit?: number;

  @ApiPropertyOptional({ description: 'Payment due days (0 = use settings)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  DueDays?: number;

  @ApiPropertyOptional({ default: true, description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;
}

export class UpdateCustomerDto {
  @ApiPropertyOptional({ description: 'Customer code' })
  @IsOptional()
  @IsString()
  Code?: string;

  @ApiPropertyOptional({ description: 'Customer name' })
  @IsOptional()
  @IsString()
  Name?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  Phone?: string;

  @ApiPropertyOptional({ description: 'Email' })
  @IsOptional()
  @IsEmail()
  Email?: string;

  @ApiPropertyOptional({ description: 'Address' })
  @IsOptional()
  @IsString()
  Address?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;

  @ApiPropertyOptional({ description: 'Customer group ID' })
  @IsOptional()
  @IsInt()
  CustomerGroupID?: number;

  @ApiPropertyOptional({ description: 'Region (Wilayah) ID' })
  @IsOptional()
  @IsInt()
  RegionID?: number;

  @ApiPropertyOptional({ description: 'Sub-region (Sub Wilayah) ID' })
  @IsOptional()
  @IsInt()
  SubRegionID?: number;

  @ApiPropertyOptional({ description: 'City' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  City?: string;

  @ApiPropertyOptional({ description: 'Tax ID (NPWP)' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  TaxID?: string;

  @ApiPropertyOptional({ description: 'Receivable credit limit (0 = unlimited)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  CreditLimit?: number;

  @ApiPropertyOptional({ description: 'Payment due days (0 = use settings)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  DueDays?: number;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;
}
