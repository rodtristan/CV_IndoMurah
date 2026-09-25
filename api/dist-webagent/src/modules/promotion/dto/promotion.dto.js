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
exports.UpdatePromotionDto = exports.CreatePromotionDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class CreatePromotionDto {
}
exports.CreatePromotionDto = CreatePromotionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Promotion code' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePromotionDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Promotion name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePromotionDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Promotion type: DISCOUNT, BOGO, GIFT, BUY_GET' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePromotionDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Discount type: PERCENTAGE, FIXED' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePromotionDto.prototype, "discountType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Discount value (percentage or fixed amount)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => value ? parseFloat(value) : undefined),
    __metadata("design:type", Number)
], CreatePromotionDto.prototype, "discountValue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Minimum purchase amount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => value ? parseFloat(value) : undefined),
    __metadata("design:type", Number)
], CreatePromotionDto.prototype, "minPurchase", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum discount amount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => value ? parseFloat(value) : undefined),
    __metadata("design:type", Number)
], CreatePromotionDto.prototype, "maxDiscountAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Promotion start date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePromotionDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Promotion end date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePromotionDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Usage limit (null = unlimited)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => value ? parseInt(value, 10) : undefined),
    __metadata("design:type", Number)
], CreatePromotionDto.prototype, "usageLimit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePromotionDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true, description: 'Is active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePromotionDto.prototype, "isActive", void 0);
class UpdatePromotionDto {
}
exports.UpdatePromotionDto = UpdatePromotionDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Promotion code' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePromotionDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Promotion name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePromotionDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Promotion type: DISCOUNT, BOGO, GIFT, BUY_GET' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePromotionDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Discount type: PERCENTAGE, FIXED' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePromotionDto.prototype, "discountType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Discount value' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => value ? parseFloat(value) : undefined),
    __metadata("design:type", Number)
], UpdatePromotionDto.prototype, "discountValue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Minimum purchase amount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => value ? parseFloat(value) : undefined),
    __metadata("design:type", Number)
], UpdatePromotionDto.prototype, "minPurchase", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum discount amount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => value ? parseFloat(value) : undefined),
    __metadata("design:type", Number)
], UpdatePromotionDto.prototype, "maxDiscountAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Promotion start date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdatePromotionDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Promotion end date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdatePromotionDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Usage limit' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => value ? parseInt(value, 10) : undefined),
    __metadata("design:type", Number)
], UpdatePromotionDto.prototype, "usageLimit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePromotionDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePromotionDto.prototype, "isActive", void 0);
