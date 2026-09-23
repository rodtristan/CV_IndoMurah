import { IsOptional, IsString, IsNumber, IsDateString, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// ─────────────────────────────────────────────────────────────────────────────
// QC INSPECTION
// ─────────────────────────────────────────────────────────────────────────────

export class QCInspectionItemDto {
  @IsNumber()
  ProductId: number;

  @IsNumber()
  Quantity: number;

  @IsOptional()
  @IsNumber()
  UnitId?: number;

  @IsOptional()
  @IsString()
  BatchNumber?: string;
}

export class CreateQCInspectionDto {
  @IsString()
  InspectionType: 'INCOMING' | 'IN_PROCESS' | 'FINISHED_GOODS';

  @IsDateString()
  InspectionDate: string;

  @IsOptional()
  @IsNumber()
  SupplierId?: number;

  @IsOptional()
  @IsNumber()
  ProductionId?: number;

  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @IsOptional()
  @IsString()
  ReferenceNumber?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QCInspectionItemDto)
  Items: QCInspectionItemDto[];

  @IsOptional()
  @IsString()
  Notes?: string;
}

export class RecordQCResultDto {
  @IsNumber()
  itemId: number;

  @IsNumber()
  InspectedQuantity: number;

  @IsNumber()
  PassedQuantity: number;

  @IsOptional()
  @IsNumber()
  RejectedQuantity?: number;

  @IsString()
  Result: 'PASS' | 'FAIL' | 'CONDITIONAL_PASS';

  @IsOptional()
  @IsString()
  RejectionReason?: string;

  @IsOptional()
  @IsString()
  Notes?: string;
}

export class QCInspectionFilterDto {
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @IsOptional()
  @IsString()
  inspectionType?: 'INCOMING' | 'IN_PROCESS' | 'FINISHED_GOODS';

  @IsOptional()
  @IsNumber()
  SupplierId?: number;

  @IsOptional()
  @IsNumber()
  ProductionId?: number;

  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @IsOptional()
  @IsString()
  Status?: string;

  @IsOptional()
  @IsString()
  Result?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFECT TRACKING
// ─────────────────────────────────────────────────────────────────────────────

export class CreateDefectReportDto {
  @IsNumber()
  ProductId: number;

  @IsNumber()
  Quantity: number;

  @IsString()
  defectType: string;

  @IsOptional()
  @IsString()
  Severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  @IsOptional()
  @IsNumber()
  ProductionId?: number;

  @IsOptional()
  @IsNumber()
  SaleId?: number;

  @IsOptional()
  @IsString()
  Description?: string;

  @IsOptional()
  @IsString()
  RootCause?: string;

  @IsOptional()
  @IsString()
  CorrectiveAction?: string;
}

export class DefectFilterDto {
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @IsOptional()
  @IsString()
  DefectType?: string;

  @IsOptional()
  @IsString()
  Severity?: string;

  @IsOptional()
  @IsString()
  Status?: string;

  @IsOptional()
  @IsNumber()
  ProductId?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// QC STANDARDS
// ─────────────────────────────────────────────────────────────────────────────

export class CreateQCStandardDto {
  @IsNumber()
  ProductId: number;

  @IsString()
  InspectionType: 'INCOMING' | 'IN_PROCESS' | 'FINISHED_GOODS';

  @IsOptional()
  @IsNumber()
  SampleSize?: number;

  @IsOptional()
  @IsNumber()
  AcceptableQualityLevel?: number; // AQL

  @IsOptional()
  @IsNumber()
  MinimumPassingScore?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QCCheckpointDto)
  CheckPoints?: QCCheckpointDto[];
}

export class QCCheckpointDto {
  @IsString()
  Name: string;

  @IsString()
  Description: string;

  @IsOptional()
  @IsBoolean()
  IsMandatory?: boolean;

  @IsOptional()
  @IsNumber()
  Weight?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// CALIBRATION
// ─────────────────────────────────────────────────────────────────────────────

export class CreateCalibrationDto {
  @IsString()
  EquipmentName: string;

  @IsOptional()
  @IsString()
  EquipmentCode?: string;

  @IsOptional()
  @IsNumber()
  CalibrationInterval?: number; // in days

  @IsOptional()
  @IsDateString()
  LastCalibrationDate?: string;

  @IsOptional()
  @IsDateString()
  NextCalibrationDate?: string;
}

export class CalibrationFilterDto {
  @IsOptional()
  @IsString()
  Status?: 'OK' | 'DUE' | 'OVERDUE';
}
