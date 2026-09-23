import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested } from 'class-validator';

// ─────────────────────────────────────────────────────────────────────────────
// QC CATEGORY DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class CreateQCCategoryDto {
  @ApiProperty({ description: 'Category Code' })
  @IsString()
  Code: string;

  @ApiProperty({ description: 'Category Name' })
  @IsString()
  Name: string;

  @ApiPropertyOptional({ description: 'Category Description' })
  @IsOptional()
  @IsString()
  Description?: string;

  @ApiPropertyOptional({ description: 'QC Type: INSPECTION, TEST, APPROVAL' })
  @IsOptional()
  @IsString()
  QcType?: string;
}

export class UpdateQCCategoryDto {
  @ApiPropertyOptional({ description: 'Category Name' })
  @IsOptional()
  @IsString()
  Name?: string;

  @ApiPropertyOptional({ description: 'Category Description' })
  @IsOptional()
  @IsString()
  Description?: string;

  @ApiPropertyOptional({ description: 'QC Type' })
  @IsOptional()
  @IsString()
  QcType?: string;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// QC CHECKPOINT DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class CreateQCCheckpointDto {
  @ApiProperty({ description: 'Checkpoint Name' })
  @IsString()
  Name: string;

  @ApiProperty({ description: 'QC Category ID' })
  @IsNumber()
  CategoryId: number;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;

  @ApiPropertyOptional({ description: 'Is required' })
  @IsOptional()
  @IsBoolean()
  IsRequired?: boolean;

  @ApiPropertyOptional({ description: 'Pass criteria' })
  @IsOptional()
  @IsString()
  PassCriteria?: string;
}

export class UpdateQCCheckpointDto {
  @ApiPropertyOptional({ description: 'Checkpoint Name' })
  @IsOptional()
  @IsString()
  Name?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  Description?: string;

  @ApiPropertyOptional({ description: 'Is required' })
  @IsOptional()
  @IsBoolean()
  IsRequired?: boolean;

  @ApiPropertyOptional({ description: 'Pass criteria' })
  @IsOptional()
  @IsString()
  PassCriteria?: string;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// QC CHECK DTOs
// ─────────────────────────────────────────────────────────────────────────────
export class QCCheckpointResultDto {
  @ApiProperty({ description: 'Checkpoint ID' })
  @IsNumber()
  CheckpointId: number;

  @ApiProperty({ description: 'Result: PASS, FAIL, NA' })
  @IsString()
  Result: string;

  @ApiPropertyOptional({ description: 'Actual value' })
  @IsOptional()
  @IsString()
  ActualValue?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class RecordQCCheckDto {
  @ApiProperty({ description: 'QC Category ID' })
  @IsNumber()
  CategoryId: number;

  @ApiProperty({ description: 'Reference Type (e.g., PRODUCTION, PURCHASE)' })
  @IsString()
  ReferenceType: string;

  @ApiProperty({ description: 'Reference ID' })
  @IsNumber()
  ReferenceId: number;

  @ApiProperty({ description: 'QC Date' })
  @IsString()
  Date: string;

  @ApiPropertyOptional({ description: 'Inspector Name' })
  @IsOptional()
  @IsString()
  InspectorName?: string;

  @ApiPropertyOptional({ description: 'Overall result: PASS, FAIL, CONDITIONAL' })
  @IsOptional()
  @IsString()
  Result?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;

  @ApiPropertyOptional({ description: 'Checkpoint results', type: [QCCheckpointResultDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QCCheckpointResultDto)
  CheckpointResults?: QCCheckpointResultDto[];
}

export class QCCheckFilterDto {
  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date' })
  @IsOptional()
  @IsString()
  EndDate?: string;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsNumber()
  CategoryId?: number;

  @ApiPropertyOptional({ description: 'Result filter' })
  @IsOptional()
  @IsString()
  Result?: string;
}
