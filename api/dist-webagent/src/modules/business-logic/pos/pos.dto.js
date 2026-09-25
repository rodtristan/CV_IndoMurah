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
exports.ResumeTransactionDto = exports.HoldTransactionDto = exports.ApplyVoucherDto = exports.UpdateCartItemDto = exports.OpenTransactionDto = exports.QuickPriceCheckDto = exports.ProductSearchDto = exports.BarcodeSearchDto = exports.CreatePOSTransactionDto = exports.POSItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class POSItemDto {
}
exports.POSItemDto = POSItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], POSItemDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantity' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.001),
    __metadata("design:type", Number)
], POSItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unit ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], POSItemDto.prototype, "unitId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unit price at sale time' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], POSItemDto.prototype, "unitPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Discount percent per item' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], POSItemDto.prototype, "discountPercent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Discount amount per item' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], POSItemDto.prototype, "discountAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes for this item' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], POSItemDto.prototype, "notes", void 0);
class CreatePOSTransactionDto {
}
exports.CreatePOSTransactionDto = CreatePOSTransactionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePOSTransactionDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePOSTransactionDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sales person ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePOSTransactionDto.prototype, "salesPersonId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sale point ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePOSTransactionDto.prototype, "salePointId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePOSTransactionDto.prototype, "warehouseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment method ID', type: Number }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePOSTransactionDto.prototype, "paymentMethodId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction items', type: [POSItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => POSItemDto),
    __metadata("design:type", Array)
], CreatePOSTransactionDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Discount percent for whole transaction' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePOSTransactionDto.prototype, "discountPercent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Discount amount for whole transaction' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePOSTransactionDto.prototype, "discountAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Tax percent' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePOSTransactionDto.prototype, "taxPercent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Cash amount received from customer' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePOSTransactionDto.prototype, "cashAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference number (for non-cash payments)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePOSTransactionDto.prototype, "referenceNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Transaction notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePOSTransactionDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Use customer deposit' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePOSTransactionDto.prototype, "useCustomerDeposit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Voucher code to apply' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePOSTransactionDto.prototype, "voucherCode", void 0);
class BarcodeSearchDto {
}
exports.BarcodeSearchDto = BarcodeSearchDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Barcode value to search' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BarcodeSearchDto.prototype, "barcode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID for stock check' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BarcodeSearchDto.prototype, "warehouseId", void 0);
class ProductSearchDto {
}
exports.ProductSearchDto = ProductSearchDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword (name, code, barcode)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductSearchDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProductSearchDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Brand ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProductSearchDto.prototype, "brandId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID for stock check' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProductSearchDto.prototype, "warehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Only show products with stock > 0' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ProductSearchDto.prototype, "inStockOnly", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Limit results' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ProductSearchDto.prototype, "limit", void 0);
class QuickPriceCheckDto {
}
exports.QuickPriceCheckDto = QuickPriceCheckDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], QuickPriceCheckDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer ID for price group check' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], QuickPriceCheckDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantity' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QuickPriceCheckDto.prototype, "quantity", void 0);
class OpenTransactionDto {
}
exports.OpenTransactionDto = OpenTransactionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], OpenTransactionDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sale point ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], OpenTransactionDto.prototype, "salePointId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], OpenTransactionDto.prototype, "warehouseId", void 0);
class UpdateCartItemDto {
}
exports.UpdateCartItemDto = UpdateCartItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'New quantity' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateCartItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'New unit price override' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateCartItemDto.prototype, "unitPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Discount percent' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateCartItemDto.prototype, "discountPercent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Discount amount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateCartItemDto.prototype, "discountAmount", void 0);
class ApplyVoucherDto {
}
exports.ApplyVoucherDto = ApplyVoucherDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Voucher code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ApplyVoucherDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction subtotal before voucher' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ApplyVoucherDto.prototype, "subtotal", void 0);
class HoldTransactionDto {
}
exports.HoldTransactionDto = HoldTransactionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Hold reference number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], HoldTransactionDto.prototype, "holdNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer name for held transaction' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HoldTransactionDto.prototype, "customerName", void 0);
class ResumeTransactionDto {
}
exports.ResumeTransactionDto = ResumeTransactionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Hold reference number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ResumeTransactionDto.prototype, "holdNumber", void 0);
