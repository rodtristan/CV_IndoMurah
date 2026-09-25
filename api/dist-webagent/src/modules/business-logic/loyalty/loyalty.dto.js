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
exports.RedemptionFilterDto = exports.CustomerPointsFilterDto = exports.AwardPointsDto = exports.CalculatePointsDto = exports.RedeemPointsDto = exports.CreatePointRedemptionDto = exports.UpDatePointSettingsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UpDatePointSettingsDto {
}
exports.UpDatePointSettingsDto = UpDatePointSettingsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Points earned per Rupiah spent' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpDatePointSettingsDto.prototype, "PointsPerRupiah", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Minimum transaction to earn points' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpDatePointSettingsDto.prototype, "MinimumTransaction", void 0);
class CreatePointRedemptionDto {
}
exports.CreatePointRedemptionDto = CreatePointRedemptionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePointRedemptionDto.prototype, "CustomerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Points to redeem' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreatePointRedemptionDto.prototype, "PointsRedeemed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reward Name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePointRedemptionDto.prototype, "RewardName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reward value in Rupiah' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePointRedemptionDto.prototype, "RewardValue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePointRedemptionDto.prototype, "Notes", void 0);
class RedeemPointsDto {
}
exports.RedeemPointsDto = RedeemPointsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Points to redeem' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], RedeemPointsDto.prototype, "Points", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reward/Product Name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RedeemPointsDto.prototype, "RewardName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RedeemPointsDto.prototype, "Notes", void 0);
class CalculatePointsDto {
}
exports.CalculatePointsDto = CalculatePointsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction Amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CalculatePointsDto.prototype, "Amount", void 0);
class AwardPointsDto {
}
exports.AwardPointsDto = AwardPointsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AwardPointsDto.prototype, "CustomerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Points to award' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], AwardPointsDto.prototype, "Points", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reason' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AwardPointsDto.prototype, "Reason", void 0);
class CustomerPointsFilterDto {
}
exports.CustomerPointsFilterDto = CustomerPointsFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customer ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CustomerPointsFilterDto.prototype, "CustomerId", void 0);
class RedemptionFilterDto {
}
exports.RedemptionFilterDto = RedemptionFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customer ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RedemptionFilterDto.prototype, "CustomerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RedemptionFilterDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RedemptionFilterDto.prototype, "EndDate", void 0);
