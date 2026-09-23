import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// ─────────────────────────────────────────────────────────────────────────────
// ATTENDANCE DEVICE DTOs
// ─────────────────────────────────────────────────────────────────────────────

export class DeviceConfigDto {
  @ApiProperty({ description: 'Device Name' })
  @IsString()
  @IsNotEmpty()
  Name: string;

  @ApiProperty({ description: 'Device IP address or hostName' })
  @IsString()
  @IsNotEmpty()
  Host: string;

  @ApiProperty({ description: 'Device port' })
  @IsNumber()
  Port: number;

  @ApiProperty({ description: 'Communication key' })
  @IsOptional()
  @IsString()
  CommKey?: string;

  @ApiPropertyOptional({ description: 'Device Type: FINGERPRINT, RFID, COMBO' })
  @IsOptional()
  @IsString()
  DeviceType?: string;

  @ApiPropertyOptional({ description: 'Location' })
  @IsOptional()
  @IsString()
  Location?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  Notes?: string;
}

export class UpdateDeviceConfigDto {
  @ApiPropertyOptional({ description: 'Device Name' })
  @IsOptional()
  @IsString()
  Name?: string;

  @ApiPropertyOptional({ description: 'Device IP address' })
  @IsOptional()
  @IsString()
  Host?: string;

  @ApiPropertyOptional({ description: 'Device port' })
  @IsOptional()
  @IsNumber()
  Port?: number;

  @ApiPropertyOptional({ description: 'Communication key' })
  @IsOptional()
  @IsString()
  CommKey?: string;

  @ApiPropertyOptional({ description: 'Location' })
  @IsOptional()
  @IsString()
  Location?: string;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsString()
  IsActive?: string;
}

export class AttendanceRecordDto {
  @ApiProperty({ description: 'Employee Code from device' })
  @IsString()
  @IsNotEmpty()
  EmployeeCode: string;

  @ApiProperty({ description: 'Date and time of attendance' })
  @IsDateString()
  DateTime: string;

  @ApiProperty({ description: 'Attendance Type' })
  @IsString()
  Type: 'CHECK_IN' | 'CHECK_OUT' | 'BREAK_IN' | 'BREAK_OUT' | 'OVERTIME_IN' | 'OVERTIME_OUT';

  @ApiPropertyOptional({ description: 'Verification method' })
  @IsOptional()
  @IsString()
  Verification?: 'FINGERPRINT' | 'FACE' | 'CARD' | 'PASSWORD' | 'OTHER';

  @ApiPropertyOptional({ description: 'Device ID' })
  @IsOptional()
  @IsNumber()
  DeviceId?: number;
}

export class SyncAttendanceDto {
  @ApiProperty({ description: 'Device ID' })
  @IsNumber()
  DeviceId: number;

