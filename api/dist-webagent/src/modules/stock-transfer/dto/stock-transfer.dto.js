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
exports.UpdateStockTransferStatusDto = exports.UpdateStockTransferDto = exports.CreateStockTransferDto = exports.CreateStockTransferItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateStockTransferItemDto {
}
exports.CreateStockTransferItemDto = CreateStockTransferItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product ID' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateStockTransferItemDto.prototype, "ProductID", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantity' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateStockTransferItemDto.prototype, "Quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unit ID' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateStockTransferItemDto.prototype, "UnitID", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Unit price' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateStockTransferItemDto.prototype, "UnitPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Subtotal' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateStockTransferItemDto.prototype, "Subtotal", void 0);
class CreateStockTransferDto {
}
exports.CreateStockTransferDto = CreateStockTransferDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'From warehouse ID' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateStockTransferDto.prototype, "FromWarehouseID", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'To warehouse ID' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateStockTransferDto.prototype, "ToWarehouseID", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Transfer date', type: String }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateStockTransferDto.prototype, "Date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStockTransferDto.prototype, "Notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transfer items', type: [CreateStockTransferItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateStockTransferItemDto),
    __metadata("design:type", Array)
], CreateStockTransferDto.prototype, "Items", void 0);
class UpdateStockTransferDto {
}
exports.UpdateStockTransferDto = UpdateStockTransferDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'From warehouse ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateStockTransferDto.prototype, "FromWarehouseID", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'To warehouse ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateStockTransferDto.prototype, "ToWarehouseID", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Transfer date', type: String }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateStockTransferDto.prototype, "Date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateStockTransferDto.prototype, "Notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateStockTransferDto.prototype, "StatusID", void 0);
class UpdateStockTransferStatusDto {
}
exports.UpdateStockTransferStatusDto = UpdateStockTransferStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'New status code (e.g., DRAFT, CONFIRMED, COMPLETED, CANCELLED)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateStockTransferStatusDto.prototype, "StatusCode", void 0);
