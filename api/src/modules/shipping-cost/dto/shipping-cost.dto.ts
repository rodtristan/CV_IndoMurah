import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNumber, IsNumberString, IsOptional, IsString, MaxLength, Min } from 'class-validator';

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

  @ApiPropertyOptional({ description: 'Dari Kota' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  FromCity?: string | null;

  @ApiPropertyOptional({ description: 'Kota Tujuan' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ToCity?: string | null;

  @ApiPropertyOptional({ description: 'Negara' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  Country?: string | null;

  @ApiPropertyOptional({ description: 'Biaya 2' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  Cost2?: number;

  @ApiPropertyOptional({ description: 'Biaya 3' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  Cost3?: number;
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

  @ApiPropertyOptional({ description: 'Dari Kota' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  FromCity?: string | null;

  @ApiPropertyOptional({ description: 'Kota Tujuan' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ToCity?: string | null;

  @ApiPropertyOptional({ description: 'Negara' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  Country?: string | null;

  @ApiPropertyOptional({ description: 'Biaya 2' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  Cost2?: number;

  @ApiPropertyOptional({ description: 'Biaya 3' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  Cost3?: number;
}
