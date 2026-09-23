import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductPriceDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNumber()
  ProductId: number;

  @ApiProperty({ description: 'Unit ID' })
  @IsNumber()
  UnitId: number;

  @ApiProperty({ description: 'Price Type: STANDARD, BULK, SPECIAL, PROMOTION' })
  @IsString()
  PriceType: string;

  @ApiProperty({ description: 'Price value' })
  @IsNumber()
  @Min(0)
  Price: number;

  @ApiPropertyOptional({ description: 'Minimum Quantity for this price' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  MinQuantity?: number;

  @ApiPropertyOptional({ description: 'Maximum Quantity for this price' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  MaxQuantity?: number;

  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Is active (1 = active, 0 = inactive)' })
  @IsOptional()
  @IsNumber()
  IsActive?: number;
}

export class ProductPriceFilterDto {
  @ApiPropertyOptional({ description: 'Product ID filter' })
  @IsOptional()
  @IsNumber()
  ProductId?: number;

  @ApiPropertyOptional({ description: 'Unit ID filter' })
  @IsOptional()
  @IsNumber()
  UnitId?: number;

  @ApiPropertyOptional({ description: 'Price Type filter' })
  @IsOptional()
  @IsString()
  PriceType?: string;

  @ApiPropertyOptional({ description: 'Active only' })
  @IsOptional()
  @IsBoolean()
  ActiveOnly?: boolean;
}

export class GetPriceDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNumber()
  ProductId: number;

  @ApiPropertyOptional({ description: 'Unit ID' })
  @IsOptional()
  @IsNumber()
  UnitId?: number;

  @ApiPropertyOptional({ description: 'Quantity' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  Quantity?: number;

  @ApiPropertyOptional({ description: 'Customer ID' })
  @IsOptional()
  @IsNumber()
  CustomerId?: number;

  @ApiPropertyOptional({ description: 'Price Type' })
  @IsOptional()
  @IsString()
  PriceType?: string;
}
