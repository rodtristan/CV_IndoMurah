import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductionScheduleDto {
  @ApiProperty({ description: 'Product ID to produce' })
  @IsNumber()
  ProductId: number;

  @ApiPropertyOptional({ description: 'Warehouse ID' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @ApiProperty({ description: 'Scheduled production Date' })
  @IsDateString()
  ScheduledDate: string;

  @ApiProperty({ description: 'Quantity to produce' })
  @IsNumber()
  @Min(0.0001)
  Quantity: number;

  @ApiPropertyOptional({ description: 'Status: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED' })
  @IsOptional()
  @IsString()
  Status?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class UpDateProductionScheduleDto {
  @ApiPropertyOptional({ description: 'Scheduled Date' })
  @IsOptional()
  @IsDateString()
  ScheduledDate?: string;

  @ApiPropertyOptional({ description: 'Quantity' })
  @IsOptional()
  @IsNumber()
  Quantity?: number;

  @ApiPropertyOptional({ description: 'Status' })
  @IsOptional()
  @IsString()
  Status?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class ProductionScheduleFilterDto {
  @ApiPropertyOptional({ description: 'Product ID filter' })
  @IsOptional()
  @IsNumber()
  ProductId?: number;

  @ApiPropertyOptional({ description: 'Warehouse ID filter' })
  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @ApiPropertyOptional({ description: 'Status filter' })
  @IsOptional()
  @IsString()
  Status?: string;

  @ApiPropertyOptional({ description: 'Start Date filter' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date filter' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;
}
