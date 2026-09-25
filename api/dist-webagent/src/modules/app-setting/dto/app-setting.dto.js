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
exports.QueryAppSettingDto = exports.AppSettingResponseDto = exports.UpdateAppSettingDto = exports.CreateAppSettingDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateAppSettingDto {
}
exports.CreateAppSettingDto = CreateAppSettingDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'reportDesignEnabled' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAppSettingDto.prototype, "reportDesignEnabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'itemAddMode' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAppSettingDto.prototype, "itemAddMode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'displayMode' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAppSettingDto.prototype, "displayMode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'displayRowMode' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAppSettingDto.prototype, "displayRowMode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'timezone' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAppSettingDto.prototype, "timezone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'maxSearchRows' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateAppSettingDto.prototype, "maxSearchRows", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'addressBinding' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAppSettingDto.prototype, "addressBinding", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'showImageOnTransaction' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAppSettingDto.prototype, "showImageOnTransaction", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'warnPriceBelowCost' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAppSettingDto.prototype, "warnPriceBelowCost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'showBrandColumn' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAppSettingDto.prototype, "showBrandColumn", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'showInfoColumn' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAppSettingDto.prototype, "showInfoColumn", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'editRequiresAccess' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAppSettingDto.prototype, "editRequiresAccess", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'autoShowSalesOnCustomer' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAppSettingDto.prototype, "autoShowSalesOnCustomer", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'decimalPrice' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateAppSettingDto.prototype, "decimalPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'decimalQty' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateAppSettingDto.prototype, "decimalQty", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'decimalTax' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateAppSettingDto.prototype, "decimalTax", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'decimalDiscount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateAppSettingDto.prototype, "decimalDiscount", void 0);
class UpdateAppSettingDto {
}
exports.UpdateAppSettingDto = UpdateAppSettingDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'reportDesignEnabled' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAppSettingDto.prototype, "reportDesignEnabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'itemAddMode' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAppSettingDto.prototype, "itemAddMode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'displayMode' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAppSettingDto.prototype, "displayMode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'displayRowMode' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAppSettingDto.prototype, "displayRowMode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'timezone' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAppSettingDto.prototype, "timezone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'maxSearchRows' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateAppSettingDto.prototype, "maxSearchRows", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'addressBinding' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAppSettingDto.prototype, "addressBinding", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'showImageOnTransaction' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAppSettingDto.prototype, "showImageOnTransaction", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'warnPriceBelowCost' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAppSettingDto.prototype, "warnPriceBelowCost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'showBrandColumn' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAppSettingDto.prototype, "showBrandColumn", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'showInfoColumn' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAppSettingDto.prototype, "showInfoColumn", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'editRequiresAccess' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAppSettingDto.prototype, "editRequiresAccess", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'autoShowSalesOnCustomer' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAppSettingDto.prototype, "autoShowSalesOnCustomer", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'decimalPrice' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateAppSettingDto.prototype, "decimalPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'decimalQty' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateAppSettingDto.prototype, "decimalQty", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'decimalTax' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateAppSettingDto.prototype, "decimalTax", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'decimalDiscount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateAppSettingDto.prototype, "decimalDiscount", void 0);
class AppSettingResponseDto {
}
exports.AppSettingResponseDto = AppSettingResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'reportDesignEnabled' }),
    __metadata("design:type", Boolean)
], AppSettingResponseDto.prototype, "reportDesignEnabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'itemAddMode' }),
    __metadata("design:type", String)
], AppSettingResponseDto.prototype, "itemAddMode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'displayMode' }),
    __metadata("design:type", String)
], AppSettingResponseDto.prototype, "displayMode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'displayRowMode' }),
    __metadata("design:type", String)
], AppSettingResponseDto.prototype, "displayRowMode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'timezone' }),
    __metadata("design:type", String)
], AppSettingResponseDto.prototype, "timezone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'maxSearchRows' }),
    __metadata("design:type", Number)
], AppSettingResponseDto.prototype, "maxSearchRows", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'addressBinding' }),
    __metadata("design:type", String)
], AppSettingResponseDto.prototype, "addressBinding", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'showImageOnTransaction' }),
    __metadata("design:type", Boolean)
], AppSettingResponseDto.prototype, "showImageOnTransaction", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'warnPriceBelowCost' }),
    __metadata("design:type", Boolean)
], AppSettingResponseDto.prototype, "warnPriceBelowCost", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'showBrandColumn' }),
    __metadata("design:type", Boolean)
], AppSettingResponseDto.prototype, "showBrandColumn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'showInfoColumn' }),
    __metadata("design:type", Boolean)
], AppSettingResponseDto.prototype, "showInfoColumn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'editRequiresAccess' }),
    __metadata("design:type", Boolean)
], AppSettingResponseDto.prototype, "editRequiresAccess", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'autoShowSalesOnCustomer' }),
    __metadata("design:type", Boolean)
], AppSettingResponseDto.prototype, "autoShowSalesOnCustomer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'decimalPrice' }),
    __metadata("design:type", Number)
], AppSettingResponseDto.prototype, "decimalPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'decimalQty' }),
    __metadata("design:type", Number)
], AppSettingResponseDto.prototype, "decimalQty", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'decimalTax' }),
    __metadata("design:type", Number)
], AppSettingResponseDto.prototype, "decimalTax", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'decimalDiscount' }),
    __metadata("design:type", Number)
], AppSettingResponseDto.prototype, "decimalDiscount", void 0);
class QueryAppSettingDto {
}
exports.QueryAppSettingDto = QueryAppSettingDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fields to select' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryAppSettingDto.prototype, "$select", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Relations to include' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryAppSettingDto.prototype, "$include", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to skip' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryAppSettingDto.prototype, "$skip", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to take' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryAppSettingDto.prototype, "$take", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryAppSettingDto.prototype, "$search", void 0);
