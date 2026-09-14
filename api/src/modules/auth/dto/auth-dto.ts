import { IsNotEmpty, IsOptional, IsString, MinLength, IsNumber, IsPositive, IsAlpha } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'INDOMURAH', description: 'Kode Perusahaan (companyCode)' })
  @IsString()
  @IsNotEmpty()
  companyCode: string;

  @ApiProperty({ example: 'admin', description: 'Username akun' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'admin123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'INDOMURAH', description: 'Kode Perusahaan (companyCode)' })
  @IsString()
  @IsNotEmpty()
  companyCode: string;

  @ApiProperty({ example: 'admin', description: 'Username akun' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiPropertyOptional({ example: 'admin@tokocvindomurah.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: '081234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiPropertyOptional({ example: 1, description: 'Default role assigned if omitted: 1' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  roleId?: number;
}
