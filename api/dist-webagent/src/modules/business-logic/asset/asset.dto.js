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
exports.AssetValuationDto = exports.AssetDepreciationReportDto = exports.TransferAssetDto = exports.DisposeAssetDto = exports.CalculateDepreciationDto = exports.AssetFilterDto = exports.UpDateAssetDto = exports.CreateAssetDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateAssetDto {
}
exports.CreateAssetDto = CreateAssetDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Asset Code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "Code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Asset Name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Asset category ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateAssetDto.prototype, "CategoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Purchase Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "PurchaseDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Purchase price' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateAssetDto.prototype, "PurchasePrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Depreciation method ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateAssetDto.prototype, "DepreciationMethodId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Useful life in years' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateAssetDto.prototype, "UsefulLifeYears", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Location' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "Location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Assigned to' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "AssignedTo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Serial number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "SerialNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "Notes", void 0);
class UpDateAssetDto {
}
exports.UpDateAssetDto = UpDateAssetDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Asset Name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpDateAssetDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Asset category ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpDateAssetDto.prototype, "CategoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Useful life in years' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpDateAssetDto.prototype, "UsefulLifeYears", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Current value' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpDateAssetDto.prototype, "CurrentValue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Location' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpDateAssetDto.prototype, "Location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Assigned to' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpDateAssetDto.prototype, "AssignedTo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Serial number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpDateAssetDto.prototype, "SerialNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpDateAssetDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpDateAssetDto.prototype, "StatusId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpDateAssetDto.prototype, "Notes", void 0);
class AssetFilterDto {
}
exports.AssetFilterDto = AssetFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AssetFilterDto.prototype, "CategoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AssetFilterDto.prototype, "StatusId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Location filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AssetFilterDto.prototype, "Location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AssetFilterDto.prototype, "Search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Show active only', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AssetFilterDto.prototype, "ActiveOnly", void 0);
class CalculateDepreciationDto {
}
exports.CalculateDepreciationDto = CalculateDepreciationDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Asset ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CalculateDepreciationDto.prototype, "AssetId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'As of Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CalculateDepreciationDto.prototype, "AsOfDate", void 0);
class DisposeAssetDto {
}
exports.DisposeAssetDto = DisposeAssetDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Disposal Date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DisposeAssetDto.prototype, "Date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Disposal value/proceeds' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], DisposeAssetDto.prototype, "DisposalValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Disposal reason' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DisposeAssetDto.prototype, "Reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DisposeAssetDto.prototype, "Notes", void 0);
class TransferAssetDto {
}
exports.TransferAssetDto = TransferAssetDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'New location' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], TransferAssetDto.prototype, "NewLocation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'New assigned person' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransferAssetDto.prototype, "NewAssignedTo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Transfer Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], TransferAssetDto.prototype, "Date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransferAssetDto.prototype, "Notes", void 0);
class AssetDepreciationReportDto {
}
exports.AssetDepreciationReportDto = AssetDepreciationReportDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AssetDepreciationReportDto.prototype, "CategoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'As of Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AssetDepreciationReportDto.prototype, "AsOfDate", void 0);
class AssetValuationDto {
}
exports.AssetValuationDto = AssetValuationDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AssetValuationDto.prototype, "CategoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'As of Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AssetValuationDto.prototype, "AsOfDate", void 0);
