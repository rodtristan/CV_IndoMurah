import { IsBoolean, IsIn, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWarehouseDto {
  @ApiProperty({ description: 'Warehouse code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Warehouse name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ default: false, description: 'Is default warehouse' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ default: true, description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Fungsi: MAIN (Utama) | BRANCH (Cabang) | WAREHOUSE (Gudang)' })
  @IsOptional()
  @IsIn(['MAIN', 'BRANCH', 'WAREHOUSE'])
  function?: string;

  @ApiPropertyOptional({ description: 'No Fax' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  fax?: string | null;

  @ApiPropertyOptional({ description: 'Kode akun persediaan' })
  @IsOptional()
  @IsInt()
  accountId?: number | null;
}

export class UpdateWarehouseDto {
  @ApiPropertyOptional({ description: 'Warehouse code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'Warehouse name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Is default warehouse' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Fungsi: MAIN (Utama) | BRANCH (Cabang) | WAREHOUSE (Gudang)' })
  @IsOptional()
  @IsIn(['MAIN', 'BRANCH', 'WAREHOUSE'])
  function?: string;

  @ApiPropertyOptional({ description: 'No Fax' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  fax?: string | null;

  @ApiPropertyOptional({ description: 'Kode akun persediaan' })
  @IsOptional()
  @IsInt()
  accountId?: number | null;
}
