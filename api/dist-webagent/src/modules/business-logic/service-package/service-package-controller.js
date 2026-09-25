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
exports.ServicePackageController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const service_package_service_1 = require("./service-package-service");
const service_package_dto_1 = require("./service-package.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../../common/dto/api-response-dto");
let ServicePackageController = class ServicePackageController {
    constructor(servicePackageService) {
        this.servicePackageService = servicePackageService;
    }
    async createServiceCategory(dto, req) {
        const data = await this.servicePackageService.createServiceCategory(dto, req.user?.id || '1');
        return api_response_dto_1.ApiResponse.ok(data, 'Service category created successfully');
    }
    async listServiceCategories(isActive) {
        const data = await this.servicePackageService.listServiceCategories(isActive === 'true' ? true : isActive === 'false' ? false : undefined);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getServiceCategory(id) {
        const data = await this.servicePackageService.getServiceCategory(parseInt(id));
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async updateServiceCategory(id, dto) {
        const data = await this.servicePackageService.updateServiceCategory(parseInt(id), dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Service category updated successfully');
    }
    async deleteServiceCategory(id) {
        const data = await this.servicePackageService.deleteServiceCategory(parseInt(id));
        return api_response_dto_1.ApiResponse.ok(data, 'Service category deleted successfully');
    }
    async createServicePackage(dto, req) {
        const data = await this.servicePackageService.createServicePackage(dto, req.user?.id || '1');
        return api_response_dto_1.ApiResponse.ok(data, 'Service package created successfully');
    }
    async listServicePackages(dto) {
        const data = await this.servicePackageService.listServicePackages(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getServicePackage(id) {
        const data = await this.servicePackageService.getServicePackage(parseInt(id));
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async updateServicePackage(id, dto, req) {
        const data = await this.servicePackageService.updateServicePackage(parseInt(id), dto, req.user?.id || '1');
        return api_response_dto_1.ApiResponse.ok(data, 'Service package updated successfully');
    }
    async deleteServicePackage(id) {
        const data = await this.servicePackageService.deleteServicePackage(parseInt(id));
        return api_response_dto_1.ApiResponse.ok(data, 'Service package deleted successfully');
    }
    async cloneServicePackage(id, newCode, newName, req) {
        const data = await this.servicePackageService.cloneServicePackage(parseInt(id), newCode, newName, req.user?.id || '1');
        return api_response_dto_1.ApiResponse.ok(data, 'Service package cloned successfully');
    }
    async calculatePackageQuote(dto) {
        const data = await this.servicePackageService.calculatePackageQuote(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async comparePackages(dto) {
        const data = await this.servicePackageService.comparePackages(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getPackagesByCategory(categoryId) {
        const data = await this.servicePackageService.getPackagesByCategory(parseInt(categoryId));
        return api_response_dto_1.ApiResponse.ok(data);
    }
};
exports.ServicePackageController = ServicePackageController;
__decorate([
    (0, common_1.Post)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'Create service category' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [service_package_dto_1.CreateServiceCategoryDto, Object]),
    __metadata("design:returntype", Promise)
], ServicePackageController.prototype, "createServiceCategory", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'List service categories' }),
    __param(0, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ServicePackageController.prototype, "listServiceCategories", null);
__decorate([
    (0, common_1.Get)('categories/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get service category by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ServicePackageController.prototype, "getServiceCategory", null);
__decorate([
    (0, common_1.Patch)('categories/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update service category' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, service_package_dto_1.UpDateServiceCategoryDto]),
    __metadata("design:returntype", Promise)
], ServicePackageController.prototype, "updateServiceCategory", null);
__decorate([
    (0, common_1.Delete)('categories/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete service category' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ServicePackageController.prototype, "deleteServiceCategory", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create service package' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [service_package_dto_1.CreateServicePackageDto, Object]),
    __metadata("design:returntype", Promise)
], ServicePackageController.prototype, "createServicePackage", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List service packages' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [service_package_dto_1.ServicePackageFilterDto]),
    __metadata("design:returntype", Promise)
], ServicePackageController.prototype, "listServicePackages", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get service package by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ServicePackageController.prototype, "getServicePackage", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update service package' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, service_package_dto_1.UpDateServicePackageDto, Object]),
    __metadata("design:returntype", Promise)
], ServicePackageController.prototype, "updateServicePackage", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete service package' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ServicePackageController.prototype, "deleteServicePackage", null);
__decorate([
    (0, common_1.Post)(':id/clone'),
    (0, swagger_1.ApiOperation)({ summary: 'Clone/duplicate service package' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('newCode')),
    __param(2, (0, common_1.Body)('newName')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ServicePackageController.prototype, "cloneServicePackage", null);
__decorate([
    (0, common_1.Post)('quote'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate package quote' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [service_package_dto_1.CalculatePackageQuoteDto]),
    __metadata("design:returntype", Promise)
], ServicePackageController.prototype, "calculatePackageQuote", null);
__decorate([
    (0, common_1.Post)('compare'),
    (0, swagger_1.ApiOperation)({ summary: 'Compare multiple packages' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [service_package_dto_1.ComparePackagesDto]),
    __metadata("design:returntype", Promise)
], ServicePackageController.prototype, "comparePackages", null);
__decorate([
    (0, common_1.Get)('category/:categoryId/packages'),
    (0, swagger_1.ApiOperation)({ summary: 'Get packages by category with quick quote' }),
    __param(0, (0, common_1.Param)('categoryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ServicePackageController.prototype, "getPackagesByCategory", null);
exports.ServicePackageController = ServicePackageController = __decorate([
    (0, swagger_1.ApiTags)('Service Package - Paket Layanan'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/service-package'),
    __metadata("design:paramtypes", [service_package_service_1.ServicePackageService])
], ServicePackageController);
