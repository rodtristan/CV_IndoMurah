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
exports.QueryPointRedemptionDto = exports.PointRedemptionResponseDto = exports.UpdatePointRedemptionDto = exports.CreatePointRedemptionDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreatePointRedemptionDto {
}
exports.CreatePointRedemptionDto = CreatePointRedemptionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer ID' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePointRedemptionDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Redemption code' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePointRedemptionDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Points redeemed' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePointRedemptionDto.prototype, "pointsRedeemed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reward name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePointRedemptionDto.prototype, "rewardName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reward value' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePointRedemptionDto.prototype, "rewardValue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Redemption date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], CreatePointRedemptionDto.prototype, "date", void 0);
class UpdatePointRedemptionDto {
}
exports.UpdatePointRedemptionDto = UpdatePointRedemptionDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customer ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdatePointRedemptionDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Redemption code' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePointRedemptionDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Points redeemed' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdatePointRedemptionDto.prototype, "pointsRedeemed", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reward name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePointRedemptionDto.prototype, "rewardName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reward value' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePointRedemptionDto.prototype, "rewardValue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Redemption date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], UpdatePointRedemptionDto.prototype, "date", void 0);
class PointRedemptionResponseDto {
}
exports.PointRedemptionResponseDto = PointRedemptionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID' }),
    __metadata("design:type", Number)
], PointRedemptionResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer ID' }),
    __metadata("design:type", Number)
], PointRedemptionResponseDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Redemption code' }),
    __metadata("design:type", String)
], PointRedemptionResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Points redeemed' }),
    __metadata("design:type", Number)
], PointRedemptionResponseDto.prototype, "pointsRedeemed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reward name' }),
    __metadata("design:type", String)
], PointRedemptionResponseDto.prototype, "rewardName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reward value' }),
    __metadata("design:type", Number)
], PointRedemptionResponseDto.prototype, "rewardValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Redemption date' }),
    __metadata("design:type", Date)
], PointRedemptionResponseDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created by ID' }),
    __metadata("design:type", String)
], PointRedemptionResponseDto.prototype, "createdById", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created at' }),
    __metadata("design:type", Date)
], PointRedemptionResponseDto.prototype, "createdAt", void 0);
class QueryPointRedemptionDto {
}
exports.QueryPointRedemptionDto = QueryPointRedemptionDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fields to select' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPointRedemptionDto.prototype, "$select", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Relations to include (e.g., customer,creator)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPointRedemptionDto.prototype, "$include", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to skip' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryPointRedemptionDto.prototype, "$skip", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to take' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryPointRedemptionDto.prototype, "$take", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPointRedemptionDto.prototype, "$search", void 0);
