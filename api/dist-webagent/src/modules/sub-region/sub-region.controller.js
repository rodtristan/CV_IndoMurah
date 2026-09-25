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
exports.SubRegionController = void 0;
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const base_controller_1 = require("../../common/templates/base.controller");
const sub_region_service_1 = require("./sub-region.service");
const sub_region_dto_1 = require("./dto/sub-region.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth-guard");
let SubRegionController = class SubRegionController extends base_controller_1.BaseController {
    constructor(subRegionService) {
        super(subRegionService, {
            modelName: 'SubRegion',
            pluralName: 'SubRegions',
            primaryKeyType: 'number',
            paramId: 'id',
            routePrefix: 'sub-region',
        });
    }
    async findAll(query) {
        return super.findAll(query);
    }
    async getCount(query) {
        return super.getCount(query);
    }
    async findById(id, query) {
        return super.findById(id, query);
    }
    async findByField(field, value, query) {
        return super.findByField(field, value, query);
    }
    async create(dto) {
        return super.create(dto);
    }
    async createBulk(dtos) {
        return super.createBulk(dtos);
    }
    async patchById(id, dto) {
        return super.patchById(id, dto);
    }
    async patchByFilterReference(field, value, dto) {
        return super.patchByFilterReference(field, value, dto);
    }
    async patchBulk(body) {
        return super.patchBulk(body);
    }
    async upsert(body) {
        return super.upsert(body);
    }
    async upsertByFilterReference(field, body) {
        return super.upsertByFilterReference(field, body);
    }
    async upsertBulk(body) {
        return super.upsertBulk(body);
    }
    async deleteById(id) {
        return super.deleteById(id);
    }
    async deleteByFilterReference(field, value) {
        return super.deleteByFilterReference(field, value);
    }
    async deleteBulk(body) {
        return super.deleteBulk(body);
    }
};
exports.SubRegionController = SubRegionController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all Sub Regions with OData query support' }),
    (0, swagger_1.ApiQuery)({ name: '$select', required: false, description: 'Select fields' }),
    (0, swagger_1.ApiQuery)({ name: '$include', required: false, description: 'Include relations: region, shippingCosts' }),
    (0, swagger_1.ApiQuery)({ name: '$where[field]', required: false, description: 'Filter by field' }),
    (0, swagger_1.ApiQuery)({ name: '$where[regionId]', required: false, description: 'Filter by region ID' }),
    (0, swagger_1.ApiQuery)({ name: '$orderBy[field]', required: false, description: 'Sort: asc/desc' }),
    (0, swagger_1.ApiQuery)({ name: '$skip', required: false, type: Number, description: 'Offset' }),
    (0, swagger_1.ApiQuery)({ name: '$take', required: false, type: Number, description: 'Limit' }),
    (0, swagger_1.ApiQuery)({ name: '$search', required: false, description: 'Search: code, name' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubRegionController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('count'),
    (0, swagger_1.ApiOperation)({ summary: 'Get count of Sub Regions' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubRegionController.prototype, "getCount", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Sub Region by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SubRegionController.prototype, "findById", null);
__decorate([
    (0, common_1.Get)('by/:field/:value'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Sub Region by field reference' }),
    __param(0, (0, common_1.Param)('field')),
    __param(1, (0, common_1.Param)('value')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], SubRegionController.prototype, "findByField", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new Sub Region' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sub_region_dto_1.CreateSubRegionDto]),
    __metadata("design:returntype", Promise)
], SubRegionController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Create multiple Sub Regions' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], SubRegionController.prototype, "createBulk", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update Sub Region by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SubRegionController.prototype, "patchById", null);
__decorate([
    (0, common_1.Patch)('by/:field/:value'),
    (0, swagger_1.ApiOperation)({ summary: 'Update Sub Region by field reference' }),
    __param(0, (0, common_1.Param)('field')),
    __param(1, (0, common_1.Param)('value')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], SubRegionController.prototype, "patchByFilterReference", null);
__decorate([
    (0, common_1.Patch)('bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Update multiple Sub Regions' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubRegionController.prototype, "patchBulk", null);
__decorate([
    (0, common_1.Put)(),
    (0, swagger_1.ApiOperation)({ summary: 'Upsert Sub Region' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubRegionController.prototype, "upsert", null);
__decorate([
    (0, common_1.Put)('by/:field'),
    (0, swagger_1.ApiOperation)({ summary: 'Upsert Sub Region by field reference' }),
    __param(0, (0, common_1.Param)('field')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SubRegionController.prototype, "upsertByFilterReference", null);
__decorate([
    (0, common_1.Put)('bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk upsert Sub Regions' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubRegionController.prototype, "upsertBulk", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete Sub Region by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubRegionController.prototype, "deleteById", null);
__decorate([
    (0, common_1.Delete)('by/:field/:value'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete Sub Region by field reference' }),
    __param(0, (0, common_1.Param)('field')),
    __param(1, (0, common_1.Param)('value')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SubRegionController.prototype, "deleteByFilterReference", null);
__decorate([
    (0, common_1.Delete)('bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete multiple Sub Regions' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubRegionController.prototype, "deleteBulk", null);
exports.SubRegionController = SubRegionController = __decorate([
    (0, swagger_1.ApiTags)('Sub Region'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('sub-region'),
    __metadata("design:paramtypes", [sub_region_service_1.SubRegionService])
], SubRegionController);
