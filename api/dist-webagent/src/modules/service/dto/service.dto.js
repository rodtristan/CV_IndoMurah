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
exports.QueryServiceDto = exports.ServiceResponseDto = exports.UpdateServiceDto = exports.CreateServiceDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateServiceDto {
}
exports.CreateServiceDto = CreateServiceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'code' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateServiceDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'date', type: String, format: 'date-time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateServiceDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'customerId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateServiceDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'customerName' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateServiceDto.prototype, "customerName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'customerPhone' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateServiceDto.prototype, "customerPhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'customerAddress' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateServiceDto.prototype, "customerAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'productName' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateServiceDto.prototype, "productName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'serialNumber' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateServiceDto.prototype, "serialNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'problem' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateServiceDto.prototype, "problem", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'diagnosis' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateServiceDto.prototype, "diagnosis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Repair status ID (defaults to the initial status)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateServiceDto.prototype, "repairStatusId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'technician' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateServiceDto.prototype, "technician", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'warrantyUntil', type: String, format: 'date-time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateServiceDto.prototype, "warrantyUntil", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'subtotal' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateServiceDto.prototype, "subtotal", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'laborCost' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateServiceDto.prototype, "laborCost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'totalAmount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateServiceDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateServiceDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'isActive' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateServiceDto.prototype, "isActive", void 0);
class UpdateServiceDto {
}
exports.UpdateServiceDto = UpdateServiceDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'code' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateServiceDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'date', type: String, format: 'date-time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], UpdateServiceDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'customerId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateServiceDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'customerName' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateServiceDto.prototype, "customerName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'customerPhone' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateServiceDto.prototype, "customerPhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'customerAddress' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateServiceDto.prototype, "customerAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'productName' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateServiceDto.prototype, "productName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'serialNumber' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateServiceDto.prototype, "serialNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'problem' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateServiceDto.prototype, "problem", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'diagnosis' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateServiceDto.prototype, "diagnosis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Repair status ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateServiceDto.prototype, "repairStatusId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'technician' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateServiceDto.prototype, "technician", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'warrantyUntil', type: String, format: 'date-time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], UpdateServiceDto.prototype, "warrantyUntil", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'subtotal' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateServiceDto.prototype, "subtotal", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'laborCost' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateServiceDto.prototype, "laborCost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'totalAmount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateServiceDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateServiceDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'isActive' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateServiceDto.prototype, "isActive", void 0);
class ServiceResponseDto {
}
exports.ServiceResponseDto = ServiceResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'code' }),
    __metadata("design:type", String)
], ServiceResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'date' }),
    __metadata("design:type", Date)
], ServiceResponseDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'customerId' }),
    __metadata("design:type", Number)
], ServiceResponseDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'customerName' }),
    __metadata("design:type", String)
], ServiceResponseDto.prototype, "customerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'customerPhone' }),
    __metadata("design:type", String)
], ServiceResponseDto.prototype, "customerPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'customerAddress' }),
    __metadata("design:type", String)
], ServiceResponseDto.prototype, "customerAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'productName' }),
    __metadata("design:type", String)
], ServiceResponseDto.prototype, "productName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'serialNumber' }),
    __metadata("design:type", String)
], ServiceResponseDto.prototype, "serialNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'problem' }),
    __metadata("design:type", String)
], ServiceResponseDto.prototype, "problem", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'diagnosis' }),
    __metadata("design:type", String)
], ServiceResponseDto.prototype, "diagnosis", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Repair status ID' }),
    __metadata("design:type", Number)
], ServiceResponseDto.prototype, "repairStatusId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'technician' }),
    __metadata("design:type", String)
], ServiceResponseDto.prototype, "technician", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'warrantyUntil' }),
    __metadata("design:type", Date)
], ServiceResponseDto.prototype, "warrantyUntil", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'subtotal' }),
    __metadata("design:type", Number)
], ServiceResponseDto.prototype, "subtotal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'laborCost' }),
    __metadata("design:type", Number)
], ServiceResponseDto.prototype, "laborCost", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'totalAmount' }),
    __metadata("design:type", Number)
], ServiceResponseDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'notes' }),
    __metadata("design:type", String)
], ServiceResponseDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'isActive' }),
    __metadata("design:type", Boolean)
], ServiceResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'customer' }),
    __metadata("design:type", Object)
], ServiceResponseDto.prototype, "customer", void 0);
class QueryServiceDto {
}
exports.QueryServiceDto = QueryServiceDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fields to select' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryServiceDto.prototype, "$select", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Relations to include' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryServiceDto.prototype, "$include", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to skip' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryServiceDto.prototype, "$skip", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to take' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryServiceDto.prototype, "$take", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryServiceDto.prototype, "$search", void 0);
