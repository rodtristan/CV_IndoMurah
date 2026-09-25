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
exports.QueryTransferDto = exports.TransferResponseDto = exports.UpdateTransferDto = exports.CreateTransferDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateTransferDto {
}
exports.CreateTransferDto = CreateTransferDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'code' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'date', type: String, format: 'date-time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateTransferDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'fromAccountId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTransferDto.prototype, "fromAccountId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'toAccountId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTransferDto.prototype, "toAccountId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'fromWarehouseId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTransferDto.prototype, "fromWarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'toWarehouseId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTransferDto.prototype, "toWarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'amount' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTransferDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'TransactionStatus ID (default 1)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateTransferDto.prototype, "statusId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'isActive' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateTransferDto.prototype, "isActive", void 0);
class UpdateTransferDto {
}
exports.UpdateTransferDto = UpdateTransferDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'code' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTransferDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'date', type: String, format: 'date-time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], UpdateTransferDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'fromAccountId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateTransferDto.prototype, "fromAccountId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'toAccountId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateTransferDto.prototype, "toAccountId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'fromWarehouseId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateTransferDto.prototype, "fromWarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'toWarehouseId' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateTransferDto.prototype, "toWarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'amount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateTransferDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTransferDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'TransactionStatus ID (default 1)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateTransferDto.prototype, "statusId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTransferDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'isActive' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateTransferDto.prototype, "isActive", void 0);
class TransferResponseDto {
}
exports.TransferResponseDto = TransferResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'code' }),
    __metadata("design:type", String)
], TransferResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'date' }),
    __metadata("design:type", Date)
], TransferResponseDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'fromAccountId' }),
    __metadata("design:type", Number)
], TransferResponseDto.prototype, "fromAccountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'toAccountId' }),
    __metadata("design:type", Number)
], TransferResponseDto.prototype, "toAccountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'fromWarehouseId' }),
    __metadata("design:type", Number)
], TransferResponseDto.prototype, "fromWarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'toWarehouseId' }),
    __metadata("design:type", Number)
], TransferResponseDto.prototype, "toWarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'amount' }),
    __metadata("design:type", Number)
], TransferResponseDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'description' }),
    __metadata("design:type", String)
], TransferResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'status' }),
    __metadata("design:type", Object)
], TransferResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'notes' }),
    __metadata("design:type", String)
], TransferResponseDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'isActive' }),
    __metadata("design:type", Boolean)
], TransferResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'fromAccount' }),
    __metadata("design:type", Object)
], TransferResponseDto.prototype, "fromAccount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'toAccount' }),
    __metadata("design:type", Object)
], TransferResponseDto.prototype, "toAccount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'fromWarehouse' }),
    __metadata("design:type", Object)
], TransferResponseDto.prototype, "fromWarehouse", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'toWarehouse' }),
    __metadata("design:type", Object)
], TransferResponseDto.prototype, "toWarehouse", void 0);
class QueryTransferDto {
}
exports.QueryTransferDto = QueryTransferDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fields to select' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryTransferDto.prototype, "$select", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Relations to include' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryTransferDto.prototype, "$include", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to skip' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryTransferDto.prototype, "$skip", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of records to take' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryTransferDto.prototype, "$take", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryTransferDto.prototype, "$search", void 0);
