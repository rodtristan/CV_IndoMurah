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
exports.QueryServiceItemDto = exports.ServiceItemResponseDto = exports.UpdateServiceItemDto = exports.CreateServiceItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateServiceItemDto {
}
exports.CreateServiceItemDto = CreateServiceItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'serviceId' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateServiceItemDto.prototype, "serviceId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'productId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateServiceItemDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'productName' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateServiceItemDto.prototype, "productName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'quantity' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateServiceItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'unitPrice' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateServiceItemDto.prototype, "unitPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'subtotal' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateServiceItemDto.prototype, "subtotal", void 0);
class UpdateServiceItemDto {
}
exports.UpdateServiceItemDto = UpdateServiceItemDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'serviceId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateServiceItemDto.prototype, "serviceId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'productId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateServiceItemDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'productName' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateServiceItemDto.prototype, "productName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'quantity' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateServiceItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'unitPrice' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateServiceItemDto.prototype, "unitPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'subtotal' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateServiceItemDto.prototype, "subtotal", void 0);
class ServiceItemResponseDto {
}
exports.ServiceItemResponseDto = ServiceItemResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'serviceId' }),
    __metadata("design:type", Number)
], ServiceItemResponseDto.prototype, "serviceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'productId' }),
    __metadata("design:type", Number)
], ServiceItemResponseDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'productName' }),
    __metadata("design:type", String)
], ServiceItemResponseDto.prototype, "productName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'quantity' }),
    __metadata("design:type", Number)
], ServiceItemResponseDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'unitPrice' }),
    __metadata("design:type", Number)
], ServiceItemResponseDto.prototype, "unitPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'subtotal' }),
    __metadata("design:type", Number)
], ServiceItemResponseDto.prototype, "subtotal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'service' }),
    __metadata("design:type", Object)
], ServiceItemResponseDto.prototype, "service", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'product' }),
    __metadata("design:type", Object)
], ServiceItemResponseDto.prototype, "product", void 0);
class QueryServiceItemDto {
}
exports.QueryServiceItemDto = QueryServiceItemDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fields to select' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryServiceItemDto.prototype, "$select", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Relations to include' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryServiceItemDto.prototype, "$include", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to skip' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryServiceItemDto.prototype, "$skip", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to take' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryServiceItemDto.prototype, "$take", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryServiceItemDto.prototype, "$search", void 0);
