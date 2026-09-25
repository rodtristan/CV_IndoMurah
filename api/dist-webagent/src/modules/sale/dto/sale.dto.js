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
exports.UpdateShippingDto = exports.UpdateStatusDto = exports.PaymentDto = exports.UpdateSaleDto = exports.CreateSaleDto = exports.CreateSaleItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateSaleItemDto {
}
exports.CreateSaleItemDto = CreateSaleItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product ID' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateSaleItemDto.prototype, "ProductID", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantity' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSaleItemDto.prototype, "Quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Unit ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateSaleItemDto.prototype, "UnitID", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unit price' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSaleItemDto.prototype, "UnitPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Discount percent' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSaleItemDto.prototype, "DiscountPercent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Discount amount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSaleItemDto.prototype, "DiscountAmount", void 0);
class CreateSaleDto {
}
exports.CreateSaleDto = CreateSaleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer ID' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateSaleDto.prototype, "CustomerID", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sales person ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateSaleDto.prototype, "SalesPersonID", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sale point ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateSaleDto.prototype, "SalePointID", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateSaleDto.prototype, "WarehouseID", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sale date', type: String }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSaleDto.prototype, "Date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Due date for credit sales', type: String }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSaleDto.prototype, "DueDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Discount percent' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSaleDto.prototype, "DiscountPercent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Discount amount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSaleDto.prototype, "DiscountAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Tax percent' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSaleDto.prototype, "TaxPercent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment method ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateSaleDto.prototype, "PaymentMethodID", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Cash amount received (for cash payments)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSaleDto.prototype, "CashAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Voucher ID (divalidasi: aktif, periode, kuota, minimal belanja)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateSaleDto.prototype, "VoucherID", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Kode voucher (alternatif VoucherID)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSaleDto.prototype, "VoucherCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Alias camelCase untuk PaymentMethodID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateSaleDto.prototype, "paymentMethodId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Alias camelCase untuk WarehouseID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateSaleDto.prototype, "warehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSaleDto.prototype, "Notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sale items', type: [CreateSaleItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateSaleItemDto),
    __metadata("design:type", Array)
], CreateSaleDto.prototype, "Items", void 0);
class UpdateSaleDto {
}
exports.UpdateSaleDto = UpdateSaleDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customer ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateSaleDto.prototype, "CustomerID", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sales person ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateSaleDto.prototype, "SalesPersonID", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sale point ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateSaleDto.prototype, "SalePointID", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateSaleDto.prototype, "WarehouseID", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sale date', type: String }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSaleDto.prototype, "Date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Due date', type: String }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSaleDto.prototype, "DueDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Discount percent' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateSaleDto.prototype, "DiscountPercent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Discount amount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateSaleDto.prototype, "DiscountAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Tax percent' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateSaleDto.prototype, "TaxPercent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment method ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateSaleDto.prototype, "PaymentMethodID", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSaleDto.prototype, "Notes", void 0);
class PaymentDto {
}
exports.PaymentDto = PaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment amount' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PaymentDto.prototype, "Amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment method ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], PaymentDto.prototype, "PaymentMethodID", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaymentDto.prototype, "ReferenceNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaymentDto.prototype, "Notes", void 0);
class UpdateStatusDto {
}
exports.UpdateStatusDto = UpdateStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment status code (e.g., PENDING, PARTIAL, PAID, CANCELLED)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateStatusDto.prototype, "PaymentStatusCode", void 0);
class UpdateShippingDto {
}
exports.UpdateShippingDto = UpdateShippingDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Shipping status', enum: ['PENDING', 'SHIPPED'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateShippingDto.prototype, "ShippingStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Shipping date', type: String }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateShippingDto.prototype, "ShippingDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Tracking / resi number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateShippingDto.prototype, "TrackingNumber", void 0);
