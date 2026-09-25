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
exports.PurchaseOrderFilterDto = exports.CreatePurchaseOrderDto = exports.PurchaseOrderItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class PurchaseOrderItemDto {
}
exports.PurchaseOrderItemDto = PurchaseOrderItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PurchaseOrderItemDto.prototype, "ProductId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PurchaseOrderItemDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Unit ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PurchaseOrderItemDto.prototype, "UnitId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantity' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.0001),
    __metadata("design:type", Number)
], PurchaseOrderItemDto.prototype, "Quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unit price' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PurchaseOrderItemDto.prototype, "Price", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Discount percent' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PurchaseOrderItemDto.prototype, "DiscountPercent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Tax percent' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PurchaseOrderItemDto.prototype, "TaxPercent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PurchaseOrderItemDto.prototype, "Notes", void 0);
class CreatePurchaseOrderDto {
}
exports.CreatePurchaseOrderDto = CreatePurchaseOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Supplier ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseOrderDto.prototype, "SupplierId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseOrderDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Order Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePurchaseOrderDto.prototype, "OrderDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Expected delivery Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePurchaseOrderDto.prototype, "ExpectedDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Down payment Amount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePurchaseOrderDto.prototype, "DownPayment", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchaseOrderDto.prototype, "Notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Order Items', type: [PurchaseOrderItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PurchaseOrderItemDto),
    __metadata("design:type", Array)
], CreatePurchaseOrderDto.prototype, "Items", void 0);
class PurchaseOrderFilterDto {
}
exports.PurchaseOrderFilterDto = PurchaseOrderFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Supplier ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PurchaseOrderFilterDto.prototype, "SupplierId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PurchaseOrderFilterDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status filter: PENDING, APPROVED, RECEIVED, CANCELLED' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PurchaseOrderFilterDto.prototype, "Status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment status filter: UNPAID, PARTIAL, PAID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PurchaseOrderFilterDto.prototype, "PaymentStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], PurchaseOrderFilterDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], PurchaseOrderFilterDto.prototype, "EndDate", void 0);
