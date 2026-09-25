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
exports.UpdateAttendanceDto = exports.AttendanceSummaryDto = exports.AttendanceFilterDto = exports.BulkAttendanceDto = exports.RecordAttendanceDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class RecordAttendanceDto {
}
exports.RecordAttendanceDto = RecordAttendanceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Employee ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecordAttendanceDto.prototype, "EmployeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Attendance Date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], RecordAttendanceDto.prototype, "Date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Check-in time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], RecordAttendanceDto.prototype, "CheckIn", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Check-out time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], RecordAttendanceDto.prototype, "CheckOut", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Attendance status ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecordAttendanceDto.prototype, "StatusId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordAttendanceDto.prototype, "Notes", void 0);
class BulkAttendanceDto {
}
exports.BulkAttendanceDto = BulkAttendanceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'List of attendance records', type: [RecordAttendanceDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => RecordAttendanceDto),
    __metadata("design:type", Array)
], BulkAttendanceDto.prototype, "records", void 0);
class AttendanceFilterDto {
}
exports.AttendanceFilterDto = AttendanceFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Employee ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AttendanceFilterDto.prototype, "EmployeeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AttendanceFilterDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AttendanceFilterDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AttendanceFilterDto.prototype, "StatusId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], AttendanceFilterDto.prototype, "Page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page size' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], AttendanceFilterDto.prototype, "Limit", void 0);
class AttendanceSummaryDto {
}
exports.AttendanceSummaryDto = AttendanceSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Start Date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AttendanceSummaryDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'End Date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AttendanceSummaryDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Employee ID (optional)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AttendanceSummaryDto.prototype, "EmployeeId", void 0);
class UpdateAttendanceDto {
}
exports.UpdateAttendanceDto = UpdateAttendanceDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Check-in time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateAttendanceDto.prototype, "CheckIn", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Check-out time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateAttendanceDto.prototype, "CheckOut", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateAttendanceDto.prototype, "StatusId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAttendanceDto.prototype, "Notes", void 0);
