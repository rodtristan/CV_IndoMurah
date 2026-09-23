import { IsOptional, IsString, IsNumber, IsDateString, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// ─────────────────────────────────────────────────────────────────────────────
// WORK ORDER
// ─────────────────────────────────────────────────────────────────────────────

export class WorkOrderItemDto {
  @IsNumber()
  ProductId: number;

  @IsNumber()
  Quantity: number;

  @IsOptional()
  @IsNumber()
  UnitId?: number;

  @IsOptional()
  @IsNumber()
  BOMId?: number; // Bill of Materials Reference
}

export class CreateWorkOrderDto {
  @IsDateString()
  WorkOrderDate: string;

  @IsOptional()
  @IsDateString()
  DueDate?: string;

  @IsOptional()
  @IsNumber()
  ProductionId?: number;

  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @IsOptional()
  @IsNumber()
  AssignedToId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkOrderItemDto)
  Items: WorkOrderItemDto[];

  @IsOptional()
  @IsString()
  Priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

  @IsOptional()
  @IsString()
  Notes?: string;
}

export class UpDateWorkOrderDto {
  @IsOptional()
  @IsDateString()
  DueDate?: string;

  @IsOptional()
  @IsNumber()
  AssignedToId?: number;

  @IsOptional()
  @IsString()
  Priority?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  Notes?: string;
}

export class WorkOrderFilterDto {
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @IsOptional()
  @IsDateString()
  EndDate?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @IsOptional()
  @IsNumber()
  AssignedToId?: number;

  @IsOptional()
  @IsString()
  Priority?: string;

  @IsOptional()
  @IsBoolean()
  OverdueOnly?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// WORK ORDER SCHEDULING
// ─────────────────────────────────────────────────────────────────────────────

export class ScheduleWorkOrderDto {
  @IsNumber()
  workOrderId: number;

  @IsDateString()
  scheduledStartDate: string;

  @IsDateString()
  scheduledEndDate: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleResourceDto)
  resources?: ScheduleResourceDto[];
}

export class ScheduleResourceDto {
  @IsString()
  resourceType: 'MACHINE' | 'WORKSTATION' | 'EMPLOYEE';

  @IsNumber()
  resourceId: number;

  @IsOptional()
  @IsNumber()
  AllocatedHours?: number;
}

export class WorkOrderSchedulingDto {
  @IsDateString()
  StartDate: string;

  @IsDateString()
  EndDate: string;

  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @IsOptional()
  @IsNumber()
  workStationId?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// WORK ORDER TRACKING
// ─────────────────────────────────────────────────────────────────────────────

export class RecordProgressDto {
  @IsNumber()
  workOrderId: number;

  @IsNumber()
  CompletedQuantity: number;

  @IsOptional()
  @IsString()
  Notes?: string;

  @IsOptional()
  @IsNumber()
  workStationId?: number;

  @IsOptional()
  @IsNumber()
  EmployeeId?: number;
}

export class MaterialAllocationDto {
  @IsNumber()
  workOrderId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterialAllocationItemDto)
  allocations: MaterialAllocationItemDto[];
}

export class MaterialAllocationItemDto {
  @IsNumber()
  ProductId: number;

  @IsNumber()
  AllocatedQuantity: number;

  @IsOptional()
  @IsString()
  Notes?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// WORK STATION MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

export class CreateWorkStationDto {
  @IsString()
  Name: string;

  @IsOptional()
  @IsString()
  Code?: string;

  @IsOptional()
  @IsString()
  Description?: string;

  @IsOptional()
  @IsNumber()
  capacity?: number; // Max concurrent jobs

  @IsOptional()
  @IsNumber()
  WarehouseId?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  capabilities?: string[]; // Types of work it can do
}

export class WorkStationFilterDto {
  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;

  @IsOptional()
  @IsNumber()
  WarehouseId?: number;
}
