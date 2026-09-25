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
exports.QueryShelfProductDto = exports.ShelfProductResponseDto = exports.UpdateShelfProductDto = exports.CreateShelfProductDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateShelfProductDto {
}
exports.CreateShelfProductDto = CreateShelfProductDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'shelfId' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateShelfProductDto.prototype, "shelfId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'productId' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateShelfProductDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'quantity' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateShelfProductDto.prototype, "quantity", void 0);
class UpdateShelfProductDto {
}
exports.UpdateShelfProductDto = UpdateShelfProductDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'shelfId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateShelfProductDto.prototype, "shelfId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'productId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateShelfProductDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'quantity' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateShelfProductDto.prototype, "quantity", void 0);
class ShelfProductResponseDto {
}
exports.ShelfProductResponseDto = ShelfProductResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'shelfId' }),
    __metadata("design:type", Number)
], ShelfProductResponseDto.prototype, "shelfId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'productId' }),
    __metadata("design:type", Number)
], ShelfProductResponseDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'quantity' }),
    __metadata("design:type", Number)
], ShelfProductResponseDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'shelf' }),
    __metadata("design:type", Object)
], ShelfProductResponseDto.prototype, "shelf", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'product' }),
    __metadata("design:type", Object)
], ShelfProductResponseDto.prototype, "product", void 0);
class QueryShelfProductDto {
}
exports.QueryShelfProductDto = QueryShelfProductDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fields to select' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryShelfProductDto.prototype, "$select", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Relations to include' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryShelfProductDto.prototype, "$include", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to skip' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryShelfProductDto.prototype, "$skip", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to take' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryShelfProductDto.prototype, "$take", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryShelfProductDto.prototype, "$search", void 0);
