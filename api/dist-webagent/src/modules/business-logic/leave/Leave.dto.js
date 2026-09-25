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
exports.InitializeLeaveBalanceDto = exports.LeaveBalanceDto = exports.LeaveFilterDto = exports.RejectLeaveDto = exports.ApproveLeaveDto = exports.UpdateLeaveDto = exports.CreateLeaveDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateLeaveDto {
}
exports.CreateLeaveDto = CreateLeaveDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Employee ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLeaveDto.prototype, "EmployeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Leave Type ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLeaveDto.prototype, "TypeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Start Date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateLeaveDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'End Date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateLeaveDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total days' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateLeaveDto.prototype, "TotalDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reason' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLeaveDto.prototype, "Reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLeaveDto.prototype, "Notes", void 0);
class UpdateLeaveDto {
}
exports.UpdateLeaveDto = UpdateLeaveDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateLeaveDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateLeaveDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Total days' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateLeaveDto.prototype, "TotalDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reason' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLeaveDto.prototype, "Reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLeaveDto.prototype, "Notes", void 0);
class ApproveLeaveDto {
}
exports.ApproveLeaveDto = ApproveLeaveDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Approver Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApproveLeaveDto.prototype, "Notes", void 0);
class RejectLeaveDto {
}
exports.RejectLeaveDto = RejectLeaveDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Rejection reason' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RejectLeaveDto.prototype, "Reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RejectLeaveDto.prototype, "Notes", void 0);
class LeaveFilterDto {
}
exports.LeaveFilterDto = LeaveFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Employee ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LeaveFilterDto.prototype, "EmployeeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Leave Type ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LeaveFilterDto.prototype, "TypeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LeaveFilterDto.prototype, "StatusId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], LeaveFilterDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], LeaveFilterDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], LeaveFilterDto.prototype, "Page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page size' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], LeaveFilterDto.prototype, "Limit", void 0);
class LeaveBalanceDto {
}
exports.LeaveBalanceDto = LeaveBalanceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Employee ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LeaveBalanceDto.prototype, "EmployeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Year' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LeaveBalanceDto.prototype, "Year", void 0);
class InitializeLeaveBalanceDto {
}
exports.InitializeLeaveBalanceDto = InitializeLeaveBalanceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Employee ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InitializeLeaveBalanceDto.prototype, "EmployeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Year' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InitializeLeaveBalanceDto.prototype, "Year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Leave balances' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Array)
], InitializeLeaveBalanceDto.prototype, "Balances", void 0);
