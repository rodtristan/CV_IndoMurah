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
exports.UpdateStockOpnameStatusDto = exports.UpdateStockOpnameDto = exports.CreateStockOpnameDto = exports.CreateStockOpnameItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateStockOpnameItemDto {
}
exports.CreateStockOpnameItemDto = CreateStockOpnameItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product ID' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateStockOpnameItemDto.prototype, "ProductID", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'System stock' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateStockOpnameItemDto.prototype, "SystemStock", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Counted stock' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateStockOpnameItemDto.prototype, "CountedStock", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Difference' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateStockOpnameItemDto.prototype, "Difference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unit ID' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateStockOpnameItemDto.prototype, "UnitID", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Unit price' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateStockOpnameItemDto.prototype, "UnitPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Note' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStockOpnameItemDto.prototype, "Note", void 0);
class CreateStockOpnameDto {
}
exports.CreateStockOpnameDto = CreateStockOpnameDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateStockOpnameDto.prototype, "WarehouseID", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Stock opname date', type: String }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateStockOpnameDto.prototype, "Date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStockOpnameDto.prototype, "Notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Stock opname items', type: [CreateStockOpnameItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateStockOpnameItemDto),
    __metadata("design:type", Array)
], CreateStockOpnameDto.prototype, "Items", void 0);
class UpdateStockOpnameDto {
}
exports.UpdateStockOpnameDto = UpdateStockOpnameDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateStockOpnameDto.prototype, "WarehouseID", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Stock opname date', type: String }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateStockOpnameDto.prototype, "Date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateStockOpnameDto.prototype, "Notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateStockOpnameDto.prototype, "StatusID", void 0);
class UpdateStockOpnameStatusDto {
}
exports.UpdateStockOpnameStatusDto = UpdateStockOpnameStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'New status code (e.g., DRAFT, IN_PROGRESS, COMPLETED, CANCELLED)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateStockOpnameStatusDto.prototype, "StatusCode", void 0);