  @ApiProperty({ description: 'Attendance records', type: [AttendanceRecordDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordDto)
  Records: AttendanceRecordDto[];

  @ApiPropertyOptional({ description: 'Sync timestamp' })
  @IsOptional()
  @IsDateString()
  SyncTimestamp?: string;
}

export class DeviceFilterDto {
  @ApiPropertyOptional({ description: 'Active only' })
  @IsOptional()
  @IsString()
  ActiveOnly?: string;

  @ApiPropertyOptional({ description: 'Device Type' })
  @IsOptional()
  @IsString()
  DeviceType?: string;

  @ApiPropertyOptional({ description: 'Location' })
  @IsOptional()
  @IsString()
  Location?: string;
}

export class EmployeeMappingDto {
  @ApiProperty({ description: 'Employee ID from HR system' })
  @IsNumber()
  EmployeeId: number;

  @ApiProperty({ description: 'Employee Code from device' })
  @IsString()
  @IsNotEmpty()
  DeviceCode: string;

  @ApiPropertyOptional({ description: 'Fingerprint template data (base64)' })
  @IsOptional()
  @IsString()
  FingerprintTemplate?: string;

  @ApiPropertyOptional({ description: 'Face template data (base64)' })
  @IsOptional()
  @IsString()
  FaceTemplate?: string;
}

export class BulkEmployeeMappingDto {
  @ApiProperty({ description: 'Employee mappings', type: [EmployeeMappingDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmployeeMappingDto)
  Mappings: EmployeeMappingDto[];
}

export class DeviceLogDto {
  @ApiPropertyOptional({ description: 'Device ID' })
  @IsOptional()
  @IsNumber()
  DeviceId?: number;

  @ApiPropertyOptional({ description: 'Log Type' })
  @IsOptional()
  @IsString()
  LogType?: string;

  @ApiPropertyOptional({ description: 'Start Date' })
  @IsOptional()
  @IsDateString()
  StartDate?: string;

  @ApiPropertyOptional({ description: 'End Date' })
  @IsOptional()
  @IsDateString()
  EndDate?: string;
}

export class DeviceCommandDto {
  @ApiProperty({ description: 'Command to execute' })
  @IsString()
  Command: 'REBOOT' | 'CLEAR_LOG' | 'CLEAR_ATTENDANCE' | 'GET_TIME' | 'SET_TIME' | 'ENROLL' | 'DELETE_USER';

  @ApiPropertyOptional({ description: 'Target user ID (for ENROLL/DELETE_USER)' })
  @IsOptional()
  @IsString()
  UserId?: string;
}

export class ScheduleDto {
  @ApiProperty({ description: 'Schedule Name' })
  @IsString()
  @IsNotEmpty()
  Name: string;

  @ApiProperty({ description: 'Monday check-in time' })
  @IsOptional()
  @IsString()
  MonIn?: string;

  @ApiProperty({ description: 'Monday check-out time' })
  @IsOptional()
  @IsString()
  MonOut?: string;

  @ApiProperty({ description: 'Tuesday check-in time' })
  @IsOptional()
  @IsString()
  TueIn?: string;

  @ApiProperty({ description: 'Tuesday check-out time' })
  @IsOptional()
  @IsString()
  TueOut?: string;

  @ApiProperty({ description: 'Wednesday check-in time' })
  @IsOptional()
  @IsString()
  WedIn?: string;

  @ApiProperty({ description: 'Wednesday check-out time' })
  @IsOptional()
  @IsString()
  WedOut?: string;

  @ApiProperty({ description: 'Thursday check-in time' })
  @IsOptional()
  @IsString()
  ThuIn?: string;

  @ApiProperty({ description: 'Thursday check-out time' })
  @IsOptional()
  @IsString()
  ThuOut?: string;

  @ApiProperty({ description: 'Friday check-in time' })
  @IsOptional()
  @IsString()
  FriIn?: string;

  @ApiProperty({ description: 'Friday check-out time' })
  @IsOptional()
  @IsString()
  FriOut?: string;

  @ApiProperty({ description: 'Saturday check-in time' })
  @IsOptional()
  @IsString()
  SatIn?: string;

  @ApiProperty({ description: 'Saturday check-out time' })
  @IsOptional()
  @IsString()
  SatOut?: string;

  @ApiProperty({ description: 'Sunday check-in time' })
  @IsOptional()
  @IsString()
  SunIn?: string;

  @ApiProperty({ description: 'Sunday check-out time' })
  @IsOptional()
  @IsString()
  SunOut?: string;
}

export class AssignScheduleDto {
  @ApiProperty({ description: 'Schedule ID' })
  @IsNumber()
  ScheduleId: number;

  @ApiProperty({ description: 'Employee IDs to assign', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  EmployeeIds: number[];

  @ApiPropertyOptional({ description: 'Effective from Date' })
  @IsOptional()
  @IsDateString()
  EffectiveFrom?: string;

  @ApiPropertyOptional({ description: 'Effective until Date' })
  @IsOptional()
  @IsDateString()
  EffectiveUntil?: string;
}
