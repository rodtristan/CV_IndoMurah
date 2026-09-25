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
exports.BaseController = void 0;
const common_1 = require("@nestjs/common");
const api_response_dto_1 = require("../dto/api-response-dto");
class BaseController {
    constructor(service, config) {
        this.service = service;
        this.modelName = config.modelName;
        this.pluralName = config.pluralName ?? config.modelName + 's';
        this.primaryKeyType = config.primaryKeyType ?? 'number';
        this.paramId = config.paramId ?? 'id';
    }
    async findAll(query) {
        const result = await this.service.findAll(query);
        return api_response_dto_1.ApiResponse.paginated(result.data, result.total, result.skip, result.take);
    }
    async getCount(query) {
        const result = await this.service.getCount(query);
        return api_response_dto_1.ApiResponse.ok(result);
    }
    async findById(id, query) {
        const parsedId = this.parseId(id);
        const data = await this.service.findById(parsedId, query);
        if (!data) {
            return api_response_dto_1.ApiResponse.error(`${this.modelName} not found`);
        }
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async findByField(field, value, query) {
        const parsedValue = this.parseValue(value);
        const data = await this.service.findByField(field, parsedValue, query);
        if (!data) {
            return api_response_dto_1.ApiResponse.error(`${this.modelName} not found`);
        }
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async create(dto) {
        const data = await this.service.create(dto);
        return api_response_dto_1.ApiResponse.ok(data, `${this.modelName} created successfully`);
    }
    async createBulk(dtos) {
        const result = await this.service.createBulk(dtos);
        return api_response_dto_1.ApiResponse.ok(result, `${result.successCount} created, ${result.failedCount} failed`);
    }
    async patchById(id, dto) {
        const parsedId = this.parseId(id);
        const data = await this.service.patchById(parsedId, dto);
        return api_response_dto_1.ApiResponse.ok(data, `${this.modelName} updated successfully`);
    }
    async patchByFilterReference(_field, _value, _dto) {
        throw this.disabled();
    }
    async patchBulk(_body) {
        throw this.disabled();
    }
    async upsert(body) {
        const data = await this.service.upsert(body.where, body.create, body.update);
        return api_response_dto_1.ApiResponse.ok(data, `${this.modelName} upserted successfully`);
    }
    async upsertByFilterReference(field, body) {
        const data = await this.service.upsertByFilterReference({ [field]: body.filterValue }, body.create, body.update);
        return api_response_dto_1.ApiResponse.ok(data, `${this.modelName} upserted successfully`);
    }
    async upsertBulk(_body) {
        throw this.disabled();
    }
    async deleteById(id) {
        const parsedId = this.parseId(id);
        const data = await this.service.deleteById(parsedId);
        return api_response_dto_1.ApiResponse.ok(data, `${this.modelName} deleted successfully`);
    }
    async deleteByFilterReference(_field, _value) {
        throw this.disabled();
    }
    async deleteBulk(_body) {
        throw this.disabled();
    }
    disabled() {
        return new common_1.NotFoundException('Endpoint ini tidak tersedia');
    }
    parseId(id) {
        if (this.primaryKeyType === 'string') {
            return String(id);
        }
        return parseInt(String(id), 10);
    }
    parseValue(value) {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        if (/^-?\d+$/.test(value))
            return parseInt(value, 10);
        if (/^-?\d+\.\d+$/.test(value))
            return parseFloat(value);
        return value;
    }
}
exports.BaseController = BaseController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BaseController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('count'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BaseController.prototype, "getCount", null);
__decorate([
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BaseController.prototype, "findById", null);
__decorate([
    __param(0, (0, common_1.Param)('field')),
    __param(1, (0, common_1.Param)('value')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], BaseController.prototype, "findByField", null);
__decorate([
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BaseController.prototype, "create", null);
__decorate([
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], BaseController.prototype, "createBulk", null);
__decorate([
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BaseController.prototype, "patchById", null);
__decorate([
    __param(0, (0, common_1.Param)('field')),
    __param(1, (0, common_1.Param)('value')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], BaseController.prototype, "patchByFilterReference", null);
__decorate([
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BaseController.prototype, "patchBulk", null);
__decorate([
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BaseController.prototype, "upsert", null);
__decorate([
    __param(0, (0, common_1.Param)('field')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BaseController.prototype, "upsertByFilterReference", null);
__decorate([
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BaseController.prototype, "upsertBulk", null);
__decorate([
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BaseController.prototype, "deleteById", null);
__decorate([
    __param(0, (0, common_1.Param)('field')),
    __param(1, (0, common_1.Param)('value')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BaseController.prototype, "deleteByFilterReference", null);
__decorate([
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BaseController.prototype, "deleteBulk", null);
