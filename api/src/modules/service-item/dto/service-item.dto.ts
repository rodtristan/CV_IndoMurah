import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceItemDto {
  @ApiProperty({ description: 'serviceId' })
  @IsNumber()
  serviceId: number;

  @ApiPropertyOptional({ description: 'productId' })
  @IsOptional()
  @IsNumber()
  productId?: number;

  @ApiProperty({ description: 'productName' })
  @IsString()
  productName: string;

  @ApiProperty({ description: 'quantity' })
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional({ description: 'unitPrice' })
  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @ApiPropertyOptional({ description: 'subtotal' })
  @IsOptional()
  @IsNumber()
  subtotal?: number;


}

export class UpdateServiceItemDto {
  @ApiPropertyOptional({ description: 'serviceId' })
  @IsOptional()
  @IsNumber()
  serviceId?: number;

  @ApiPropertyOptional({ description: 'productId' })
  @IsOptional()
  @IsNumber()
  productId?: number;

  @ApiPropertyOptional({ description: 'productName' })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiPropertyOptional({ description: 'quantity' })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional({ description: 'unitPrice' })
  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @ApiPropertyOptional({ description: 'subtotal' })
  @IsOptional()
  @IsNumber()
  subtotal?: number;


}

export class ServiceItemResponseDto {
  @ApiProperty({ description: 'serviceId' })
  serviceId: number;

  @ApiProperty({ description: 'productId' })
  productId: number;

  @ApiProperty({ description: 'productName' })
  productName: string;

  @ApiProperty({ description: 'quantity' })
  quantity: number;

  @ApiProperty({ description: 'unitPrice' })
  unitPrice: number;

  @ApiProperty({ description: 'subtotal' })
  subtotal: number;

  @ApiProperty({ description: 'service' })
  service: any;

  @ApiProperty({ description: 'product' })
  product: any;

}

export class QueryServiceItemDto {
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
