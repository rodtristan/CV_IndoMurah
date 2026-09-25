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
exports.QueryUserRoleDto = exports.UserRoleResponseDto = exports.UpdateUserRoleDto = exports.CreateUserRoleDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateUserRoleDto {
}
exports.CreateUserRoleDto = CreateUserRoleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'userId' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserRoleDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'roleId' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateUserRoleDto.prototype, "roleId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'isActive' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateUserRoleDto.prototype, "isActive", void 0);
class UpdateUserRoleDto {
}
exports.UpdateUserRoleDto = UpdateUserRoleDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'userId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserRoleDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'roleId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateUserRoleDto.prototype, "roleId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'isActive' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateUserRoleDto.prototype, "isActive", void 0);
class UserRoleResponseDto {
}
exports.UserRoleResponseDto = UserRoleResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'userId' }),
    __metadata("design:type", String)
], UserRoleResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'roleId' }),
    __metadata("design:type", Number)
], UserRoleResponseDto.prototype, "roleId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'isActive' }),
    __metadata("design:type", Boolean)
], UserRoleResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'user' }),
    __metadata("design:type", Object)
], UserRoleResponseDto.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'role' }),
    __metadata("design:type", Object)
], UserRoleResponseDto.prototype, "role", void 0);
class QueryUserRoleDto {
}
exports.QueryUserRoleDto = QueryUserRoleDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fields to select' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryUserRoleDto.prototype, "$select", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Relations to include' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryUserRoleDto.prototype, "$include", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to skip' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryUserRoleDto.prototype, "$skip", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to take' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryUserRoleDto.prototype, "$take", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryUserRoleDto.prototype, "$search", void 0);
