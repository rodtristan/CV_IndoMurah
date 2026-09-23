import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  Min,
  IsNotEmpty,
  IsEmail,
} from 'class-validator';

// ─────────────────────────────────────────────────────────────────────────────
// SUPPLIER DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class CreateSupplierDto {
  @ApiProperty({ description: 'Supplier Code' })
  @IsString()
  @IsNotEmpty()
  Code: string;

  @ApiProperty({ description: 'Supplier Name' })
  @IsString()
  @IsNotEmpty()
  Name: string;

  @ApiPropertyOptional({ description: 'Contact person Name' })
  @IsOptional()
  @IsString()
  ContactPerson?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  Phone?: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsEmail()
  Email?: string;

  @ApiPropertyOptional({ description: 'Full address' })
  @IsOptional()
  @IsString()
  Address?: string;

  @ApiPropertyOptional({ description: 'Initial debt Amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  TotalDebt?: number;

  @ApiPropertyOptional({ description: 'Additional Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class UpDateSupplierDto {
  @ApiPropertyOptional({ description: 'Supplier Name' })
  @IsOptional()
  @IsString()
  Name?: string;

  @ApiPropertyOptional({ description: 'Contact person Name' })
  @IsOptional()
  @IsString()
  ContactPerson?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  Phone?: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsEmail()
  Email?: string;

  @ApiPropertyOptional({ description: 'Full address' })
  @IsOptional()
  @IsString()
  Address?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;

  @ApiPropertyOptional({ description: 'Is active status' })
  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;
}

export class SupplierFilterDto {
  @ApiPropertyOptional({ description: 'Search keyword (Name, Code, phone)' })
  @IsOptional()
  @IsString()
  Search?: string;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;

  @ApiPropertyOptional({ description: 'Show only suppliers with outstanding debt' })
  @IsOptional()
  @IsBoolean()
  HasDebt?: boolean;

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

export class SupplierStatementDto {
  @ApiProperty({ description: 'Supplier ID' })
  @IsNumber()
  SupplierId: number;

  @ApiProperty({ description: 'Start Date' })
  @IsDateString()
  StartDate: string;

  @ApiProperty({ description: 'End Date' })
  @IsDateString()
  EndDate: string;
}

export class AddSupplierDebtDto {
  @ApiProperty({ description: 'Supplier ID' })
  @IsNumber()
  SupplierId: number;

  @ApiProperty({ description: 'Amount to add' })
  @IsNumber()
  @Min(0.01)
  Amount: number;

  @ApiPropertyOptional({ description: 'Reference Type' })
  @IsOptional()
  @IsString()
  ReferenceType?: string;

  @ApiPropertyOptional({ description: 'Reference ID' })
  @IsOptional()
  @IsNumber()
  ReferenceId?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class PaymentSupplierDebtDto {
  @ApiProperty({ description: 'Supplier ID' })
  @IsNumber()
  SupplierId: number;

  @ApiProperty({ description: 'Payment Amount' })
  @IsNumber()
  @Min(0.01)
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
