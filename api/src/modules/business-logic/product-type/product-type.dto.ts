import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductTypeDto {
  @ApiProperty({ description: 'Product Type Name' })
  @IsString()
  Name: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;
}

export class UpDateProductTypeDto {
  @ApiPropertyOptional({ description: 'Product Type Name' })
  @IsOptional()
  @IsString()
  Name?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;
}

export class ProductTypeFilterDto {
  @ApiPropertyOptional({ description: 'Active only' })
  @IsOptional()
  @IsBoolean()
  ActiveOnly?: boolean;

  @ApiPropertyOptional({ description: 'Search by Name' })
  @IsOptional()
  @IsString()
  Search?: string;
}
