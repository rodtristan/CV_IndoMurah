import { IsNotEmpty, IsOptional, IsString, MinLength, MaxLength, IsNumber, IsPositive } from 'class-validator';
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

  @ApiProperty({ example: 'password123', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiPropertyOptional({ example: 2, description: 'Kelompok akses (Role ID). Tidak ada default — tanpa roleId user tidak mendapat role apa pun.' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  roleId?: number;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'passwordLama123' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ example: 'passwordBaru123', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword: string;
}
