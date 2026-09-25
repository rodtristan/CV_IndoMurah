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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const user_service_1 = require("./user-service");
const user_dto_1 = require("./dto/user-dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../common/dto/api-response-dto");
let UserController = class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    async findAll(query) {
        const { data, total, skip, take } = await this.userService.findAll(query);
        return api_response_dto_1.ApiResponse.paginated(data, total, skip, take);
    }
    async findOne(id, query) {
        const data = await this.userService.findOne(id, query);
        if (!data)
            throw new common_1.NotFoundException('User not found');
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async create(dto) {
        const data = await this.userService.create(dto);
        return api_response_dto_1.ApiResponse.ok(data, 'User created successfully');
    }
    async update(id, dto) {
        const data = await this.userService.update(id, dto);
        return api_response_dto_1.ApiResponse.ok(data, 'User updated successfully');
    }
    async softDelete(id) {
        const data = await this.userService.softDelete(id);
        return api_response_dto_1.ApiResponse.ok(data, 'User deactivated successfully');
    }
    async getRoles(id) {
        const data = await this.userService.getRoles(id);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async assignRole(id, dto) {
        const data = await this.userService.assignRole(id, dto.roleId);
        return api_response_dto_1.ApiResponse.ok(data, 'Role assigned to user');
    }
    async revokeRole(id, roleId) {
        const data = await this.userService.revokeRole(id, roleId);
        return api_response_dto_1.ApiResponse.ok(data, 'Role revoked from user');
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all users (Smart Query supported)' }),
    (0, swagger_1.ApiQuery)({ name: '$select', required: false, description: 'Select fields: id,name,email,role' }),
    (0, swagger_1.ApiQuery)({ name: '$include', required: false, description: 'Include relations: userRoles' }),
    (0, swagger_1.ApiQuery)({ name: '$where[isActive]', required: false, description: 'Filter: true/false' }),
    (0, swagger_1.ApiQuery)({ name: '$search', required: false, description: 'Search keyword' }),
    (0, swagger_1.ApiQuery)({ name: '$orderBy[createdAt]', required: false, description: 'Sort: asc/desc' }),
    (0, swagger_1.ApiQuery)({ name: '$skip', required: false, description: 'Offset', type: Number }),
    (0, swagger_1.ApiQuery)({ name: '$take', required: false, description: 'Limit', type: Number }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user by ID (Smart Query supported)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create user' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete user' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "softDelete", null);
__decorate([
    (0, common_1.Get)(':id/roles'),
    (0, swagger_1.ApiOperation)({ summary: 'Get main role + extra roles (UserRole) for a user' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getRoles", null);
__decorate([
    (0, common_1.Post)(':id/roles'),
    (0, swagger_1.ApiOperation)({ summary: "Grant an extra role to a user (UserRole) — also seeds that role's menus" }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_dto_1.AssignRoleDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "assignRole", null);
__decorate([
    (0, common_1.Delete)(':id/roles/:roleId'),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke an extra role from a user' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('roleId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "revokeRole", null);
exports.UserController = UserController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
