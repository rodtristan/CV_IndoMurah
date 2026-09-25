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
exports.AssemblyController = void 0;
const common_1 = require("@nestjs/common");
const assembly_service_1 = require("./assembly-service");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const assembly_dto_1 = require("./assembly.dto");
let AssemblyController = class AssemblyController {
    constructor(assemblyService) {
        this.assemblyService = assemblyService;
    }
    async createAssembly(dto, req) {
        return this.assemblyService.createAssembly(dto, req.user?.id || '1');
    }
    async getAssembly(id) {
        return this.assemblyService.getAssembly(parseInt(id));
    }
    async listAssemblies(dto) {
        return this.assemblyService.listAssemblies(dto);
    }
    async updateAssembly(id, dto, req) {
        return this.assemblyService.updateAssembly(parseInt(id), dto, req.user?.id || '1');
    }
    async cancelAssembly(id, reason, req) {
        return this.assemblyService.cancelAssembly(parseInt(id), reason, req.user?.id || '1');
    }
    async createBOM(dto, req) {
        return this.assemblyService.createBOM(dto, req.user?.id || '1');
    }
    async getBOM(id) {
        return this.assemblyService.getBOM(parseInt(id));
    }
    async listBOMs(dto) {
        return this.assemblyService.listBOMs(dto);
    }
    async updateBOM(id, dto, req) {
        return this.assemblyService.updateBOM(parseInt(id), dto, req.user?.id || '1');
    }
    async deleteBOM(id) {
        return this.assemblyService.deleteBOM(parseInt(id));
    }
    async cloneBOM(id, newName, req) {
        return this.assemblyService.cloneBOM(parseInt(id), newName, req.user?.id || '1');
    }
    async assembleFromBOM(dto, req) {
        return this.assemblyService.assembleFromBOM(dto, req.user?.id || '1');
    }
    async calculateBOMCost(dto) {
        return this.assemblyService.calculateBOMCost(dto);
    }
    async compareBOMs(bomId1, bomId2) {
        return this.assemblyService.compareBOMs(parseInt(bomId1), parseInt(bomId2));
    }
    async getAssemblyAnalytics(startDate, endDate) {
        return this.assemblyService.getAssemblyAnalytics(startDate, endDate);
    }
};
exports.AssemblyController = AssemblyController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [assembly_dto_1.CreateAssemblyDto, Object]),
    __metadata("design:returntype", Promise)
], AssemblyController.prototype, "createAssembly", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssemblyController.prototype, "getAssembly", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [assembly_dto_1.AssemblyFilterDto]),
    __metadata("design:returntype", Promise)
], AssemblyController.prototype, "listAssemblies", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assembly_dto_1.UpdateAssemblyDto, Object]),
    __metadata("design:returntype", Promise)
], AssemblyController.prototype, "updateAssembly", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AssemblyController.prototype, "cancelAssembly", null);
__decorate([
    (0, common_1.Post)('bom'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [assembly_dto_1.CreateBOMDto, Object]),
    __metadata("design:returntype", Promise)
], AssemblyController.prototype, "createBOM", null);
__decorate([
    (0, common_1.Get)('bom/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssemblyController.prototype, "getBOM", null);
__decorate([
    (0, common_1.Get)('bom/list'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [assembly_dto_1.BOMFilterDto]),
    __metadata("design:returntype", Promise)
], AssemblyController.prototype, "listBOMs", null);
__decorate([
    (0, common_1.Put)('bom/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assembly_dto_1.UpdateBOMDto, Object]),
    __metadata("design:returntype", Promise)
], AssemblyController.prototype, "updateBOM", null);
__decorate([
    (0, common_1.Delete)('bom/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssemblyController.prototype, "deleteBOM", null);
__decorate([
    (0, common_1.Post)('bom/:id/clone'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('newName')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AssemblyController.prototype, "cloneBOM", null);
__decorate([
    (0, common_1.Post)('from-bom'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [assembly_dto_1.AssembleFromBOMDto, Object]),
    __metadata("design:returntype", Promise)
], AssemblyController.prototype, "assembleFromBOM", null);
__decorate([
    (0, common_1.Get)('cost/bom'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [assembly_dto_1.CalculateBOMCostDto]),
    __metadata("design:returntype", Promise)
], AssemblyController.prototype, "calculateBOMCost", null);
__decorate([
    (0, common_1.Get)('bom/compare'),
    __param(0, (0, common_1.Query)('bomId1')),
    __param(1, (0, common_1.Query)('bomId2')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AssemblyController.prototype, "compareBOMs", null);
__decorate([
    (0, common_1.Get)('analytics'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AssemblyController.prototype, "getAssemblyAnalytics", null);
exports.AssemblyController = AssemblyController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/assembly'),
    __metadata("design:paramtypes", [assembly_service_1.AssemblyService])
], AssemblyController);
