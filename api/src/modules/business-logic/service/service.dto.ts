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
} from 'class-validator';

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE/REPAIR DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class ServiceItemDto {
  @ApiPropertyOptional({ description: 'Product ID (if using inventory)' })
  @IsOptional()
  @IsNumber()
  ProductId?: number;

  @ApiProperty({ description: 'Item/service Name' })
  @IsString()
  @IsNotEmpty()
  ProductName: string;

  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  @Min(0.001)
  Quantity: number;

  @ApiPropertyOptional({ description: 'Unit price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  UnitPrice?: number;
}

export class CreateServiceDto {
  @ApiPropertyOptional({ description: 'Service Date' })
  @IsOptional()
  @IsDateString()
  Date?: string;

  @ApiPropertyOptional({ description: 'Customer ID (if registered customer)' })
  @IsOptional()
  @IsNumber()
  CustomerId?: number;

  @ApiProperty({ description: 'Customer Name' })
  @IsString()
  @IsNotEmpty()
  CustomerName: string;

  @ApiPropertyOptional({ description: 'Customer phone' })
  @IsOptional()
  @IsString()
  CustomerPhone?: string;

  @ApiPropertyOptional({ description: 'Customer address' })
  @IsOptional()
  @IsString()
  CustomerAddress?: string;

  @ApiPropertyOptional({ description: 'Product Name being serviced' })
  @IsOptional()
  @IsString()
  ProductName?: string;

  @ApiPropertyOptional({ description: 'Serial number' })
  @IsOptional()
  @IsString()
  SerialNumber?: string;

  @ApiProperty({ description: 'Problem Description' })
  @IsString()
  @IsNotEmpty()
  Problem: string;

  @ApiPropertyOptional({ description: 'Diagnosis' })
  @IsOptional()
  @IsString()
  Diagnosis?: string;

  @ApiPropertyOptional({ description: 'Technician Name' })
  @IsOptional()
  @IsString()
  Technician?: string;

  @ApiPropertyOptional({ description: 'Warranty until Date' })
  @IsOptional()
  @IsDateString()
  WarrantyUntil?: string;

  @ApiPropertyOptional({ description: 'Labor cost' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  LaborCost?: number;

  @ApiPropertyOptional({ description: 'Service Items', type: [ServiceItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceItemDto)
  Items?: ServiceItemDto[];

  @ApiPropertyOptional({ description: 'Service Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class UpDateServiceStatusDto {
  @ApiProperty({ description: 'New status ID' })
  @IsNumber()
  StatusId: number;

  @ApiPropertyOptional({ description: 'Diagnosis upDate' })
  @IsOptional()
  @IsString()
  Diagnosis?: string;

  @ApiPropertyOptional({ description: 'Technician' })
  @IsOptional()
  @IsString()
  Technician?: string;

  @ApiPropertyOptional({ description: 'Status Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class AddServiceItemDto {
  @ApiPropertyOptional({ description: 'Product ID' })
  @IsOptional()
  @IsNumber()
  ProductId?: number;

  @ApiProperty({ description: 'Item Name' })
  @IsString()
  @IsNotEmpty()
  ProductName: string;

  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  @Min(0.001)
  Quantity: number;

  @ApiProperty({ description: 'Unit price' })
  @IsNumber()
  @Min(0)
  UnitPrice: number;
}

export class CompleteServiceDto {
  @ApiProperty({ description: 'Final diagnosis' })
  @IsString()
  @IsNotEmpty()
  Diagnosis: string;

  @ApiProperty({ description: 'Labor cost' })
  @IsNumber()
  @Min(0)
  LaborCost: number;

  @ApiPropertyOptional({ description: 'Total Amount override' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  TotalAmount?: number;

  @ApiPropertyOptional({ description: 'Completion Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class ServiceFilterDto {
  @ApiPropertyOptional({ description: 'Customer ID filter' })
  @IsOptional()
  @IsNumber()
  CustomerId?: number;

  @ApiPropertyOptional({ description: 'Status ID filter' })
  @IsOptional()
  @IsNumber()
  StatusId?: number;

  @ApiPropertyOptional({ description: 'Start Date filter' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date filter' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Technician filter' })
  @IsOptional()
  @IsString()
  Technician?: string;

  @ApiPropertyOptional({ description: 'Pending/in progress only' })
  @IsOptional()
  @IsBoolean()
  PendingOnly?: boolean;
}

export class RecordServicePaymentDto {
  @ApiProperty({ description: 'Payment Amount' })
  @IsNumber()
  @Min(0.01)
  Amount: number;

  @ApiProperty({ description: 'Payment method ID' })
  @IsNumber()
  PaymentMethodId: number;

  @ApiPropertyOptional({ description: 'Reference number' })
  @IsOptional()
  @IsString()
  ReferenceNumber?: string;

  @ApiPropertyOptional({ description: 'Payment Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}
