import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber, IsInt, IsNumberString } from 'class-validator';

export class CreateShippingCostDto {
  @ApiProperty({ example: 'ONG001' })
  @IsString()
  Code: string;

  @ApiProperty({ example: 'JNE Regular' })
  @IsString()
  Name: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  RegionID?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  SubRegionID?: number;

  @ApiProperty({ example: 15000 })
  @IsNumber()
  Cost: number;

  @ApiPropertyOptional({ example: 3 })
  @IsInt()
  @IsOptional()
  EstimatedDays?: number;

  @ApiPropertyOptional({ example: 'Ongkir reguler JNE' })
  @IsString()
  @IsOptional()
  Description?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  IsActive?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsNumber()
  @IsOptional()
  SortOrder?: number;
}

export class UpdateShippingCostDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  Code?: string;

  @ApiPropertyOptional({ example: 'JNE Regular' })
  @IsString()
  @IsOptional()
  Name?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  RegionID?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  SubRegionID?: number;

  @ApiPropertyOptional({ example: 15000 })
  @IsNumber()
  @IsOptional()
  Cost?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsInt()
  @IsOptional()
  EstimatedDays?: number;

  @ApiPropertyOptional({ example: 'Ongkir reguler JNE' })
  @IsString()
  @IsOptional()
  Description?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  IsActive?: boolean;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  SortOrder?: number;
}
