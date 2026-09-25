import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString, IsInt, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({ description: 'code' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: 'date', type: String, format: 'date-time' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date;

  @ApiPropertyOptional({ description: 'customerId' })
  @IsOptional()
  @IsNumber()
  customerId?: number;

  @ApiPropertyOptional({ description: 'customerName' })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({ description: 'customerPhone' })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiPropertyOptional({ description: 'customerAddress' })
  @IsOptional()
  @IsString()
  customerAddress?: string;

  @ApiPropertyOptional({ description: 'productName' })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiPropertyOptional({ description: 'serialNumber' })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({ description: 'problem' })
  @IsOptional()
  @IsString()
  problem?: string;

  @ApiPropertyOptional({ description: 'diagnosis' })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional({ description: 'Repair status ID (defaults to the initial status)' })
  @IsOptional()
  @IsNumber()
  repairStatusId?: number;

  @ApiPropertyOptional({ description: 'technician' })
  @IsOptional()
  @IsString()
  technician?: string;

  @ApiPropertyOptional({ description: 'warrantyUntil', type: String, format: 'date-time' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  warrantyUntil?: Date;

  @ApiPropertyOptional({ description: 'subtotal' })
  @IsOptional()
  @IsNumber()
  subtotal?: number;

  @ApiPropertyOptional({ description: 'laborCost' })
  @IsOptional()
  @IsNumber()
  laborCost?: number;

  @ApiPropertyOptional({ description: 'totalAmount' })
  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @ApiPropertyOptional({ description: 'notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'isActive' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;


}

export class UpdateServiceDto {
  @ApiPropertyOptional({ description: 'code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'date', type: String, format: 'date-time' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date;

  @ApiPropertyOptional({ description: 'customerId' })
  @IsOptional()
  @IsNumber()
  customerId?: number;

  @ApiPropertyOptional({ description: 'customerName' })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({ description: 'customerPhone' })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiPropertyOptional({ description: 'customerAddress' })
  @IsOptional()
  @IsString()
  customerAddress?: string;

  @ApiPropertyOptional({ description: 'productName' })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiPropertyOptional({ description: 'serialNumber' })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({ description: 'problem' })
  @IsOptional()
  @IsString()
  problem?: string;

  @ApiPropertyOptional({ description: 'diagnosis' })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional({ description: 'Repair status ID' })
  @IsOptional()
  @IsNumber()
  repairStatusId?: number;

  @ApiPropertyOptional({ description: 'technician' })
  @IsOptional()
  @IsString()
  technician?: string;

  @ApiPropertyOptional({ description: 'warrantyUntil', type: String, format: 'date-time' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  warrantyUntil?: Date;

  @ApiPropertyOptional({ description: 'subtotal' })
  @IsOptional()
  @IsNumber()
  subtotal?: number;

  @ApiPropertyOptional({ description: 'laborCost' })
  @IsOptional()
  @IsNumber()
  laborCost?: number;

  @ApiPropertyOptional({ description: 'totalAmount' })
  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @ApiPropertyOptional({ description: 'notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'isActive' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;


}

export class ServiceResponseDto {
  @ApiProperty({ description: 'code' })
  code: string;

  @ApiProperty({ description: 'date' })
  date: Date;

  @ApiProperty({ description: 'customerId' })
  customerId: number;

  @ApiProperty({ description: 'customerName' })
  customerName: string;

  @ApiProperty({ description: 'customerPhone' })
  customerPhone: string;

  @ApiProperty({ description: 'customerAddress' })
  customerAddress: string;

  @ApiProperty({ description: 'productName' })
  productName: string;

  @ApiProperty({ description: 'serialNumber' })
  serialNumber: string;

  @ApiProperty({ description: 'problem' })
  problem: string;

  @ApiProperty({ description: 'diagnosis' })
  diagnosis: string;

  @ApiProperty({ description: 'Repair status ID' })
  repairStatusId: number;

  @ApiProperty({ description: 'technician' })
  technician: string;

  @ApiProperty({ description: 'warrantyUntil' })
  warrantyUntil: Date;

  @ApiProperty({ description: 'subtotal' })
  subtotal: number;

  @ApiProperty({ description: 'laborCost' })
  laborCost: number;

  @ApiProperty({ description: 'totalAmount' })
  totalAmount: number;

  @ApiProperty({ description: 'notes' })
  notes: string;

  @ApiProperty({ description: 'isActive' })
  isActive: boolean;

  @ApiProperty({ description: 'customer' })
  customer: any;

}

export class QueryServiceDto {
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
