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
exports.RoleController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const role_service_1 = require("./role-service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../common/dto/api-response-dto");
let RoleController = class RoleController {
    constructor(roleService) {
        this.roleService = roleService;
    }
    async findAll(query) {
        const { data, total, skip, take } = await this.roleService.findAll(query);
        return api_response_dto_1.ApiResponse.paginated(data, total, skip, take);
    }
    async findOne(id, query) {
        const data = await this.roleService.findOne(id, query);
        if (!data)
            throw new common_1.NotFoundException('Role not found');
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async create(body) { return api_response_dto_1.ApiResponse.ok(await this.roleService.create(body), 'Role created'); }
    async update(id, body) { return api_response_dto_1.ApiResponse.ok(await this.roleService.update(id, body), 'Role updated'); }
    async remove(id) { return api_response_dto_1.ApiResponse.ok(await this.roleService.remove(id), 'Role deactivated'); }
};
exports.RoleController = RoleController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all roles (Smart Query)' }),
    (0, swagger_1.ApiQuery)({ name: '$select', required: false }),
    (0, swagger_1.ApiQuery)({ name: '$include', required: false }),
    (0, swagger_1.ApiQuery)({ name: '$search', required: false }),
    (0, swagger_1.ApiQuery)({ name: '$skip', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: '$take', required: false, type: Number }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get role by ID (Smart Query)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create role' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update role' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate role' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "remove", null);
exports.RoleController = RoleController = __decorate([
    (0, swagger_1.ApiTags)('Roles'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('roles'),
    __metadata("design:paramtypes", [role_service_1.RoleService])
], RoleController);
