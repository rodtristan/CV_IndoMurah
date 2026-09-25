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
exports.LeaveController = void 0;
const common_1 = require("@nestjs/common");
const leave_service_1 = require("./leave-service");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const current_user_decorator_1 = require("../../../common/decorators/current-user-decorator");
const leave_dto_1 = require("./leave.dto");
let LeaveController = class LeaveController {
    constructor(leaveService) {
        this.leaveService = leaveService;
    }
    async createLeave(dto, userId) {
        return this.leaveService.createLeave(dto, userId);
    }
    async listLeaves(dto) {
        return this.leaveService.listLeaves(dto);
    }
    async getLeaveTypes() {
        return this.leaveService.getLeaveTypes();
    }
    async getLeaveStatuses() {
        return this.leaveService.getLeaveStatuses();
    }
    async getLeave(id) {
        return this.leaveService.getLeave(id);
    }
    async updateLeave(id, dto, userId) {
        return this.leaveService.updateLeave(id, dto, userId);
    }
    async approveLeave(id, dto, userId) {
        return this.leaveService.approveLeave(id, dto, userId);
    }
    async rejectLeave(id, dto, userId) {
        return this.leaveService.rejectLeave(id, dto, userId);
    }
    async getLeaveBalances(employeeId, year) {
        return this.leaveService.getLeaveBalances({ EmployeeId: employeeId, Year: year });
    }
    async initializeLeaveBalances(dto, userId) {
        return this.leaveService.initializeLeaveBalances(dto, userId);
    }
};
exports.LeaveController = LeaveController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [leave_dto_1.CreateLeaveDto, String]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "createLeave", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [leave_dto_1.LeaveFilterDto]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "listLeaves", null);
__decorate([
    (0, common_1.Get)('types'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "getLeaveTypes", null);
__decorate([
    (0, common_1.Get)('statuses'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "getLeaveStatuses", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "getLeave", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, leave_dto_1.UpdateLeaveDto, String]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "updateLeave", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, leave_dto_1.ApproveLeaveDto, String]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "approveLeave", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, leave_dto_1.RejectLeaveDto, String]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "rejectLeave", null);
__decorate([
    (0, common_1.Get)('employee/:employeeId/balances'),
    __param(0, (0, common_1.Param)('employeeId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "getLeaveBalances", null);
__decorate([
    (0, common_1.Post)('balances/initialize'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [leave_dto_1.InitializeLeaveBalanceDto, String]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "initializeLeaveBalances", null);
exports.LeaveController = LeaveController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/leaves'),
    __metadata("design:paramtypes", [leave_service_1.LeaveService])
], LeaveController);
