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
exports.MenuController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const menu_service_1 = require("./menu-service");
const menu_dto_1 = require("./dto/menu-dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../common/dto/api-response-dto");
const current_user_decorator_1 = require("../../common/decorators/current-user-decorator");
let MenuController = class MenuController {
    constructor(menuService) {
        this.menuService = menuService;
    }
    async findAll(query) {
        const { data, total, skip, take } = await this.menuService.findAll(query);
        return api_response_dto_1.ApiResponse.paginated(data, total, skip, take);
    }
    async myMenus(user) {
        const menus = await this.menuService.getAccessibleMenus(user.id, user.roleId);
        return api_response_dto_1.ApiResponse.ok(menus);
    }
    async findOne(id) {
        const data = await this.menuService.findOne(id);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async create(dto) {
        const data = await this.menuService.create(dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Menu created');
    }
    async update(id, dto) {
        const data = await this.menuService.update(id, dto);
        return api_response_dto_1.ApiResponse.ok(data, 'Menu updated');
    }
    async remove(id) {
        const data = await this.menuService.remove(id);
        return api_response_dto_1.ApiResponse.ok(data, 'Menu deactivated');
    }
    async getRoleMenus(roleId) {
        const data = await this.menuService.getRoleMenus(roleId);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async assignToRole(roleId, dto) {
        const data = await this.menuService.assignMenuToRole(roleId, dto.menuId);
        return api_response_dto_1.ApiResponse.ok(data, 'Menu assigned to role');
    }
    async revokeFromRole(roleId, menuId) {
        const data = await this.menuService.revokeMenuFromRole(roleId, menuId);
        return api_response_dto_1.ApiResponse.ok(data, 'Menu revoked from role');
    }
    async getUserMenus(userId) {
        const data = await this.menuService.getUserMenus(userId);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async assignToUser(userId, dto) {
        const data = await this.menuService.assignMenuToUser(userId, dto.menuId);
        return api_response_dto_1.ApiResponse.ok(data, 'Menu assigned to user');
    }
    async revokeFromUser(userId, menuId) {
        const data = await this.menuService.revokeMenuFromUser(userId, menuId);
        return api_response_dto_1.ApiResponse.ok(data, 'Menu revoked from user');
    }
    async checkAccess(menuName, user) {
        const hasAccess = await this.menuService.checkUserAccess(user.id, user.roleId, menuName);
        return api_response_dto_1.ApiResponse.ok({ menuName, hasAccess });
    }
};
exports.MenuController = MenuController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all menus' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my-menus'),
    (0, swagger_1.ApiOperation)({ summary: 'Get accessible menus for the current user' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "myMenus", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get menu by ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create menu' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [menu_dto_1.CreateMenuDto]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update menu' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, menu_dto_1.UpdateMenuDto]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate menu' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('role/:roleId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get menus assigned to a role' }),
    __param(0, (0, common_1.Param)('roleId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "getRoleMenus", null);
__decorate([
    (0, common_1.Post)('role/:roleId/assign'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign menu to role' }),
    __param(0, (0, common_1.Param)('roleId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, menu_dto_1.AssignMenuDto]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "assignToRole", null);
__decorate([
    (0, common_1.Delete)('role/:roleId/revoke/:menuId'),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke menu from role' }),
    __param(0, (0, common_1.Param)('roleId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('menuId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "revokeFromRole", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get menus assigned to a user' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "getUserMenus", null);
__decorate([
    (0, common_1.Post)('user/:userId/assign'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign menu to user (overrides role default)' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, menu_dto_1.AssignMenuDto]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "assignToUser", null);
__decorate([
    (0, common_1.Delete)('user/:userId/revoke/:menuId'),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke menu from user' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('menuId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "revokeFromUser", null);
__decorate([
    (0, common_1.Get)('check/:menuName'),
    (0, swagger_1.ApiOperation)({ summary: 'Check if current user has access to a specific menu' }),
    __param(0, (0, common_1.Param)('menuName')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "checkAccess", null);
exports.MenuController = MenuController = __decorate([
    (0, swagger_1.ApiTags)('Menus'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('menus'),
    __metadata("design:paramtypes", [menu_service_1.MenuService])
], MenuController);
