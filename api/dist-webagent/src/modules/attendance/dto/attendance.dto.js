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
exports.QueryAttendanceDto = exports.UpdateAttendanceDto = exports.CreateAttendanceDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateAttendanceDto {
}
exports.CreateAttendanceDto = CreateAttendanceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Employee ID' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateAttendanceDto.prototype, "employeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Attendance date', type: String }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAttendanceDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Check-in time', type: String }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAttendanceDto.prototype, "checkIn", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Check-in GPS latitude (for mobile check-in)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateAttendanceDto.prototype, "checkInLatitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Check-in GPS longitude (for mobile check-in)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateAttendanceDto.prototype, "checkInLongitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Check-out time', type: String }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAttendanceDto.prototype, "checkOut", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Check-out GPS latitude (for mobile check-in)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateAttendanceDto.prototype, "checkOutLatitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Check-out GPS longitude (for mobile check-in)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateAttendanceDto.prototype, "checkOutLongitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status code (PRESENT, ABSENT, LATE, LEAVE, SICK, PERMIT)', default: 'PRESENT' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAttendanceDto.prototype, "statusCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAttendanceDto.prototype, "notes", void 0);
class UpdateAttendanceDto {
}
exports.UpdateAttendanceDto = UpdateAttendanceDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Employee ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateAttendanceDto.prototype, "employeeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Attendance date', type: String }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateAttendanceDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Check-in time', type: String }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateAttendanceDto.prototype, "checkIn", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Check-in GPS latitude' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateAttendanceDto.prototype, "checkInLatitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Check-in GPS longitude' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateAttendanceDto.prototype, "checkInLongitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Check-out time', type: String }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateAttendanceDto.prototype, "checkOut", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Check-out GPS latitude' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateAttendanceDto.prototype, "checkOutLatitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Check-out GPS longitude' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateAttendanceDto.prototype, "checkOutLongitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status code' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAttendanceDto.prototype, "statusCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAttendanceDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAttendanceDto.prototype, "isActive", void 0);
class QueryAttendanceDto {
}
exports.QueryAttendanceDto = QueryAttendanceDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fields to select' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryAttendanceDto.prototype, "$select", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Relations to include' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryAttendanceDto.prototype, "$include", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to skip' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryAttendanceDto.prototype, "$skip", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to take' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryAttendanceDto.prototype, "$take", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryAttendanceDto.prototype, "$search", void 0);
