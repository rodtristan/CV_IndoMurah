import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber, IsInt } from 'class-validator';

export class CreateSubRegionDto {
  @ApiProperty({ example: 'SWL001' })
  @IsString()
  Code: string;

  @ApiProperty({ example: 'Jakarta Selatan' })
  @IsString()
  Name: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  RegionID: number;

  @ApiPropertyOptional({ example: 'Kota Jakarta Selatan' })
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

export class UpdateSubRegionDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  Code?: string;

  @ApiPropertyOptional({ example: 'Jakarta Selatan' })
  @IsString()
  @IsOptional()
  Name?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  RegionID?: number;

  @ApiPropertyOptional({ example: 'Kota Jakarta Selatan' })
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
