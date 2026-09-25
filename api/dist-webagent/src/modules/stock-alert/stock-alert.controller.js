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
exports.StockAlertController = void 0;
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const base_controller_1 = require("../../common/templates/base.controller");
const stock_alert_service_1 = require("./stock-alert.service");
const stock_alert_dto_1 = require("./dto/stock-alert.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth-guard");
let StockAlertController = class StockAlertController extends base_controller_1.BaseController {
    constructor(stockAlertService) {
        super(stockAlertService, {
            modelName: 'StockAlert',
            pluralName: 'StockAlerts',
            primaryKeyType: 'number',
            paramId: 'id',
            routePrefix: 'stock-alert',
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
exports.StockAlertController = StockAlertController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all StockAlerts with OData query support' }),
    (0, swagger_1.ApiQuery)({ name: '$select', required: false, description: 'Select fields' }),
    (0, swagger_1.ApiQuery)({ name: '$include', required: false, description: 'Include relations' }),
    (0, swagger_1.ApiQuery)({ name: '$where[field]', required: false, description: 'Filter by field' }),
    (0, swagger_1.ApiQuery)({ name: '$orderBy[field]', required: false, description: 'Sort: asc/desc' }),
    (0, swagger_1.ApiQuery)({ name: '$skip', required: false, type: Number, description: 'Offset' }),
    (0, swagger_1.ApiQuery)({ name: '$take', required: false, type: Number, description: 'Limit' }),
    (0, swagger_1.ApiQuery)({ name: '$search', required: false, description: 'Search keyword' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StockAlertController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('count'),
    (0, swagger_1.ApiOperation)({ summary: 'Get count of StockAlerts' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StockAlertController.prototype, "getCount", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get StockAlert by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StockAlertController.prototype, "findById", null);
__decorate([
    (0, common_1.Get)('by/:field/:value'),
    (0, swagger_1.ApiOperation)({ summary: 'Get StockAlert by field reference' }),
    __param(0, (0, common_1.Param)('field')),
    __param(1, (0, common_1.Param)('value')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], StockAlertController.prototype, "findByField", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new StockAlert' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [stock_alert_dto_1.CreateStockAlertDto]),
    __metadata("design:returntype", Promise)
], StockAlertController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Create multiple StockAlerts' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], StockAlertController.prototype, "createBulk", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update StockAlert by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StockAlertController.prototype, "patchById", null);
__decorate([
    (0, common_1.Patch)('by/:field/:value'),
    (0, swagger_1.ApiOperation)({ summary: 'Update StockAlerts by field reference' }),
    __param(0, (0, common_1.Param)('field')),
    __param(1, (0, common_1.Param)('value')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], StockAlertController.prototype, "patchByFilterReference", null);
__decorate([
    (0, common_1.Patch)('bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Update multiple StockAlerts' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StockAlertController.prototype, "patchBulk", null);
__decorate([
    (0, common_1.Put)(),
    (0, swagger_1.ApiOperation)({ summary: 'Upsert StockAlert' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StockAlertController.prototype, "upsert", null);
__decorate([
    (0, common_1.Put)('by/:field'),
    (0, swagger_1.ApiOperation)({ summary: 'Upsert StockAlert by field reference' }),
    __param(0, (0, common_1.Param)('field')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StockAlertController.prototype, "upsertByFilterReference", null);
__decorate([
    (0, common_1.Put)('bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk upsert StockAlerts' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StockAlertController.prototype, "upsertBulk", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete StockAlert by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StockAlertController.prototype, "deleteById", null);
__decorate([
    (0, common_1.Delete)('by/:field/:value'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete StockAlerts by field reference' }),
    __param(0, (0, common_1.Param)('field')),
    __param(1, (0, common_1.Param)('value')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StockAlertController.prototype, "deleteByFilterReference", null);
__decorate([
    (0, common_1.Delete)('bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete multiple StockAlerts' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StockAlertController.prototype, "deleteBulk", null);
exports.StockAlertController = StockAlertController = __decorate([
    (0, swagger_1.ApiTags)('StockAlerts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('stock-alert'),
    __metadata("design:paramtypes", [stock_alert_service_1.StockAlertService])
], StockAlertController);
