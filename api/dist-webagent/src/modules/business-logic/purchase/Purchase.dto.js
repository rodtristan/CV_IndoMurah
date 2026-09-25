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
exports.PurchaseFilterDto = exports.PurchaseOrderFilterDto = exports.AddSupplierDepositDto = exports.SupplierDebtSummaryDto = exports.CreatePurchaseReturnDto = exports.PurchaseReturnItemDto = exports.RecordBulkPurchasePaymentDto = exports.RecordPurchasePaymentDto = exports.CreatePurchaseDto = exports.PurchaseReceiveItemDto = exports.UpdatePurchaseOrderDto = exports.CreatePurchaseOrderDto = exports.PurchaseOrderItemDto = void 0;
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
    (0, swagger_1.ApiProperty)({ description: 'Quantity to order' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.001),
    __metadata("design:type", Number)
], PurchaseOrderItemDto.prototype, "Quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unit ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PurchaseOrderItemDto.prototype, "UnitId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Expected unit price' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PurchaseOrderItemDto.prototype, "UnitPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Discount percent per item' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PurchaseOrderItemDto.prototype, "DiscountPercent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes for this item' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PurchaseOrderItemDto.prototype, "Notes", void 0);
class CreatePurchaseOrderDto {
}
exports.CreatePurchaseOrderDto = CreatePurchaseOrderDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Purchase order Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePurchaseOrderDto.prototype, "Date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Supplier ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseOrderDto.prototype, "SupplierId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID for receiving' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseOrderDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Expected delivery Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePurchaseOrderDto.prototype, "DueDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Down payment Amount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePurchaseOrderDto.prototype, "DownPayment", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Order Items', type: [PurchaseOrderItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PurchaseOrderItemDto),
    __metadata("design:type", Array)
], CreatePurchaseOrderDto.prototype, "Items", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Discount percent for whole order' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePurchaseOrderDto.prototype, "DiscountPercent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Tax percent' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePurchaseOrderDto.prototype, "TaxPercent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Order Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchaseOrderDto.prototype, "Notes", void 0);
class UpdatePurchaseOrderDto {
}
exports.UpdatePurchaseOrderDto = UpdatePurchaseOrderDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Expected delivery Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdatePurchaseOrderDto.prototype, "DueDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Down payment Amount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdatePurchaseOrderDto.prototype, "DownPayment", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Discount percent' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdatePurchaseOrderDto.prototype, "DiscountPercent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Order Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePurchaseOrderDto.prototype, "Notes", void 0);
class PurchaseReceiveItemDto {
}
exports.PurchaseReceiveItemDto = PurchaseReceiveItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PurchaseReceiveItemDto.prototype, "ProductId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Received Quantity' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.001),
    __metadata("design:type", Number)
], PurchaseReceiveItemDto.prototype, "Quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unit ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PurchaseReceiveItemDto.prototype, "UnitId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unit price' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PurchaseReceiveItemDto.prototype, "UnitPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Discount percent' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PurchaseReceiveItemDto.prototype, "DiscountPercent", void 0);
class CreatePurchaseDto {
}
exports.CreatePurchaseDto = CreatePurchaseDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Purchase Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePurchaseDto.prototype, "Date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Supplier ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseDto.prototype, "SupplierId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Purchase order ID (if from PO)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseDto.prototype, "PurchaseOrderId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Received Items', type: [PurchaseReceiveItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PurchaseReceiveItemDto),
    __metadata("design:type", Array)
], CreatePurchaseDto.prototype, "Items", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment method ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseDto.prototype, "PaymentMethodId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment Amount (for partial payment)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePurchaseDto.prototype, "PaymentAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Due Date for credit payment' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePurchaseDto.prototype, "DueDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Discount percent for whole purchase' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePurchaseDto.prototype, "DiscountPercent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Tax percent' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePurchaseDto.prototype, "TaxPercent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Purchase Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchaseDto.prototype, "Notes", void 0);
class RecordPurchasePaymentDto {
}
exports.RecordPurchasePaymentDto = RecordPurchasePaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment Amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], RecordPurchasePaymentDto.prototype, "Amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment method ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecordPurchasePaymentDto.prototype, "PaymentMethodId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference number (e.g., transfer slip)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordPurchasePaymentDto.prototype, "ReferenceNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], RecordPurchasePaymentDto.prototype, "PaymentDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordPurchasePaymentDto.prototype, "Notes", void 0);
class RecordBulkPurchasePaymentDto {
}
exports.RecordBulkPurchasePaymentDto = RecordBulkPurchasePaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Supplier ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecordBulkPurchasePaymentDto.prototype, "SupplierId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total payment Amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], RecordBulkPurchasePaymentDto.prototype, "Amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment method ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecordBulkPurchasePaymentDto.prototype, "PaymentMethodId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Purchase IDs to pay' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    __metadata("design:type", Array)
], RecordBulkPurchasePaymentDto.prototype, "PurchaseIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordBulkPurchasePaymentDto.prototype, "ReferenceNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordBulkPurchasePaymentDto.prototype, "Notes", void 0);
class PurchaseReturnItemDto {
}
exports.PurchaseReturnItemDto = PurchaseReturnItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PurchaseReturnItemDto.prototype, "ProductId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Return Quantity' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.001),
    __metadata("design:type", Number)
], PurchaseReturnItemDto.prototype, "Quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unit ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PurchaseReturnItemDto.prototype, "UnitId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Unit price' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PurchaseReturnItemDto.prototype, "UnitPrice", void 0);
class CreatePurchaseReturnDto {
}
exports.CreatePurchaseReturnDto = CreatePurchaseReturnDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Purchase ID to return from' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseReturnDto.prototype, "PurchaseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Return Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePurchaseReturnDto.prototype, "Date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseReturnDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Return Items', type: [PurchaseReturnItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PurchaseReturnItemDto),
    __metadata("design:type", Array)
], CreatePurchaseReturnDto.prototype, "Items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Return reason' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePurchaseReturnDto.prototype, "Reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchaseReturnDto.prototype, "Notes", void 0);
class SupplierDebtSummaryDto {
}
exports.SupplierDebtSummaryDto = SupplierDebtSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Supplier ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SupplierDebtSummaryDto.prototype, "SupplierId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SupplierDebtSummaryDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SupplierDebtSummaryDto.prototype, "EndDate", void 0);
class AddSupplierDepositDto {
}
exports.AddSupplierDepositDto = AddSupplierDepositDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Deposit Amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], AddSupplierDepositDto.prototype, "Amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Deposit Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddSupplierDepositDto.prototype, "Notes", void 0);
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
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PurchaseOrderFilterDto.prototype, "StatusId", void 0);
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
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Only pending orders' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PurchaseOrderFilterDto.prototype, "PendingOnly", void 0);
class PurchaseFilterDto {
}
exports.PurchaseFilterDto = PurchaseFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Supplier ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PurchaseFilterDto.prototype, "SupplierId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PurchaseFilterDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment status filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PurchaseFilterDto.prototype, "PaymentStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], PurchaseFilterDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], PurchaseFilterDto.prototype, "EndDate", void 0);
