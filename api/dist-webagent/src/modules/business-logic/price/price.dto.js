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
exports.PriceAnalysisDto = exports.PriceChangeReportDto = exports.PriceHistoryFilterDto = exports.BulkUpdatePriceDto = exports.UpdatePriceItemDto = exports.UpdateProductPriceDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class UpdateProductPriceDto {
}
exports.UpdateProductPriceDto = UpdateProductPriceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'New selling price' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateProductPriceDto.prototype, "SellingPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reason for price change' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProductPriceDto.prototype, "Reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProductPriceDto.prototype, "Notes", void 0);
class UpdatePriceItemDto {
}
exports.UpdatePriceItemDto = UpdatePriceItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePriceItemDto.prototype, "ProductId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'New selling price' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdatePriceItemDto.prototype, "SellingPrice", void 0);
class BulkUpdatePriceDto {
}
exports.BulkUpdatePriceDto = BulkUpdatePriceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Price updates', type: [UpdatePriceItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => UpdatePriceItemDto),
    __metadata("design:type", Array)
], BulkUpdatePriceDto.prototype, "Updates", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reason for bulk update' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkUpdatePriceDto.prototype, "Reason", void 0);
class PriceHistoryFilterDto {
}
exports.PriceHistoryFilterDto = PriceHistoryFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Product ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PriceHistoryFilterDto.prototype, "ProductId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PriceHistoryFilterDto.prototype, "CategoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], PriceHistoryFilterDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], PriceHistoryFilterDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Type filter (PURCHASE, SELLING, DISCOUNT)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PriceHistoryFilterDto.prototype, "Type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Limit results' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], PriceHistoryFilterDto.prototype, "Limit", void 0);
class PriceChangeReportDto {
}
exports.PriceChangeReportDto = PriceChangeReportDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PriceChangeReportDto.prototype, "CategoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], PriceChangeReportDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], PriceChangeReportDto.prototype, "EndDate", void 0);
class PriceAnalysisDto {
}
exports.PriceAnalysisDto = PriceAnalysisDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Product ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PriceAnalysisDto.prototype, "ProductId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PriceAnalysisDto.prototype, "CategoryId", void 0);
