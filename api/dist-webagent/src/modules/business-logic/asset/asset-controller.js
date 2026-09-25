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
exports.AssetController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const asset_service_1 = require("./asset-service");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const asset_dto_1 = require("./asset.dto");
let AssetController = class AssetController {
    constructor(assetService) {
        this.assetService = assetService;
    }
    async createAsset(dto) {
        return this.assetService.createAsset(dto, 'system');
    }
    async listAssets(dto) {
        return this.assetService.listAssets(dto);
    }
    async getAsset(id) {
        return this.assetService.getAsset(id);
    }
    async updateAsset(id, dto) {
        return this.assetService.updateAsset(id, dto, 'system');
    }
    async deleteAsset(id) {
        return this.assetService.deleteAsset(id, 'system');
    }
    async calculateDepreciation(dto) {
        return this.assetService.calculateDepreciation(dto);
    }
    async getDepreciationReport(dto) {
        return this.assetService.getDepreciationReport(dto);
    }
    async getAssetValuation(dto) {
        return this.assetService.getAssetValuation(dto);
    }
    async disposeAsset(id, dto) {
        return this.assetService.disposeAsset(id, dto, 'system');
    }
    async transferAsset(id, dto) {
        return this.assetService.TransferAsset(id, dto, 'system');
    }
    async createCategory(dto) {
        return this.assetService.createCategory(dto);
    }
    async listCategories() {
        return this.assetService.listCategories();
    }
};
exports.AssetController = AssetController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new asset' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [asset_dto_1.CreateAssetDto]),
    __metadata("design:returntype", Promise)
], AssetController.prototype, "createAsset", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all assets' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [asset_dto_1.AssetFilterDto]),
    __metadata("design:returntype", Promise)
], AssetController.prototype, "listAssets", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get asset by ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AssetController.prototype, "getAsset", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update asset' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, asset_dto_1.UpDateAssetDto]),
    __metadata("design:returntype", Promise)
], AssetController.prototype, "updateAsset", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete asset (soft delete)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AssetController.prototype, "deleteAsset", null);
__decorate([
    (0, common_1.Get)('depreciation/calculate'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate depreciation for assets' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [asset_dto_1.CalculateDepreciationDto]),
    __metadata("design:returntype", Promise)
], AssetController.prototype, "calculateDepreciation", null);
__decorate([
    (0, common_1.Get)('reports/depreciation'),
    (0, swagger_1.ApiOperation)({ summary: 'Get depreciation report' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [asset_dto_1.AssetDepreciationReportDto]),
    __metadata("design:returntype", Promise)
], AssetController.prototype, "getDepreciationReport", null);
__decorate([
    (0, common_1.Get)('reports/valuation'),
    (0, swagger_1.ApiOperation)({ summary: 'Get asset valuation report' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [asset_dto_1.AssetValuationDto]),
    __metadata("design:returntype", Promise)
], AssetController.prototype, "getAssetValuation", null);
__decorate([
    (0, common_1.Post)(':id/dispose'),
    (0, swagger_1.ApiOperation)({ summary: 'Dispose/sell asset' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, asset_dto_1.DisposeAssetDto]),
    __metadata("design:returntype", Promise)
], AssetController.prototype, "disposeAsset", null);
__decorate([
    (0, common_1.Post)(':id/transfer'),
    (0, swagger_1.ApiOperation)({ summary: 'Transfer asset to new location/person' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, asset_dto_1.TransferAssetDto]),
    __metadata("design:returntype", Promise)
], AssetController.prototype, "transferAsset", null);
__decorate([
    (0, common_1.Post)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'Create asset category' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AssetController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Get)('categories/list'),
    (0, swagger_1.ApiOperation)({ summary: 'List asset categories' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AssetController.prototype, "listCategories", null);
exports.AssetController = AssetController = __decorate([
    (0, swagger_1.ApiTags)('Business Logic - Asset Management'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/asset'),
    __metadata("design:paramtypes", [asset_service_1.AssetService])
], AssetController);
