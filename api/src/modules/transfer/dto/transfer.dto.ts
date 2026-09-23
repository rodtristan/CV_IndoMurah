import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransferDto {
  @ApiProperty({ description: 'code' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: 'date' })
  @IsOptional()
  date?: Date;

  @ApiPropertyOptional({ description: 'fromAccountId' })
  @IsOptional()
  @IsNumber()
  fromAccountId?: number;

  @ApiPropertyOptional({ description: 'toAccountId' })
  @IsOptional()
  @IsNumber()
  toAccountId?: number;

  @ApiPropertyOptional({ description: 'fromWarehouseId' })
  @IsOptional()
  @IsNumber()
  fromWarehouseId?: number;

  @ApiPropertyOptional({ description: 'toWarehouseId' })
  @IsOptional()
  @IsNumber()
  toWarehouseId?: number;

  @ApiProperty({ description: 'amount' })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ description: 'description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'status' })
  status: any;

  @ApiPropertyOptional({ description: 'notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'isActive' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'fromAccount' })
  fromAccount: any;

  @ApiProperty({ description: 'toAccount' })
  toAccount: any;

  @ApiProperty({ description: 'fromWarehouse' })
  fromWarehouse: any;

  @ApiProperty({ description: 'toWarehouse' })
  toWarehouse: any;

}

export class UpdateTransferDto {
  @ApiPropertyOptional({ description: 'code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'date' })
  @IsOptional()
  date?: Date;

  @ApiPropertyOptional({ description: 'fromAccountId' })
  @IsOptional()
  @IsNumber()
  fromAccountId?: number;

  @ApiPropertyOptional({ description: 'toAccountId' })
  @IsOptional()
  @IsNumber()
  toAccountId?: number;

  @ApiPropertyOptional({ description: 'fromWarehouseId' })
  @IsOptional()
  @IsNumber()
  fromWarehouseId?: number;

  @ApiPropertyOptional({ description: 'toWarehouseId' })
  @IsOptional()
  @IsNumber()
  toWarehouseId?: number;

  @ApiPropertyOptional({ description: 'amount' })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ description: 'description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'status' })
  @IsOptional()
  status?: any;

  @ApiPropertyOptional({ description: 'notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'isActive' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'fromAccount' })
  @IsOptional()
  fromAccount?: any;

  @ApiPropertyOptional({ description: 'toAccount' })
  @IsOptional()
  toAccount?: any;

  @ApiPropertyOptional({ description: 'fromWarehouse' })
  @IsOptional()
  fromWarehouse?: any;

  @ApiPropertyOptional({ description: 'toWarehouse' })
  @IsOptional()
  toWarehouse?: any;

}

export class TransferResponseDto {
  @ApiProperty({ description: 'code' })
  code: string;

  @ApiProperty({ description: 'date' })
  date: Date;

  @ApiProperty({ description: 'fromAccountId' })
  fromAccountId: number;

  @ApiProperty({ description: 'toAccountId' })
  toAccountId: number;

  @ApiProperty({ description: 'fromWarehouseId' })
  fromWarehouseId: number;

  @ApiProperty({ description: 'toWarehouseId' })
  toWarehouseId: number;

  @ApiProperty({ description: 'amount' })
  amount: number;

  @ApiProperty({ description: 'description' })
  description: string;

  @ApiProperty({ description: 'status' })
  status: any;

  @ApiProperty({ description: 'notes' })
  notes: string;

  @ApiProperty({ description: 'isActive' })
  isActive: boolean;

  @ApiProperty({ description: 'fromAccount' })
  fromAccount: any;

  @ApiProperty({ description: 'toAccount' })
  toAccount: any;

  @ApiProperty({ description: 'fromWarehouse' })
  fromWarehouse: any;

  @ApiProperty({ description: 'toWarehouse' })
  toWarehouse: any;

}

export class QueryTransferDto {
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
