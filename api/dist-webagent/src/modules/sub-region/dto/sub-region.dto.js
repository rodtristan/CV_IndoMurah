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
exports.UpdateSubRegionDto = exports.CreateSubRegionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateSubRegionDto {
}
exports.CreateSubRegionDto = CreateSubRegionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'SWL001' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSubRegionDto.prototype, "Code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Jakarta Selatan' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSubRegionDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateSubRegionDto.prototype, "RegionID", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Kota Jakarta Selatan' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSubRegionDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateSubRegionDto.prototype, "IsActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateSubRegionDto.prototype, "SortOrder", void 0);
class UpdateSubRegionDto {
}
exports.UpdateSubRegionDto = UpdateSubRegionDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Jakarta Selatan' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSubRegionDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateSubRegionDto.prototype, "RegionID", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Kota Jakarta Selatan' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSubRegionDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateSubRegionDto.prototype, "IsActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateSubRegionDto.prototype, "SortOrder", void 0);
