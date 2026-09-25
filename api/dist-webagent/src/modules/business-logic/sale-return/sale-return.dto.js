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
exports.RejectSaleReturnDto = exports.ApproveSaleReturnDto = exports.GetSaleItemsDto = exports.LookupSaleDto = exports.SaleReturnFilterDto = exports.CreateSaleReturnDto = exports.SaleReturnItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class SaleReturnItemDto {
}
exports.SaleReturnItemDto = SaleReturnItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SaleReturnItemDto.prototype, "ProductId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantity to return' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.001),
    __metadata("design:type", Number)
], SaleReturnItemDto.prototype, "Quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Unit ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SaleReturnItemDto.prototype, "UnitId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Unit price at return' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], SaleReturnItemDto.prototype, "UnitPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Return reason' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaleReturnItemDto.prototype, "Reason", void 0);
class CreateSaleReturnDto {
}
exports.CreateSaleReturnDto = CreateSaleReturnDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Return Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateSaleReturnDto.prototype, "Date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Original Sale ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSaleReturnDto.prototype, "SaleId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSaleReturnDto.prototype, "CustomerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSaleReturnDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Return Items', type: [SaleReturnItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SaleReturnItemDto),
    __metadata("design:type", Array)
], CreateSaleReturnDto.prototype, "Items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Return reason' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSaleReturnDto.prototype, "Reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSaleReturnDto.prototype, "Notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Return payment method (refund method)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSaleReturnDto.prototype, "RefundMethodId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is exchange (tukar barang)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSaleReturnDto.prototype, "IsExchange", void 0);
class SaleReturnFilterDto {
}
exports.SaleReturnFilterDto = SaleReturnFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customer ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SaleReturnFilterDto.prototype, "CustomerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SaleReturnFilterDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SaleReturnFilterDto.prototype, "StatusId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SaleReturnFilterDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SaleReturnFilterDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Pending approval only' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SaleReturnFilterDto.prototype, "PendingOnly", void 0);
class LookupSaleDto {
}
exports.LookupSaleDto = LookupSaleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Search keyword (sale Code or customer Name)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LookupSaleDto.prototype, "Search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customer ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LookupSaleDto.prototype, "CustomerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sales person ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LookupSaleDto.prototype, "SalesPersonId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], LookupSaleDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], LookupSaleDto.prototype, "EndDate", void 0);
class GetSaleItemsDto {
}
exports.GetSaleItemsDto = GetSaleItemsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sale ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GetSaleItemsDto.prototype, "SaleId", void 0);
class ApproveSaleReturnDto {
}
exports.ApproveSaleReturnDto = ApproveSaleReturnDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Approval Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApproveSaleReturnDto.prototype, "Notes", void 0);
class RejectSaleReturnDto {
}
exports.RejectSaleReturnDto = RejectSaleReturnDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Rejection reason' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RejectSaleReturnDto.prototype, "Reason", void 0);
