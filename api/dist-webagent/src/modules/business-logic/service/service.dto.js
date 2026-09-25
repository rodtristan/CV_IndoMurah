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
exports.RecordServicePaymentDto = exports.ServiceFilterDto = exports.CompleteServiceDto = exports.AddServiceItemDto = exports.UpDateServiceStatusDto = exports.CreateServiceDto = exports.ServiceItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class ServiceItemDto {
}
exports.ServiceItemDto = ServiceItemDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Product ID (if using inventory)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ServiceItemDto.prototype, "ProductId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Item/service Name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ServiceItemDto.prototype, "ProductName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantity' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.001),
    __metadata("design:type", Number)
], ServiceItemDto.prototype, "Quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Unit price' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ServiceItemDto.prototype, "UnitPrice", void 0);
class CreateServiceDto {
}
exports.CreateServiceDto = CreateServiceDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Service Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateServiceDto.prototype, "Date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customer ID (if registered customer)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateServiceDto.prototype, "CustomerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer Name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateServiceDto.prototype, "CustomerName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customer phone' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateServiceDto.prototype, "CustomerPhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customer address' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateServiceDto.prototype, "CustomerAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Product Name being serviced' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateServiceDto.prototype, "ProductName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Serial number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateServiceDto.prototype, "SerialNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Problem Description' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateServiceDto.prototype, "Problem", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Diagnosis' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateServiceDto.prototype, "Diagnosis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Technician Name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateServiceDto.prototype, "Technician", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warranty until Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateServiceDto.prototype, "WarrantyUntil", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Labor cost' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateServiceDto.prototype, "LaborCost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Service Items', type: [ServiceItemDto] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ServiceItemDto),
    __metadata("design:type", Array)
], CreateServiceDto.prototype, "Items", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Service Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateServiceDto.prototype, "Notes", void 0);
class UpDateServiceStatusDto {
}
exports.UpDateServiceStatusDto = UpDateServiceStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'New status ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpDateServiceStatusDto.prototype, "StatusId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Diagnosis upDate' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpDateServiceStatusDto.prototype, "Diagnosis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Technician' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpDateServiceStatusDto.prototype, "Technician", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpDateServiceStatusDto.prototype, "Notes", void 0);
class AddServiceItemDto {
}
exports.AddServiceItemDto = AddServiceItemDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Product ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AddServiceItemDto.prototype, "ProductId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Item Name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AddServiceItemDto.prototype, "ProductName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantity' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.001),
    __metadata("design:type", Number)
], AddServiceItemDto.prototype, "Quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unit price' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], AddServiceItemDto.prototype, "UnitPrice", void 0);
class CompleteServiceDto {
}
exports.CompleteServiceDto = CompleteServiceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Final diagnosis' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CompleteServiceDto.prototype, "Diagnosis", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Labor cost' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CompleteServiceDto.prototype, "LaborCost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Total Amount override' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CompleteServiceDto.prototype, "TotalAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Completion Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteServiceDto.prototype, "Notes", void 0);
class ServiceFilterDto {
}
exports.ServiceFilterDto = ServiceFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customer ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ServiceFilterDto.prototype, "CustomerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status ID filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ServiceFilterDto.prototype, "StatusId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ServiceFilterDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ServiceFilterDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Technician filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ServiceFilterDto.prototype, "Technician", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Pending/in progress only' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ServiceFilterDto.prototype, "PendingOnly", void 0);
class RecordServicePaymentDto {
}
exports.RecordServicePaymentDto = RecordServicePaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment Amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], RecordServicePaymentDto.prototype, "Amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment method ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecordServicePaymentDto.prototype, "PaymentMethodId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordServicePaymentDto.prototype, "ReferenceNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordServicePaymentDto.prototype, "Notes", void 0);
