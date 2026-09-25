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
exports.AttendanceIntegrationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const attendance_integration_service_1 = require("./attendance-integration-service");
const attendance_integration_dto_1 = require("./attendance-integration.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../../common/dto/api-response-dto");
let AttendanceIntegrationController = class AttendanceIntegrationController {
    constructor(attendanceService) {
        this.attendanceService = attendanceService;
    }
    async registerDevice(dto) {
        const data = await this.attendanceService.registerDevice(dto, 'system');
        return api_response_dto_1.ApiResponse.ok(data, 'Device registered successfully');
    }
    async listDevices(dto) {
        const data = await this.attendanceService.listDevices(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getDevice(id) {
        const data = await this.attendanceService.getDevice(id);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async updateDevice(id, dto) {
        const data = await this.attendanceService.updateDevice(id, dto, 'system');
        return api_response_dto_1.ApiResponse.ok(data, 'Device updated successfully');
    }
    async deleteDevice(id) {
        const data = await this.attendanceService.deleteDevice(id, 'system');
        return api_response_dto_1.ApiResponse.ok(data, 'Device deleted successfully');
    }
    async testConnection(id) {
        const data = await this.attendanceService.testConnection(id);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async executeCommand(id, dto) {
        const data = await this.attendanceService.executeCommand(id, dto, 'system');
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async mapEmployee(dto) {
        const data = await this.attendanceService.mapEmployee(dto, 'system');
        return api_response_dto_1.ApiResponse.ok(data, 'Employee mapped successfully');
    }
    async bulkMapEmployees(dto) {
        const data = await this.attendanceService.bulkMapEmployees(dto, 'system');
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getMappings(employeeId) {
        const data = await this.attendanceService.getMappings(employeeId);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async deleteMapping(employeeId) {
        const data = await this.attendanceService.deleteMapping(employeeId, 'system');
        return api_response_dto_1.ApiResponse.ok(data, 'Mapping deleted successfully');
    }
    async syncAttendance(dto) {
        const data = await this.attendanceService.syncAttendance(dto, 'system');
        return api_response_dto_1.ApiResponse.ok(data, 'Attendance synced successfully');
    }
    async createSchedule(dto) {
        const data = await this.attendanceService.createSchedule(dto, 'system');
        return api_response_dto_1.ApiResponse.ok(data, 'Schedule created successfully');
    }
    async listSchedules() {
        const data = await this.attendanceService.listSchedules();
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async assignSchedule(dto) {
        const data = await this.attendanceService.assignSchedule(dto, 'system');
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getDeviceLogs(dto) {
        const data = await this.attendanceService.getDeviceLogs(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
};
exports.AttendanceIntegrationController = AttendanceIntegrationController;
__decorate([
    (0, common_1.Post)('device'),
    (0, swagger_1.ApiOperation)({ summary: 'Register new attendance device' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [attendance_integration_dto_1.DeviceConfigDto]),
    __metadata("design:returntype", Promise)
], AttendanceIntegrationController.prototype, "registerDevice", null);
__decorate([
    (0, common_1.Get)('device'),
    (0, swagger_1.ApiOperation)({ summary: 'List all attendance devices' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [attendance_integration_dto_1.DeviceFilterDto]),
    __metadata("design:returntype", Promise)
], AttendanceIntegrationController.prototype, "listDevices", null);
__decorate([
    (0, common_1.Get)('device/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get device by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AttendanceIntegrationController.prototype, "getDevice", null);
__decorate([
    (0, common_1.Put)('device/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update device configuration' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, attendance_integration_dto_1.UpdateDeviceConfigDto]),
    __metadata("design:returntype", Promise)
], AttendanceIntegrationController.prototype, "updateDevice", null);
__decorate([
    (0, common_1.Delete)('device/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete device' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AttendanceIntegrationController.prototype, "deleteDevice", null);
__decorate([
    (0, common_1.Post)('device/:id/test-connection'),
    (0, swagger_1.ApiOperation)({ summary: 'Test device connection' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AttendanceIntegrationController.prototype, "testConnection", null);
__decorate([
    (0, common_1.Post)('device/:id/command'),
    (0, swagger_1.ApiOperation)({ summary: 'Execute device command' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, attendance_integration_dto_1.DeviceCommandDto]),
    __metadata("design:returntype", Promise)
], AttendanceIntegrationController.prototype, "executeCommand", null);
__decorate([
    (0, common_1.Post)('mapping'),
    (0, swagger_1.ApiOperation)({ summary: 'Map employee to device' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [attendance_integration_dto_1.EmployeeMappingDto]),
    __metadata("design:returntype", Promise)
], AttendanceIntegrationController.prototype, "mapEmployee", null);
__decorate([
    (0, common_1.Post)('mapping/bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk map employees to device' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [attendance_integration_dto_1.BulkEmployeeMappingDto]),
    __metadata("design:returntype", Promise)
], AttendanceIntegrationController.prototype, "bulkMapEmployees", null);
__decorate([
    (0, common_1.Get)('mapping'),
    (0, swagger_1.ApiOperation)({ summary: 'Get employee device mappings' }),
    __param(0, (0, common_1.Query)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AttendanceIntegrationController.prototype, "getMappings", null);
__decorate([
    (0, common_1.Delete)('mapping/:employeeId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete employee mapping' }),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AttendanceIntegrationController.prototype, "deleteMapping", null);
__decorate([
    (0, common_1.Post)('sync'),
    (0, swagger_1.ApiOperation)({ summary: 'Sync attendance records from device' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [attendance_integration_dto_1.SyncAttendanceDto]),
    __metadata("design:returntype", Promise)
], AttendanceIntegrationController.prototype, "syncAttendance", null);
__decorate([
    (0, common_1.Post)('schedule'),
    (0, swagger_1.ApiOperation)({ summary: 'Create work schedule' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [attendance_integration_dto_1.ScheduleDto]),
    __metadata("design:returntype", Promise)
], AttendanceIntegrationController.prototype, "createSchedule", null);
__decorate([
    (0, common_1.Get)('schedule'),
    (0, swagger_1.ApiOperation)({ summary: 'List work schedules' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AttendanceIntegrationController.prototype, "listSchedules", null);
__decorate([
    (0, common_1.Post)('schedule/assign'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign schedule to employees' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [attendance_integration_dto_1.AssignScheduleDto]),
    __metadata("design:returntype", Promise)
], AttendanceIntegrationController.prototype, "assignSchedule", null);
__decorate([
    (0, common_1.Get)('logs'),
    (0, swagger_1.ApiOperation)({ summary: 'Get device logs' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [attendance_integration_dto_1.DeviceLogDto]),
    __metadata("design:returntype", Promise)
], AttendanceIntegrationController.prototype, "getDeviceLogs", null);
exports.AttendanceIntegrationController = AttendanceIntegrationController = __decorate([
    (0, swagger_1.ApiTags)('Attendance Integration - Integrasi Absensi'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/attendance-integration'),
    __metadata("design:paramtypes", [attendance_integration_service_1.AttendanceIntegrationService])
], AttendanceIntegrationController);
