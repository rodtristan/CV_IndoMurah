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
exports.QueryDailySalesSummaryDto = exports.DailySalesSummaryResponseDto = exports.UpdateDailySalesSummaryDto = exports.CreateDailySalesSummaryDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateDailySalesSummaryDto {
}
exports.CreateDailySalesSummaryDto = CreateDailySalesSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'date', type: String, format: 'date-time' }),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateDailySalesSummaryDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'totalTransactions' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateDailySalesSummaryDto.prototype, "totalTransactions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'totalCost' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateDailySalesSummaryDto.prototype, "totalCost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'totalSales' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateDailySalesSummaryDto.prototype, "totalSales", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'totalProfit' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateDailySalesSummaryDto.prototype, "totalProfit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'totalReturns' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateDailySalesSummaryDto.prototype, "totalReturns", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'totalExpenses' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateDailySalesSummaryDto.prototype, "totalExpenses", void 0);
class UpdateDailySalesSummaryDto {
}
exports.UpdateDailySalesSummaryDto = UpdateDailySalesSummaryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'date', type: String, format: 'date-time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], UpdateDailySalesSummaryDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'totalTransactions' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateDailySalesSummaryDto.prototype, "totalTransactions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'totalCost' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateDailySalesSummaryDto.prototype, "totalCost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'totalSales' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateDailySalesSummaryDto.prototype, "totalSales", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'totalProfit' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateDailySalesSummaryDto.prototype, "totalProfit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'totalReturns' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateDailySalesSummaryDto.prototype, "totalReturns", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'totalExpenses' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateDailySalesSummaryDto.prototype, "totalExpenses", void 0);
class DailySalesSummaryResponseDto {
}
exports.DailySalesSummaryResponseDto = DailySalesSummaryResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'date' }),
    __metadata("design:type", Date)
], DailySalesSummaryResponseDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'totalTransactions' }),
    __metadata("design:type", Number)
], DailySalesSummaryResponseDto.prototype, "totalTransactions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'totalCost' }),
    __metadata("design:type", Number)
], DailySalesSummaryResponseDto.prototype, "totalCost", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'totalSales' }),
    __metadata("design:type", Number)
], DailySalesSummaryResponseDto.prototype, "totalSales", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'totalProfit' }),
    __metadata("design:type", Number)
], DailySalesSummaryResponseDto.prototype, "totalProfit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'totalReturns' }),
    __metadata("design:type", Number)
], DailySalesSummaryResponseDto.prototype, "totalReturns", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'totalExpenses' }),
    __metadata("design:type", Number)
], DailySalesSummaryResponseDto.prototype, "totalExpenses", void 0);
class QueryDailySalesSummaryDto {
}
exports.QueryDailySalesSummaryDto = QueryDailySalesSummaryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fields to select' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryDailySalesSummaryDto.prototype, "$select", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Relations to include' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryDailySalesSummaryDto.prototype, "$include", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to skip' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryDailySalesSummaryDto.prototype, "$skip", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to take' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryDailySalesSummaryDto.prototype, "$take", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryDailySalesSummaryDto.prototype, "$search", void 0);
