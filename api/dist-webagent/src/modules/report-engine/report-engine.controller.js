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
exports.ReportEngineController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth-guard");
const current_user_decorator_1 = require("../../common/decorators/current-user-decorator");
const api_response_dto_1 = require("../../common/dto/api-response-dto");
const report_engine_service_1 = require("./report-engine.service");
let ReportEngineController = class ReportEngineController {
    constructor(service) {
        this.service = service;
    }
    catalog() {
        return api_response_dto_1.ApiResponse.ok(this.service.catalog());
    }
    async listTemplates(key, user) {
        return api_response_dto_1.ApiResponse.ok(await this.service.listTemplates(key, user));
    }
    async createTemplate(body, user) {
        return api_response_dto_1.ApiResponse.ok(await this.service.createTemplate(body, user), 'Template berhasil disimpan');
    }
    async updateTemplate(id, body, user) {
        return api_response_dto_1.ApiResponse.ok(await this.service.updateTemplate(id, body, user), 'Template berhasil diperbarui');
    }
    async deleteTemplate(id, user) {
        await this.service.deleteTemplate(id, user);
        return api_response_dto_1.ApiResponse.ok(null, 'Template berhasil dihapus');
    }
    async data(key, body, user) {
        return api_response_dto_1.ApiResponse.ok(await this.service.getData(key, body ?? {}, user));
    }
};
exports.ReportEngineController = ReportEngineController;
__decorate([
    (0, common_1.Get)('catalog'),
    (0, swagger_1.ApiOperation)({ summary: 'List available reports with their params and fields' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReportEngineController.prototype, "catalog", null);
__decorate([
    (0, common_1.Get)('templates/:key'),
    (0, swagger_1.ApiOperation)({ summary: 'List print templates of a report' }),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReportEngineController.prototype, "listTemplates", null);
__decorate([
    (0, common_1.Post)('templates'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a print template' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ReportEngineController.prototype, "createTemplate", null);
__decorate([
    (0, common_1.Put)('templates/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a print template' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], ReportEngineController.prototype, "updateTemplate", null);
__decorate([
    (0, common_1.Delete)('templates/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a print template' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ReportEngineController.prototype, "deleteTemplate", null);
__decorate([
    (0, common_1.Post)('data/:key'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Run a report and return its rows plus print header info' }),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ReportEngineController.prototype, "data", null);
exports.ReportEngineController = ReportEngineController = __decorate([
    (0, swagger_1.ApiTags)('Report Engine'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('report-engine'),
    __metadata("design:paramtypes", [report_engine_service_1.ReportEngineService])
], ReportEngineController);
