import { IsOptional, IsString, IsNumber, IsPositive, IsBoolean, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional() @IsOptional() @IsString() full_name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone_number?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() photo_url?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @IsPositive() main_role_id?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() is_active?: boolean;
}

export class AssignRoleDto {
  @ApiProperty()
  @IsInt()
  role_id: number;
}
