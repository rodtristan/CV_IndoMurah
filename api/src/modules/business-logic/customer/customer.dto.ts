import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  Min,
  IsNotEmpty,
  IsEmail,
  IsPhoneNumber,
} from 'class-validator';

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMER DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class CreateCustomerDto {
  @ApiProperty({ description: 'Customer Code', example: 'CUST-001' })
  @IsString()
  @IsNotEmpty()
  Code: string;

  @ApiProperty({ description: 'Customer Name', example: 'Budi Santoso' })
  @IsString()
  @IsNotEmpty()
  Name: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  Phone?: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsEmail()
  Email?: string;

  @ApiPropertyOptional({ description: 'Customer address' })
  @IsOptional()
  @IsString()
  Address?: string;

  @ApiProperty({ description: 'Customer group ID' })
  @IsNumber()
  CustomerGroupId: number;

  @ApiPropertyOptional({ description: 'Initial point balance' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  PointBalance?: number;

  @ApiPropertyOptional({ description: 'Initial receivable Amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  TotalReceivable?: number;

  @ApiPropertyOptional({ description: 'Additional Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class UpdateCustomerDto {
  @ApiPropertyOptional({ description: 'Customer Name' })
  @IsOptional()
  @IsString()
  Name?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  Phone?: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsEmail()
  Email?: string;

  @ApiPropertyOptional({ description: 'Customer address' })
  @IsOptional()
  @IsString()
  Address?: string;

  @ApiPropertyOptional({ description: 'Customer group ID' })
  @IsOptional()
  @IsNumber()
  CustomerGroupId?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;

  @ApiPropertyOptional({ description: 'Is active status' })
  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;
}

export class CustomerFilterDto {
  @ApiPropertyOptional({ description: 'Search keyword (Name, Code, phone, email)' })
  @IsOptional()
  @IsString()
  Search?: string;

  @ApiPropertyOptional({ description: 'Filter by customer group ID' })
  @IsOptional()
  @IsNumber()
  CustomerGroupId?: number;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;

  @ApiPropertyOptional({ description: 'Show only customers with outstanding receivable' })
  @IsOptional()
  @IsBoolean()
  HasReceivable?: boolean;

  @ApiPropertyOptional({ description: 'Show only customers with loyalty points' })
  @IsOptional()
  @IsBoolean()
  HasPoints?: boolean;

  @ApiPropertyOptional({ description: 'Start Date filter for created at' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date filter for created at' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  Page?: number;

  @ApiPropertyOptional({ description: 'Page size', default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  Limit?: number;
}

export class CustomerTopDto {
  @ApiPropertyOptional({ description: 'Number of top customers', default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  Limit?: number;

  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;
}

export class CustomerSummaryDto {
  @ApiPropertyOptional({ description: 'Customer ID' })
  @IsOptional()
  @IsNumber()
  CustomerId?: number;
}

export class CustomerStatementDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsNumber()
  CustomerId: number;

  @ApiProperty({ description: 'Start Date' })
  @IsDateString()
  StartDate: string;

  @ApiProperty({ description: 'End Date' })
  @IsDateString()
  EndDate: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMER GROUP DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class CreateCustomerGroupDto {
  @ApiProperty({ description: 'Group Code' })
  @IsString()
  @IsNotEmpty()
  Code: string;

  @ApiProperty({ description: 'Group Name' })
  @IsString()
  @IsNotEmpty()
  Name: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;

  @ApiPropertyOptional({ description: 'Discount percent for this group' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  DiscountPercent?: number;

  @ApiPropertyOptional({ description: 'Point multiplier' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  PointMultiplier?: number;
}

export class UpdateCustomerGroupDto {
  @ApiPropertyOptional({ description: 'Group Name' })
  @IsOptional()
  @IsString()
  Name?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;

  @ApiPropertyOptional({ description: 'Discount percent' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  DiscountPercent?: number;

  @ApiPropertyOptional({ description: 'Point multiplier' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  PointMultiplier?: number;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// ADD BALANCE DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class AddReceivableDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsNumber()
  CustomerId: number;

  @ApiProperty({ description: 'Amount to add' })
  @IsNumber()
  @Min(0.01)
  Amount: number;

  @ApiPropertyOptional({ description: 'Reference Type (e.g., Sale, Invoice)' })
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

export class PaymentReceivableDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsNumber()
  CustomerId: number;

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

export class AdjustPointsDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsNumber()
  CustomerId: number;

  @ApiProperty({ description: 'Points to adjust (positive to add, negative to subtract)' })
  @IsNumber()
  Points: number;

  @ApiProperty({ description: 'Reason for Adjustment' })
  @IsString()
  @IsNotEmpty()
  Reason: string;
}
