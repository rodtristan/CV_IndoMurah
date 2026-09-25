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
exports.UpdateShelfDto = exports.CreateShelfDto = exports.WarehouseStockDto = exports.WarehouseFilterDto = exports.UpdateWarehouseDto = exports.CreateWarehouseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateWarehouseDto {
}
exports.CreateWarehouseDto = CreateWarehouseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Warehouse Code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateWarehouseDto.prototype, "Code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Warehouse Name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateWarehouseDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse address' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWarehouseDto.prototype, "Address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Contact phone' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWarehouseDto.prototype, "Phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Set as default warehouse' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateWarehouseDto.prototype, "IsDefault", void 0);
class UpdateWarehouseDto {
}
exports.UpdateWarehouseDto = UpdateWarehouseDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse Name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateWarehouseDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse address' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateWarehouseDto.prototype, "Address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Contact phone' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateWarehouseDto.prototype, "Phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Set as default warehouse' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateWarehouseDto.prototype, "IsDefault", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateWarehouseDto.prototype, "IsActive", void 0);
class WarehouseFilterDto {
}
exports.WarehouseFilterDto = WarehouseFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WarehouseFilterDto.prototype, "Search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Include inactive' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], WarehouseFilterDto.prototype, "IncludeInactive", void 0);
class WarehouseStockDto {
}
exports.WarehouseStockDto = WarehouseStockDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Product ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WarehouseStockDto.prototype, "ProductId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WarehouseStockDto.prototype, "CategoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Show only low stock' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], WarehouseStockDto.prototype, "LowStockOnly", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], WarehouseStockDto.prototype, "Page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page size' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], WarehouseStockDto.prototype, "Limit", void 0);
class CreateShelfDto {
}
exports.CreateShelfDto = CreateShelfDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateShelfDto.prototype, "WarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Shelf Code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateShelfDto.prototype, "Code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Shelf Name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateShelfDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShelfDto.prototype, "Description", void 0);
class UpdateShelfDto {
}
exports.UpdateShelfDto = UpdateShelfDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Shelf Name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateShelfDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateShelfDto.prototype, "Description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateShelfDto.prototype, "IsActive", void 0);
