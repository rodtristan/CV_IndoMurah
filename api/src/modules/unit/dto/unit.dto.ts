import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUnitDto {
  @ApiProperty({ description: 'Unique unit code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Unit name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Unit abbreviation (e.g., pcs, kg, box)' })
  @IsString()
  abbreviation: string;

  @ApiPropertyOptional({ default: true, description: 'Is unit active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}


export class UpdateUnitDto {
  @ApiPropertyOptional({ description: 'Unique unit code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'Unit name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Unit abbreviation' })
  @IsOptional()
  @IsString()
  abbreviation?: string;

  @ApiPropertyOptional({ description: 'Is unit active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
