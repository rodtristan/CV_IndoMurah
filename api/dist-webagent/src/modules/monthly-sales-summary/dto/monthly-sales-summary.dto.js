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
exports.QueryMonthlySalesSummaryDto = exports.MonthlySalesSummaryResponseDto = exports.UpdateMonthlySalesSummaryDto = exports.CreateMonthlySalesSummaryDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateMonthlySalesSummaryDto {
}
exports.CreateMonthlySalesSummaryDto = CreateMonthlySalesSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'year' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateMonthlySalesSummaryDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'month' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateMonthlySalesSummaryDto.prototype, "month", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'totalTransactions' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateMonthlySalesSummaryDto.prototype, "totalTransactions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'totalCost' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateMonthlySalesSummaryDto.prototype, "totalCost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'totalSales' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateMonthlySalesSummaryDto.prototype, "totalSales", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'totalProfit' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateMonthlySalesSummaryDto.prototype, "totalProfit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'totalReturns' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateMonthlySalesSummaryDto.prototype, "totalReturns", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'totalExpenses' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateMonthlySalesSummaryDto.prototype, "totalExpenses", void 0);
class UpdateMonthlySalesSummaryDto {
}
exports.UpdateMonthlySalesSummaryDto = UpdateMonthlySalesSummaryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'year' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateMonthlySalesSummaryDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'month' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateMonthlySalesSummaryDto.prototype, "month", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'totalTransactions' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateMonthlySalesSummaryDto.prototype, "totalTransactions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'totalCost' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateMonthlySalesSummaryDto.prototype, "totalCost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'totalSales' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateMonthlySalesSummaryDto.prototype, "totalSales", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'totalProfit' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateMonthlySalesSummaryDto.prototype, "totalProfit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'totalReturns' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateMonthlySalesSummaryDto.prototype, "totalReturns", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'totalExpenses' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateMonthlySalesSummaryDto.prototype, "totalExpenses", void 0);
class MonthlySalesSummaryResponseDto {
}
exports.MonthlySalesSummaryResponseDto = MonthlySalesSummaryResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'year' }),
    __metadata("design:type", Number)
], MonthlySalesSummaryResponseDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'month' }),
    __metadata("design:type", Number)
], MonthlySalesSummaryResponseDto.prototype, "month", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'totalTransactions' }),
    __metadata("design:type", Number)
], MonthlySalesSummaryResponseDto.prototype, "totalTransactions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'totalCost' }),
    __metadata("design:type", Number)
], MonthlySalesSummaryResponseDto.prototype, "totalCost", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'totalSales' }),
    __metadata("design:type", Number)
], MonthlySalesSummaryResponseDto.prototype, "totalSales", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'totalProfit' }),
    __metadata("design:type", Number)
], MonthlySalesSummaryResponseDto.prototype, "totalProfit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'totalReturns' }),
    __metadata("design:type", Number)
], MonthlySalesSummaryResponseDto.prototype, "totalReturns", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'totalExpenses' }),
    __metadata("design:type", Number)
], MonthlySalesSummaryResponseDto.prototype, "totalExpenses", void 0);
class QueryMonthlySalesSummaryDto {
}
exports.QueryMonthlySalesSummaryDto = QueryMonthlySalesSummaryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fields to select' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryMonthlySalesSummaryDto.prototype, "$select", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Relations to include' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryMonthlySalesSummaryDto.prototype, "$include", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to skip' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryMonthlySalesSummaryDto.prototype, "$skip", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to take' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryMonthlySalesSummaryDto.prototype, "$take", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryMonthlySalesSummaryDto.prototype, "$search", void 0);
