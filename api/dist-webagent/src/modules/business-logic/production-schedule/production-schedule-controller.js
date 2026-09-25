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
exports.ProductionScheduleController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const production_schedule_service_1 = require("./production-schedule-service");
const production_schedule_dto_1 = require("./production-schedule.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../../common/dto/api-response-dto");
let ProductionScheduleController = class ProductionScheduleController {
    constructor(scheduleService) {
        this.scheduleService = scheduleService;
    }
    async createSchedule(dto) {
        const userId = 'system';
        const data = await this.scheduleService.createSchedule(dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Schedule created successfully');
    }
    async listSchedules(dto) {
        const data = await this.scheduleService.listSchedules(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getCalendarView(startDate, endDate, warehouseId) {
        const data = await this.scheduleService.getCalendarView(startDate, endDate, warehouseId);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getSchedule(id) {
        const data = await this.scheduleService.getSchedule(id);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async updateSchedule(id, dto) {
        const userId = 'system';
        const data = await this.scheduleService.updateSchedule(id, dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Schedule updated successfully');
    }
};
exports.ProductionScheduleController = ProductionScheduleController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create production schedule' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [production_schedule_dto_1.CreateProductionScheduleDto]),
    __metadata("design:returntype", Promise)
], ProductionScheduleController.prototype, "createSchedule", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List production schedules' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [production_schedule_dto_1.ProductionScheduleFilterDto]),
    __metadata("design:returntype", Promise)
], ProductionScheduleController.prototype, "listSchedules", null);
__decorate([
    (0, common_1.Get)('calendar'),
    (0, swagger_1.ApiOperation)({ summary: 'Get calendar view of schedules' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('warehouseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], ProductionScheduleController.prototype, "getCalendarView", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get schedule by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductionScheduleController.prototype, "getSchedule", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update schedule' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, production_schedule_dto_1.UpDateProductionScheduleDto]),
    __metadata("design:returntype", Promise)
], ProductionScheduleController.prototype, "updateSchedule", null);
exports.ProductionScheduleController = ProductionScheduleController = __decorate([
    (0, swagger_1.ApiTags)('Business Logic - Production Schedule'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/production-schedule'),
    __metadata("design:paramtypes", [production_schedule_service_1.ProductionScheduleService])
], ProductionScheduleController);
