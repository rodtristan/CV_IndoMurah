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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryRoleMenuDto = exports.RoleMenuResponseDto = exports.UpdateRoleMenuDto = exports.CreateRoleMenuDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateRoleMenuDto {
}
exports.CreateRoleMenuDto = CreateRoleMenuDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'roleId' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateRoleMenuDto.prototype, "roleId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'menuId' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateRoleMenuDto.prototype, "menuId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'isActive' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateRoleMenuDto.prototype, "isActive", void 0);
class UpdateRoleMenuDto {
}
exports.UpdateRoleMenuDto = UpdateRoleMenuDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'roleId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateRoleMenuDto.prototype, "roleId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'menuId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateRoleMenuDto.prototype, "menuId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'isActive' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateRoleMenuDto.prototype, "isActive", void 0);
class RoleMenuResponseDto {
}
exports.RoleMenuResponseDto = RoleMenuResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'roleId' }),
    __metadata("design:type", Number)
], RoleMenuResponseDto.prototype, "roleId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'menuId' }),
    __metadata("design:type", Number)
], RoleMenuResponseDto.prototype, "menuId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'isActive' }),
    __metadata("design:type", Boolean)
], RoleMenuResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'role' }),
    __metadata("design:type", Object)
], RoleMenuResponseDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'menu' }),
    __metadata("design:type", Object)
], RoleMenuResponseDto.prototype, "menu", void 0);
class QueryRoleMenuDto {
}
exports.QueryRoleMenuDto = QueryRoleMenuDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fields to select' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryRoleMenuDto.prototype, "$select", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Relations to include' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryRoleMenuDto.prototype, "$include", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to skip' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryRoleMenuDto.prototype, "$skip", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to take' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryRoleMenuDto.prototype, "$take", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryRoleMenuDto.prototype, "$search", void 0);
