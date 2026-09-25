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
exports.WorkOrderController = void 0;
const common_1 = require("@nestjs/common");
const work_order_service_1 = require("./work-order-service");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const work_order_dto_1 = require("./work-order.dto");
let WorkOrderController = class WorkOrderController {
    constructor(workOrderService) {
        this.workOrderService = workOrderService;
    }
    async createWorkOrder(dto, req) {
        return this.workOrderService.createWorkOrder(dto, req.user?.id || '1');
    }
    async getWorkOrder(id) {
        return this.workOrderService.getWorkOrder(parseInt(id));
    }
    async listWorkOrders(dto) {
        return this.workOrderService.listWorkOrders(dto);
    }
    async updateWorkOrder(id, dto, req) {
        return this.workOrderService.updateWorkOrder(parseInt(id), dto, req.user?.id || '1');
    }
    async cancelWorkOrder(id, reason, req) {
        return this.workOrderService.cancelWorkOrder(parseInt(id), reason, req.user?.id || '1');
    }
    async scheduleWorkOrder(dto, req) {
        return this.workOrderService.scheduleWorkOrder(dto, req.user?.id || '1');
    }
    async getWorkOrderSchedule(dto) {
        return this.workOrderService.getWorkOrderSchedule(dto);
    }
    async recordProgress(dto, req) {
        return this.workOrderService.recordProgress(dto, req.user?.id || '1');
    }
    async allocateMaterials(dto, req) {
        return this.workOrderService.allocateMaterials(dto, req.user?.id || '1');
    }
    async releaseMaterials(id, req) {
        return this.workOrderService.releaseMaterials(parseInt(id), req.user?.id || '1');
    }
    async createWorkStation(dto, req) {
        return this.workOrderService.createWorkStation(dto, req.user?.id || '1');
    }
    async listWorkStations(dto) {
        return this.workOrderService.listWorkStations(dto);
    }
    async getWorkStationUtilization(startDate, endDate, workStationId) {
        return this.workOrderService.getWorkStationUtilization(startDate, endDate, workStationId ? parseInt(workStationId) : undefined);
    }
    async getWorkOrderAnalytics(startDate, endDate) {
        return this.workOrderService.getWorkOrderAnalytics(startDate, endDate);
    }
};
exports.WorkOrderController = WorkOrderController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [work_order_dto_1.CreateWorkOrderDto, Object]),
    __metadata("design:returntype", Promise)
], WorkOrderController.prototype, "createWorkOrder", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkOrderController.prototype, "getWorkOrder", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [work_order_dto_1.WorkOrderFilterDto]),
    __metadata("design:returntype", Promise)
], WorkOrderController.prototype, "listWorkOrders", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, work_order_dto_1.UpdateWorkOrderDto, Object]),
    __metadata("design:returntype", Promise)
], WorkOrderController.prototype, "updateWorkOrder", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], WorkOrderController.prototype, "cancelWorkOrder", null);
__decorate([
    (0, common_1.Post)('schedule'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [work_order_dto_1.ScheduleWorkOrderDto, Object]),
    __metadata("design:returntype", Promise)
], WorkOrderController.prototype, "scheduleWorkOrder", null);
__decorate([
    (0, common_1.Get)('schedule/calendar'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [work_order_dto_1.WorkOrderSchedulingDto]),
    __metadata("design:returntype", Promise)
], WorkOrderController.prototype, "getWorkOrderSchedule", null);
__decorate([
    (0, common_1.Post)('progress'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [work_order_dto_1.RecordProgressDto, Object]),
    __metadata("design:returntype", Promise)
], WorkOrderController.prototype, "recordProgress", null);
__decorate([
    (0, common_1.Post)('materials'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [work_order_dto_1.MaterialAllocationDto, Object]),
    __metadata("design:returntype", Promise)
], WorkOrderController.prototype, "allocateMaterials", null);
__decorate([
    (0, common_1.Post)(':id/release-materials'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkOrderController.prototype, "releaseMaterials", null);
__decorate([
    (0, common_1.Post)('workstation'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [work_order_dto_1.CreateWorkStationDto, Object]),
    __metadata("design:returntype", Promise)
], WorkOrderController.prototype, "createWorkStation", null);
__decorate([
    (0, common_1.Get)('workstation/list'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [work_order_dto_1.WorkStationFilterDto]),
    __metadata("design:returntype", Promise)
], WorkOrderController.prototype, "listWorkStations", null);
__decorate([
    (0, common_1.Get)('workstation/utilization'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('workStationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], WorkOrderController.prototype, "getWorkStationUtilization", null);
__decorate([
    (0, common_1.Get)('analytics'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WorkOrderController.prototype, "getWorkOrderAnalytics", null);
exports.WorkOrderController = WorkOrderController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/work-order'),
    __metadata("design:paramtypes", [work_order_service_1.WorkOrderService])
], WorkOrderController);
