"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignScheduleDto = exports.ScheduleDto = exports.DeviceCommandDto = exports.DeviceLogDto = exports.BulkEmployeeMappingDto = exports.EmployeeMappingDto = exports.DeviceFilterDto = exports.SyncAttendanceDto = exports.AttendanceRecordDto = exports.UpdateDeviceConfigDto = exports.DeviceConfigDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class DeviceConfigDto {
}
exports.DeviceConfigDto = DeviceConfigDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Device Name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DeviceConfigDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Device IP address or hostName' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DeviceConfigDto.prototype, "Host", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Device port' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DeviceConfigDto.prototype, "Port", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Communication key' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeviceConfigDto.prototype, "CommKey", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Device Type: FINGERPRINT, RFID, COMBO' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeviceConfigDto.prototype, "DeviceType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Location' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeviceConfigDto.prototype, "Location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeviceConfigDto.prototype, "Notes", void 0);
class UpdateDeviceConfigDto {
}
exports.UpdateDeviceConfigDto = UpdateDeviceConfigDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Device Name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateDeviceConfigDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Device IP address' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateDeviceConfigDto.prototype, "Host", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Device port' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateDeviceConfigDto.prototype, "Port", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Communication key' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateDeviceConfigDto.prototype, "CommKey", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Location' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateDeviceConfigDto.prototype, "Location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateDeviceConfigDto.prototype, "IsActive", void 0);
class AttendanceRecordDto {
}
exports.AttendanceRecordDto = AttendanceRecordDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Employee Code from device' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AttendanceRecordDto.prototype, "EmployeeCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date and time of attendance' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AttendanceRecordDto.prototype, "DateTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Attendance Type' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AttendanceRecordDto.prototype, "Type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Verification method' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AttendanceRecordDto.prototype, "Verification", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Device ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AttendanceRecordDto.prototype, "DeviceId", void 0);
class SyncAttendanceDto {
}
exports.SyncAttendanceDto = SyncAttendanceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Device ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SyncAttendanceDto.prototype, "DeviceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Attendance records', type: [AttendanceRecordDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => AttendanceRecordDto),
    __metadata("design:type", Array)
], SyncAttendanceDto.prototype, "Records", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sync timestamp' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SyncAttendanceDto.prototype, "SyncTimestamp", void 0);
class DeviceFilterDto {
}
exports.DeviceFilterDto = DeviceFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Active only' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeviceFilterDto.prototype, "ActiveOnly", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Device Type' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeviceFilterDto.prototype, "DeviceType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Location' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeviceFilterDto.prototype, "Location", void 0);
class EmployeeMappingDto {
}
exports.EmployeeMappingDto = EmployeeMappingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Employee ID from HR system' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], EmployeeMappingDto.prototype, "EmployeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Employee Code from device' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EmployeeMappingDto.prototype, "DeviceCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fingerprint template data (base64)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmployeeMappingDto.prototype, "FingerprintTemplate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Face template data (base64)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmployeeMappingDto.prototype, "FaceTemplate", void 0);
class BulkEmployeeMappingDto {
}
exports.BulkEmployeeMappingDto = BulkEmployeeMappingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Employee mappings', type: [EmployeeMappingDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => EmployeeMappingDto),
    __metadata("design:type", Array)
], BulkEmployeeMappingDto.prototype, "Mappings", void 0);
class DeviceLogDto {
}
exports.DeviceLogDto = DeviceLogDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Device ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DeviceLogDto.prototype, "DeviceId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Log Type' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeviceLogDto.prototype, "LogType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DeviceLogDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DeviceLogDto.prototype, "EndDate", void 0);
class DeviceCommandDto {
}
exports.DeviceCommandDto = DeviceCommandDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Command to execute' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeviceCommandDto.prototype, "Command", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Target user ID (for ENROLL/DELETE_USER)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeviceCommandDto.prototype, "UserId", void 0);
class ScheduleDto {
}
exports.ScheduleDto = ScheduleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Schedule Name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ScheduleDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Monday check-in time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleDto.prototype, "MonIn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Monday check-out time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleDto.prototype, "MonOut", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tuesday check-in time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleDto.prototype, "TueIn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tuesday check-out time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleDto.prototype, "TueOut", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Wednesday check-in time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleDto.prototype, "WedIn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Wednesday check-out time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleDto.prototype, "WedOut", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thursday check-in time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleDto.prototype, "ThuIn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thursday check-out time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleDto.prototype, "ThuOut", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Friday check-in time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleDto.prototype, "FriIn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Friday check-out time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleDto.prototype, "FriOut", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Saturday check-in time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleDto.prototype, "SatIn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Saturday check-out time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleDto.prototype, "SatOut", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sunday check-in time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleDto.prototype, "SunIn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sunday check-out time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleDto.prototype, "SunOut", void 0);
class AssignScheduleDto {
}
exports.AssignScheduleDto = AssignScheduleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Schedule ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AssignScheduleDto.prototype, "ScheduleId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Employee IDs to assign', type: [Number] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    __metadata("design:type", Array)
], AssignScheduleDto.prototype, "EmployeeIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Effective from Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AssignScheduleDto.prototype, "EffectiveFrom", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Effective until Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AssignScheduleDto.prototype, "EffectiveUntil", void 0);
