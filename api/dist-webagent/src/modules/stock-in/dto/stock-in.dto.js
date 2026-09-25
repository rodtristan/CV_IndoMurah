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
exports.UpdateStockInStatusDto = exports.UpdateStockInDto = exports.CreateStockInDto = exports.CreateStockInItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateStockInItemDto {
}
exports.CreateStockInItemDto = CreateStockInItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product ID' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateStockInItemDto.prototype, "ProductID", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantity' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateStockInItemDto.prototype, "Quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unit ID' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateStockInItemDto.prototype, "UnitID", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Unit price' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateStockInItemDto.prototype, "UnitPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Subtotal' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateStockInItemDto.prototype, "Subtotal", void 0);
class CreateStockInDto {
}
exports.CreateStockInDto = CreateStockInDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateStockInDto.prototype, "WarehouseID", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Supplier ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateStockInDto.prototype, "SupplierID", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference type ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateStockInDto.prototype, "ReferenceTypeID", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateStockInDto.prototype, "ReferenceID", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Stock in date', type: String }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateStockInDto.prototype, "Date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStockInDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Stock in items', type: [CreateStockInItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateStockInItemDto),
    __metadata("design:type", Array)
], CreateStockInDto.prototype, "Items", void 0);
class UpdateStockInDto {
}
exports.UpdateStockInDto = UpdateStockInDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateStockInDto.prototype, "WarehouseID", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Supplier ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateStockInDto.prototype, "SupplierID", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Stock in date', type: String }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateStockInDto.prototype, "Date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateStockInDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateStockInDto.prototype, "StatusID", void 0);
class UpdateStockInStatusDto {
}
exports.UpdateStockInStatusDto = UpdateStockInStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'New status code (e.g., DRAFT, CONFIRMED, COMPLETED, CANCELLED)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateStockInStatusDto.prototype, "StatusCode", void 0);
