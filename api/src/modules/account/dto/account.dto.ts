import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAccountDto {
  @ApiProperty({ description: 'Account code' })
  @IsString()
  Code: string;

  @ApiProperty({ description: 'Account name' })
  @IsString()
  Name: string;

  @ApiProperty({ description: 'Account type ID' })
  @IsInt()
  TypeID: number;

  @ApiPropertyOptional({ description: 'Parent account ID' })
  @IsOptional()
  @IsInt()
  ParentID?: number;

  @ApiPropertyOptional({ default: true, description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;
}

export class UpdateAccountDto {
  @ApiPropertyOptional({ description: 'Account code' })
  @IsOptional()
  @IsString()
  Code?: string;

  @ApiPropertyOptional({ description: 'Account name' })
  @IsOptional()
  @IsString()
  Name?: string;

  @ApiPropertyOptional({ description: 'Account type ID' })
  @IsOptional()
  @IsInt()
  TypeID?: number;

  @ApiPropertyOptional({ description: 'Parent account ID' })
  @IsOptional()
  @IsInt()
  ParentID?: number;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;
}
