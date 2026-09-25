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
exports.QueryAssetDto = exports.AssetResponseDto = exports.UpdateAssetDto = exports.CreateAssetDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateAssetDto {
}
exports.CreateAssetDto = CreateAssetDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'code' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'assetCategoryId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateAssetDto.prototype, "assetCategoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'purchaseDate', type: String, format: 'date-time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateAssetDto.prototype, "purchaseDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'purchasePrice' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateAssetDto.prototype, "purchasePrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'currentValue' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateAssetDto.prototype, "currentValue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'DepreciationMethod ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateAssetDto.prototype, "depreciationMethodId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'usefulLifeYears' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateAssetDto.prototype, "usefulLifeYears", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'location' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'assignedTo' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "assignedTo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'serialNumber' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "serialNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'AssetStatus ID (default 1)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateAssetDto.prototype, "statusId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'isActive' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAssetDto.prototype, "isActive", void 0);
class UpdateAssetDto {
}
exports.UpdateAssetDto = UpdateAssetDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'code' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAssetDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAssetDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'assetCategoryId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateAssetDto.prototype, "assetCategoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'purchaseDate', type: String, format: 'date-time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], UpdateAssetDto.prototype, "purchaseDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'purchasePrice' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateAssetDto.prototype, "purchasePrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'currentValue' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateAssetDto.prototype, "currentValue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'DepreciationMethod ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateAssetDto.prototype, "depreciationMethodId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'usefulLifeYears' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateAssetDto.prototype, "usefulLifeYears", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'location' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAssetDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'assignedTo' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAssetDto.prototype, "assignedTo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'serialNumber' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAssetDto.prototype, "serialNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAssetDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'AssetStatus ID (default 1)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateAssetDto.prototype, "statusId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'isActive' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAssetDto.prototype, "isActive", void 0);
class AssetResponseDto {
}
exports.AssetResponseDto = AssetResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'code' }),
    __metadata("design:type", String)
], AssetResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'name' }),
    __metadata("design:type", String)
], AssetResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'assetCategoryId' }),
    __metadata("design:type", Number)
], AssetResponseDto.prototype, "assetCategoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'purchaseDate' }),
    __metadata("design:type", Date)
], AssetResponseDto.prototype, "purchaseDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'purchasePrice' }),
    __metadata("design:type", Number)
], AssetResponseDto.prototype, "purchasePrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'currentValue' }),
    __metadata("design:type", Number)
], AssetResponseDto.prototype, "currentValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'depreciationMethod' }),
    __metadata("design:type", Object)
], AssetResponseDto.prototype, "depreciationMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'usefulLifeYears' }),
    __metadata("design:type", Number)
], AssetResponseDto.prototype, "usefulLifeYears", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'location' }),
    __metadata("design:type", String)
], AssetResponseDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'assignedTo' }),
    __metadata("design:type", String)
], AssetResponseDto.prototype, "assignedTo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'serialNumber' }),
    __metadata("design:type", String)
], AssetResponseDto.prototype, "serialNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'description' }),
    __metadata("design:type", String)
], AssetResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'status' }),
    __metadata("design:type", Object)
], AssetResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'isActive' }),
    __metadata("design:type", Boolean)
], AssetResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'category' }),
    __metadata("design:type", Object)
], AssetResponseDto.prototype, "category", void 0);
class QueryAssetDto {
}
exports.QueryAssetDto = QueryAssetDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fields to select' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryAssetDto.prototype, "$select", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Relations to include' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryAssetDto.prototype, "$include", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to skip' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryAssetDto.prototype, "$skip", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to take' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryAssetDto.prototype, "$take", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryAssetDto.prototype, "$search", void 0);
