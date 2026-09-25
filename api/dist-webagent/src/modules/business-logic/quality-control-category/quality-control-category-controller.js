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
exports.QualityControlCategoryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const quality_control_category_service_1 = require("./quality-control-category-service");
const quality_control_category_dto_1 = require("./quality-control-category.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../../common/dto/api-response-dto");
let QualityControlCategoryController = class QualityControlCategoryController {
    constructor(qualityControlService) {
        this.qualityControlService = qualityControlService;
    }
    async createCategory(dto) {
        const data = await this.qualityControlService.createQCCategory(dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Category created successfully');
    }
    async listCategories(includeInactive) {
        const data = await this.qualityControlService.listQCCategories(includeInactive === 'true');
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getCategory(id) {
        const data = await this.qualityControlService.getQCCategory(id);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async updateCategory(id, dto) {
        const data = await this.qualityControlService.updateQCCategory(id, dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Category updated successfully');
    }
    async deleteCategory(id) {
        const data = await this.qualityControlService.deleteQCCategory(id);
        return api_response_dto_1.ApiResponse.ok(data, 'Category deleted successfully');
    }
    async createCheckpoint(dto) {
        const data = await this.qualityControlService.createQCCheckpoint(dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Checkpoint created successfully');
    }
    async updateCheckpoint(id, dto) {
        const data = await this.qualityControlService.updateQCCheckpoint(id, dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Checkpoint updated successfully');
    }
    async deleteCheckpoint(id) {
        const data = await this.qualityControlService.deleteQCCheckpoint(id);
        return api_response_dto_1.ApiResponse.ok(data, 'Checkpoint deleted successfully');
    }
    async recordCheck(dto) {
        const userId = 'system';
        const data = await this.qualityControlService.recordQCCheck(dto, userId);
        return api_response_dto_1.ApiResponse.ok(data, 'QC check recorded successfully');
    }
    async listChecks(dto) {
        const data = await this.qualityControlService.listQCChecks(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
};
exports.QualityControlCategoryController = QualityControlCategoryController;
__decorate([
    (0, common_1.Post)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'Create QC category' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [quality_control_category_dto_1.CreateQCCategoryDto]),
    __metadata("design:returntype", Promise)
], QualityControlCategoryController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'List QC categories' }),
    __param(0, (0, common_1.Query)('includeInactive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QualityControlCategoryController.prototype, "listCategories", null);
__decorate([
    (0, common_1.Get)('categories/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get QC category by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], QualityControlCategoryController.prototype, "getCategory", null);
__decorate([
    (0, common_1.Patch)('categories/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update QC category' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, quality_control_category_dto_1.UpdateQCCategoryDto]),
    __metadata("design:returntype", Promise)
], QualityControlCategoryController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Delete)('categories/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete QC category' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], QualityControlCategoryController.prototype, "deleteCategory", null);
__decorate([
    (0, common_1.Post)('checkpoints'),
    (0, swagger_1.ApiOperation)({ summary: 'Create QC checkpoint' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [quality_control_category_dto_1.CreateQCCheckpointDto]),
    __metadata("design:returntype", Promise)
], QualityControlCategoryController.prototype, "createCheckpoint", null);
__decorate([
    (0, common_1.Patch)('checkpoints/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update QC checkpoint' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, quality_control_category_dto_1.UpdateQCCheckpointDto]),
    __metadata("design:returntype", Promise)
], QualityControlCategoryController.prototype, "updateCheckpoint", null);
__decorate([
    (0, common_1.Delete)('checkpoints/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete QC checkpoint' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], QualityControlCategoryController.prototype, "deleteCheckpoint", null);
__decorate([
    (0, common_1.Post)('checks'),
    (0, swagger_1.ApiOperation)({ summary: 'Record QC check' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [quality_control_category_dto_1.RecordQCCheckDto]),
    __metadata("design:returntype", Promise)
], QualityControlCategoryController.prototype, "recordCheck", null);
__decorate([
    (0, common_1.Get)('checks'),
    (0, swagger_1.ApiOperation)({ summary: 'List QC checks' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [quality_control_category_dto_1.QCCheckFilterDto]),
    __metadata("design:returntype", Promise)
], QualityControlCategoryController.prototype, "listChecks", null);
exports.QualityControlCategoryController = QualityControlCategoryController = __decorate([
    (0, swagger_1.ApiTags)('Quality Control - Quality Control'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/quality-control'),
    __metadata("design:paramtypes", [quality_control_category_service_1.QualityControlCategoryService])
], QualityControlCategoryController);
