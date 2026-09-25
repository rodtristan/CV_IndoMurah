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
exports.CancelPurchaseReturnDto = exports.ApprovePurchaseReturnDto = exports.PurchaseReturnQueryDto = exports.UpDatePurchaseReturnDto = exports.CreatePurchaseReturnDto = exports.PurchaseReturnItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class PurchaseReturnItemDto {
}
exports.PurchaseReturnItemDto = PurchaseReturnItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Purchase item ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PurchaseReturnItemDto.prototype, "PurchaseItemId", void 0);
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
    (0, swagger_1.ApiProperty)({ description: 'Unit price at purchase time' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PurchaseReturnItemDto.prototype, "UnitPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Return reason' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PurchaseReturnItemDto.prototype, "Reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes for this item' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PurchaseReturnItemDto.prototype, "Notes", void 0);
class CreatePurchaseReturnDto {
}
exports.CreatePurchaseReturnDto = CreatePurchaseReturnDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Return Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePurchaseReturnDto.prototype, "Date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Purchase ID to return from' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseReturnDto.prototype, "PurchaseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Supplier ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseReturnDto.prototype, "SupplierId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID for returning stock' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseReturnDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Return Reference number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchaseReturnDto.prototype, "ReferenceNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Return reason' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchaseReturnDto.prototype, "Reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Created by user ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseReturnDto.prototype, "CreatedById", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Return Items', type: [PurchaseReturnItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PurchaseReturnItemDto),
    __metadata("design:type", Array)
], CreatePurchaseReturnDto.prototype, "Items", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchaseReturnDto.prototype, "Notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Refund Amount (if cash refund)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePurchaseReturnDto.prototype, "RefundAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Create credit note instead of cash refund' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchaseReturnDto.prototype, "CreditNoteNumber", void 0);
class UpDatePurchaseReturnDto {
}
exports.UpDatePurchaseReturnDto = UpDatePurchaseReturnDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Return Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpDatePurchaseReturnDto.prototype, "Date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Return reason' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpDatePurchaseReturnDto.prototype, "Reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpDatePurchaseReturnDto.prototype, "Notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status: PENDING, APPROVED, COMPLETED, CANCELLED' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpDatePurchaseReturnDto.prototype, "Status", void 0);
class PurchaseReturnQueryDto {
}
exports.PurchaseReturnQueryDto = PurchaseReturnQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PurchaseReturnQueryDto.prototype, "Search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Supplier ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PurchaseReturnQueryDto.prototype, "SupplierId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Purchase ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PurchaseReturnQueryDto.prototype, "PurchaseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PurchaseReturnQueryDto.prototype, "Status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], PurchaseReturnQueryDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], PurchaseReturnQueryDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page number', default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], PurchaseReturnQueryDto.prototype, "Page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Items per page', default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], PurchaseReturnQueryDto.prototype, "Limit", void 0);
class ApprovePurchaseReturnDto {
}
exports.ApprovePurchaseReturnDto = ApprovePurchaseReturnDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Approval Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApprovePurchaseReturnDto.prototype, "Notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Approved by user ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ApprovePurchaseReturnDto.prototype, "ApprovedById", void 0);
class CancelPurchaseReturnDto {
}
exports.CancelPurchaseReturnDto = CancelPurchaseReturnDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Cancellation reason' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CancelPurchaseReturnDto.prototype, "Reason", void 0);
