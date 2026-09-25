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
exports.QueryLeaveBalanceDto = exports.LeaveBalanceResponseDto = exports.UpdateLeaveBalanceDto = exports.CreateLeaveBalanceDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateLeaveBalanceDto {
}
exports.CreateLeaveBalanceDto = CreateLeaveBalanceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'employeeId' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLeaveBalanceDto.prototype, "employeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'year' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLeaveBalanceDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'LeaveType ID' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateLeaveBalanceDto.prototype, "typeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'totalDays' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLeaveBalanceDto.prototype, "totalDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'usedDays' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLeaveBalanceDto.prototype, "usedDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'remainingDays' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLeaveBalanceDto.prototype, "remainingDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'isActive' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateLeaveBalanceDto.prototype, "isActive", void 0);
class UpdateLeaveBalanceDto {
}
exports.UpdateLeaveBalanceDto = UpdateLeaveBalanceDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'employeeId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateLeaveBalanceDto.prototype, "employeeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'year' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateLeaveBalanceDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'LeaveType ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateLeaveBalanceDto.prototype, "typeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'totalDays' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateLeaveBalanceDto.prototype, "totalDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'usedDays' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateLeaveBalanceDto.prototype, "usedDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'remainingDays' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateLeaveBalanceDto.prototype, "remainingDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'isActive' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateLeaveBalanceDto.prototype, "isActive", void 0);
class LeaveBalanceResponseDto {
}
exports.LeaveBalanceResponseDto = LeaveBalanceResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'employeeId' }),
    __metadata("design:type", Number)
], LeaveBalanceResponseDto.prototype, "employeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'year' }),
    __metadata("design:type", Number)
], LeaveBalanceResponseDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'leaveType' }),
    __metadata("design:type", Object)
], LeaveBalanceResponseDto.prototype, "leaveType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'totalDays' }),
    __metadata("design:type", Number)
], LeaveBalanceResponseDto.prototype, "totalDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'usedDays' }),
    __metadata("design:type", Number)
], LeaveBalanceResponseDto.prototype, "usedDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'remainingDays' }),
    __metadata("design:type", Number)
], LeaveBalanceResponseDto.prototype, "remainingDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'isActive' }),
    __metadata("design:type", Boolean)
], LeaveBalanceResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'employee' }),
    __metadata("design:type", Object)
], LeaveBalanceResponseDto.prototype, "employee", void 0);
class QueryLeaveBalanceDto {
}
exports.QueryLeaveBalanceDto = QueryLeaveBalanceDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fields to select' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryLeaveBalanceDto.prototype, "$select", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Relations to include' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryLeaveBalanceDto.prototype, "$include", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to skip' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryLeaveBalanceDto.prototype, "$skip", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to take' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryLeaveBalanceDto.prototype, "$take", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryLeaveBalanceDto.prototype, "$search", void 0);
