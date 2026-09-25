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
exports.UpdatePurchaseReturnStatusDto = exports.UpdatePurchaseReturnDto = exports.CreatePurchaseReturnDto = exports.CreatePurchaseReturnItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreatePurchaseReturnItemDto {
}
exports.CreatePurchaseReturnItemDto = CreatePurchaseReturnItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product ID' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePurchaseReturnItemDto.prototype, "ProductID", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantity to return' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseReturnItemDto.prototype, "Quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unit ID' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePurchaseReturnItemDto.prototype, "UnitID", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unit price' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePurchaseReturnItemDto.prototype, "UnitPrice", void 0);
class CreatePurchaseReturnDto {
}
exports.CreatePurchaseReturnDto = CreatePurchaseReturnDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Purchase ID' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePurchaseReturnDto.prototype, "PurchaseID", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Supplier ID (auto-filled from purchase)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePurchaseReturnDto.prototype, "SupplierID", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePurchaseReturnDto.prototype, "WarehouseID", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Return date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePurchaseReturnDto.prototype, "Date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Return reason' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchaseReturnDto.prototype, "Reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Return items', type: [CreatePurchaseReturnItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreatePurchaseReturnItemDto),
    __metadata("design:type", Array)
], CreatePurchaseReturnDto.prototype, "Items", void 0);
class UpdatePurchaseReturnDto {
}
exports.UpdatePurchaseReturnDto = UpdatePurchaseReturnDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdatePurchaseReturnDto.prototype, "WarehouseID", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Return date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdatePurchaseReturnDto.prototype, "Date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Return reason' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePurchaseReturnDto.prototype, "Reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdatePurchaseReturnDto.prototype, "StatusID", void 0);
class UpdatePurchaseReturnStatusDto {
}
exports.UpdatePurchaseReturnStatusDto = UpdatePurchaseReturnStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'New status code: DRAFT, CONFIRMED, COMPLETED, CANCELLED' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePurchaseReturnStatusDto.prototype, "StatusCode", void 0);
