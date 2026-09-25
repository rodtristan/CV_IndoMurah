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
exports.QualityControlController = void 0;
const common_1 = require("@nestjs/common");
const quality_control_service_1 = require("./quality-control-service");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const quality_control_dto_1 = require("./quality-control.dto");
let QualityControlController = class QualityControlController {
    constructor(qualityControlService) {
        this.qualityControlService = qualityControlService;
    }
    async createQCInspection(dto, req) {
        return this.qualityControlService.createQCInspection(dto, req.user?.id || '1');
    }
    async getQCInspection(id) {
        return this.qualityControlService.getQCInspection(parseInt(id));
    }
    async listQCInspections(dto) {
        return this.qualityControlService.listQCInspections(dto);
    }
    async recordQCResults(id, results, req) {
        return this.qualityControlService.recordQCResults(parseInt(id), results, req.user?.id || '1');
    }
    async getQCPerformanceReport(startDate, endDate) {
        return this.qualityControlService.getQCPerformanceReport(startDate, endDate);
    }
    async createDefectReport(dto, req) {
        return this.qualityControlService.createDefectReport(dto, req.user?.id || '1');
    }
    async getDefectReport(id) {
        return this.qualityControlService.getDefectReport(parseInt(id));
    }
    async listDefectReports(dto) {
        return this.qualityControlService.listDefectReports(dto);
    }
    async updateDefectStatus(id, status, req) {
        return this.qualityControlService.updateDefectStatus(parseInt(id), status, req.user?.id || '1');
    }
    async getDefectAnalytics(startDate, endDate) {
        return this.qualityControlService.getDefectAnalytics(startDate, endDate);
    }
    async createQCStandard(dto, req) {
        return this.qualityControlService.createQCStandard(dto, req.user?.id || '1');
    }
    async getQCStandard(productId, inspectionType) {
        return this.qualityControlService.getQCStandard(parseInt(productId), inspectionType);
    }
    async createCalibration(dto, req) {
        return this.qualityControlService.createCalibration(dto, req.user?.id || '1');
    }
    async listCalibrations(dto) {
        return this.qualityControlService.listCalibrations(dto);
    }
    async recordCalibrationResult(id, result, notes, req) {
        return this.qualityControlService.recordCalibrationResult(parseInt(id), result, notes, req.user?.id || '1');
    }
};
exports.QualityControlController = QualityControlController;
__decorate([
    (0, common_1.Post)('inspection'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [quality_control_dto_1.CreateQCInspectionDto, Object]),
    __metadata("design:returntype", Promise)
], QualityControlController.prototype, "createQCInspection", null);
__decorate([
    (0, common_1.Get)('inspection/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QualityControlController.prototype, "getQCInspection", null);
__decorate([
    (0, common_1.Get)('inspection'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [quality_control_dto_1.QCInspectionFilterDto]),
    __metadata("design:returntype", Promise)
], QualityControlController.prototype, "listQCInspections", null);
__decorate([
    (0, common_1.Post)('inspection/:id/results'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], QualityControlController.prototype, "recordQCResults", null);
__decorate([
    (0, common_1.Get)('performance'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], QualityControlController.prototype, "getQCPerformanceReport", null);
__decorate([
    (0, common_1.Post)('defect'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [quality_control_dto_1.CreateDefectReportDto, Object]),
    __metadata("design:returntype", Promise)
], QualityControlController.prototype, "createDefectReport", null);
__decorate([
    (0, common_1.Get)('defect/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QualityControlController.prototype, "getDefectReport", null);
__decorate([
    (0, common_1.Get)('defect'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [quality_control_dto_1.DefectFilterDto]),
    __metadata("design:returntype", Promise)
], QualityControlController.prototype, "listDefectReports", null);
__decorate([
    (0, common_1.Put)('defect/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], QualityControlController.prototype, "updateDefectStatus", null);
__decorate([
    (0, common_1.Get)('defect/analytics'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], QualityControlController.prototype, "getDefectAnalytics", null);
__decorate([
    (0, common_1.Post)('standard'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [quality_control_dto_1.CreateQCStandardDto, Object]),
    __metadata("design:returntype", Promise)
], QualityControlController.prototype, "createQCStandard", null);
__decorate([
    (0, common_1.Get)('standard'),
    __param(0, (0, common_1.Query)('productId')),
    __param(1, (0, common_1.Query)('inspectionType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], QualityControlController.prototype, "getQCStandard", null);
__decorate([
    (0, common_1.Post)('calibration'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [quality_control_dto_1.CreateCalibrationDto, Object]),
    __metadata("design:returntype", Promise)
], QualityControlController.prototype, "createCalibration", null);
__decorate([
    (0, common_1.Get)('calibration'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [quality_control_dto_1.CalibrationFilterDto]),
    __metadata("design:returntype", Promise)
], QualityControlController.prototype, "listCalibrations", null);
__decorate([
    (0, common_1.Post)('calibration/:id/result'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('result')),
    __param(2, (0, common_1.Body)('notes')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], QualityControlController.prototype, "recordCalibrationResult", null);
exports.QualityControlController = QualityControlController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/quality-control'),
    __metadata("design:paramtypes", [quality_control_service_1.QualityControlService])
], QualityControlController);
