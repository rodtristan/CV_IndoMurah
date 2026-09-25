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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceController = void 0;
const common_1 = require("@nestjs/common");
const attendance_service_1 = require("./attendance-service");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const current_user_decorator_1 = require("../../../common/decorators/current-user-decorator");
const attendance_dto_1 = require("./attendance.dto");
let AttendanceController = class AttendanceController {
    constructor(attendanceService) {
        this.attendanceService = attendanceService;
    }
    async recordAttendance(dto, userId) {
        return this.attendanceService.recordAttendance(dto, userId);
    }
    async listAttendances(dto) {
        return this.attendanceService.listAttendances(dto);
    }
    async getAttendanceStatuses() {
        return this.attendanceService.getAttendanceStatuses();
    }
    async getAttendanceSummary(dto) {
        return this.attendanceService.getAttendanceSummary(dto);
    }
    async getAttendance(id) {
        return this.attendanceService.getAttendance(id);
    }
    async getEmployeeAttendanceHistory(employeeId, startDate, endDate) {
        return this.attendanceService.getEmployeeAttendanceHistory(employeeId, startDate, endDate);
    }
    async updateAttendance(id, dto, userId) {
        return this.attendanceService.updateAttendance(id, dto, userId);
    }
    async deleteAttendance(id) {
        return this.attendanceService.deleteAttendance(id);
    }
};
exports.AttendanceController = AttendanceController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [attendance_dto_1.RecordAttendanceDto, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "recordAttendance", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [attendance_dto_1.AttendanceFilterDto]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "listAttendances", null);
__decorate([
    (0, common_1.Get)('statuses'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getAttendanceStatuses", null);
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [attendance_dto_1.AttendanceSummaryDto]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getAttendanceSummary", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getAttendance", null);
__decorate([
    (0, common_1.Get)('employee/:employeeId/history'),
    __param(0, (0, common_1.Param)('employeeId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getEmployeeAttendanceHistory", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, attendance_dto_1.UpdateAttendanceDto, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "updateAttendance", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "deleteAttendance", null);
exports.AttendanceController = AttendanceController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/attendance'),
    __metadata("design:paramtypes", [attendance_service_1.AttendanceService])
], AttendanceController);
