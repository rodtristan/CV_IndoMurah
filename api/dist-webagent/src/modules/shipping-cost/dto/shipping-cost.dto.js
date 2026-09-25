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
exports.UpdateShippingCostDto = exports.CreateShippingCostDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateShippingCostDto {
}
exports.CreateShippingCostDto = CreateShippingCostDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ONG001' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShippingCostDto.prototype, "Code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'JNE Regular' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShippingCostDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateShippingCostDto.prototype, "RegionID", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateShippingCostDto.prototype, "SubRegionID", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 15000 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateShippingCostDto.prototype, "Cost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 3 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateShippingCostDto.prototype, "EstimatedDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Ongkir reguler JNE' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateShippingCostDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateShippingCostDto.prototype, "IsActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateShippingCostDto.prototype, "SortOrder", void 0);
class UpdateShippingCostDto {
}
exports.UpdateShippingCostDto = UpdateShippingCostDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'JNE Regular' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateShippingCostDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateShippingCostDto.prototype, "RegionID", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateShippingCostDto.prototype, "SubRegionID", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 15000 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateShippingCostDto.prototype, "Cost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 3 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateShippingCostDto.prototype, "EstimatedDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Ongkir reguler JNE' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateShippingCostDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateShippingCostDto.prototype, "IsActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateShippingCostDto.prototype, "SortOrder", void 0);
