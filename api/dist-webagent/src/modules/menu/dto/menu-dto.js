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
exports.AssignMenuDto = exports.UpdateMenuDto = exports.CreateMenuDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateMenuDto {
}
exports.CreateMenuDto = CreateMenuDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Menu name/key for routing' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMenuDto.prototype, "menuName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Menu type (e.g., sidebar, header)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMenuDto.prototype, "menuType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Icon class or name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMenuDto.prototype, "icon", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Route path' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMenuDto.prototype, "route", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Parent menu ID for hierarchy' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateMenuDto.prototype, "parentMenuId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true, description: 'Is menu active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateMenuDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 0, description: 'Sort order' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateMenuDto.prototype, "sortOrder", void 0);
class UpdateMenuDto {
}
exports.UpdateMenuDto = UpdateMenuDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Menu name/key' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMenuDto.prototype, "menuName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Menu type' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMenuDto.prototype, "menuType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Icon class or name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMenuDto.prototype, "icon", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Route path' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMenuDto.prototype, "route", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Parent menu ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateMenuDto.prototype, "parentMenuId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is menu active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateMenuDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sort order' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateMenuDto.prototype, "sortOrder", void 0);
class AssignMenuDto {
}
exports.AssignMenuDto = AssignMenuDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Menu ID to assign' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], AssignMenuDto.prototype, "menuId", void 0);
