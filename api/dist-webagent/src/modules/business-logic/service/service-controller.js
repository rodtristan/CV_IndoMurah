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
exports.ServiceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const service_service_1 = require("./service-service");
const service_dto_1 = require("./service.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../../common/dto/api-response-dto");
let ServiceController = class ServiceController {
    constructor(serviceService) {
        this.serviceService = serviceService;
    }
    async createService(dto) {
        const userId = 'system';
        const data = await this.serviceService.createService(dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Service order created successfully');
    }
    async listServices(dto) {
        const data = await this.serviceService.listServices(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getServiceStats(startDate, endDate) {
        const data = await this.serviceService.getServiceStats(startDate, endDate);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getService(id) {
        const data = await this.serviceService.getService(id);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async updateServiceStatus(id, dto) {
        const userId = 'system';
        const data = await this.serviceService.updateServiceStatus(id, dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Service status updated');
    }
    async addServiceItem(id, dto) {
        const userId = 'system';
        const data = await this.serviceService.addServiceItem(id, dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Item added to service');
    }
    async completeService(id, dto) {
        const userId = 'system';
        const data = await this.serviceService.completeService(id, dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Service completed');
    }
    async recordPayment(id, dto) {
        const userId = 'system';
        const data = await this.serviceService.recordPayment(id, dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Payment recorded');
    }
};
exports.ServiceController = ServiceController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new service order (intake)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [service_dto_1.CreateServiceDto]),
    __metadata("design:returntype", Promise)
], ServiceController.prototype, "createService", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List service orders' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [service_dto_1.ServiceFilterDto]),
    __metadata("design:returntype", Promise)
], ServiceController.prototype, "listServices", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get service statistics' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ServiceController.prototype, "getServiceStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get service by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ServiceController.prototype, "getService", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update service status' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, service_dto_1.UpDateServiceStatusDto]),
    __metadata("design:returntype", Promise)
], ServiceController.prototype, "updateServiceStatus", null);
__decorate([
    (0, common_1.Post)(':id/items'),
    (0, swagger_1.ApiOperation)({ summary: 'Add item to service' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, service_dto_1.AddServiceItemDto]),
    __metadata("design:returntype", Promise)
], ServiceController.prototype, "addServiceItem", null);
__decorate([
    (0, common_1.Put)(':id/complete'),
    (0, swagger_1.ApiOperation)({ summary: 'Complete service' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, service_dto_1.CompleteServiceDto]),
    __metadata("design:returntype", Promise)
], ServiceController.prototype, "completeService", null);
__decorate([
    (0, common_1.Post)(':id/payment'),
    (0, swagger_1.ApiOperation)({ summary: 'Record service payment' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, service_dto_1.RecordServicePaymentDto]),
    __metadata("design:returntype", Promise)
], ServiceController.prototype, "recordPayment", null);
exports.ServiceController = ServiceController = __decorate([
    (0, swagger_1.ApiTags)('Service - Servis/Reparasi'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/service'),
    __metadata("design:paramtypes", [service_service_1.ServiceService])
], ServiceController);
