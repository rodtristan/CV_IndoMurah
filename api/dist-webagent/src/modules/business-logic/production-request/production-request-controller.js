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
exports.ProductionRequestController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const production_request_service_1 = require("./production-request-service");
const production_request_dto_1 = require("./production-request.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../../common/dto/api-response-dto");
let ProductionRequestController = class ProductionRequestController {
    constructor(requestService) {
        this.requestService = requestService;
    }
    async createRequest(dto) {
        const userId = 'system';
        const data = await this.requestService.createRequest(dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Request created successfully');
    }
    async listRequests(dto) {
        const data = await this.requestService.listRequests(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getRequest(id) {
        const data = await this.requestService.getRequest(id);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async approveRequest(id) {
        const userId = 'system';
        const data = await this.requestService.approveRequest(id, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'Request approved');
    }
    async rejectRequest(id, reason) {
        const userId = 'system';
        const data = await this.requestService.rejectRequest(id, userId, reason);
        return api_response_dto_1.ApiResponse.ok(data, 'Request rejected');
    }
};
exports.ProductionRequestController = ProductionRequestController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create production request' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [production_request_dto_1.CreateProductionRequestDto]),
    __metadata("design:returntype", Promise)
], ProductionRequestController.prototype, "createRequest", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List production requests' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [production_request_dto_1.ProductionRequestFilterDto]),
    __metadata("design:returntype", Promise)
], ProductionRequestController.prototype, "listRequests", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get request by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductionRequestController.prototype, "getRequest", null);
__decorate([
    (0, common_1.Put)(':id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve production request' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductionRequestController.prototype, "approveRequest", null);
__decorate([
    (0, common_1.Put)(':id/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject production request' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], ProductionRequestController.prototype, "rejectRequest", null);
exports.ProductionRequestController = ProductionRequestController = __decorate([
    (0, swagger_1.ApiTags)('Business Logic - Production Request'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/production-request'),
    __metadata("design:paramtypes", [production_request_service_1.ProductionRequestService])
], ProductionRequestController);
