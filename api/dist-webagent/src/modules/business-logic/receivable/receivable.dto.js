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
exports.WriteOffReceivableDto = exports.AgingReportDto = exports.SendReminderDto = exports.CustomerCreditLimitDto = exports.ReceivableFilterDto = exports.RecordBulkPaymentDto = exports.RecordPaymentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class RecordPaymentDto {
}
exports.RecordPaymentDto = RecordPaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment Amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], RecordPaymentDto.prototype, "Amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment method ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecordPaymentDto.prototype, "PaymentMethodId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference number (cheque, transfer ref, etc)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordPaymentDto.prototype, "ReferenceNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], RecordPaymentDto.prototype, "PaymentDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordPaymentDto.prototype, "Notes", void 0);
class RecordBulkPaymentDto {
}
exports.RecordBulkPaymentDto = RecordBulkPaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecordBulkPaymentDto.prototype, "CustomerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total payment Amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], RecordBulkPaymentDto.prototype, "Amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment method ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecordBulkPaymentDto.prototype, "PaymentMethodId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sale IDs to be paid off', type: [Number] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    __metadata("design:type", Array)
], RecordBulkPaymentDto.prototype, "SaleIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reference number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordBulkPaymentDto.prototype, "ReferenceNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment Notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordBulkPaymentDto.prototype, "Notes", void 0);
class ReceivableFilterDto {
}
exports.ReceivableFilterDto = ReceivableFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customer ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceivableFilterDto.prototype, "CustomerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status filter (ACTIVE, OVERDUE, PAID, ALL)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceivableFilterDto.prototype, "Status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date filter (YYYY-MM-DD)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ReceivableFilterDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date filter (YYYY-MM-DD)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ReceivableFilterDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Include overdue only' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ReceivableFilterDto.prototype, "OverdueOnly", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Minimum Amount filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ReceivableFilterDto.prototype, "MinAmount", void 0);
class CustomerCreditLimitDto {
}
exports.CustomerCreditLimitDto = CustomerCreditLimitDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'New credit limit' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CustomerCreditLimitDto.prototype, "CreditLimit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reason for change' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CustomerCreditLimitDto.prototype, "Reason", void 0);
class SendReminderDto {
}
exports.SendReminderDto = SendReminderDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SendReminderDto.prototype, "CustomerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reminder message' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SendReminderDto.prototype, "Message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Channel (EMAIL, SMS, WHATSAPP)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendReminderDto.prototype, "Channel", void 0);
class AgingReportDto {
}
exports.AgingReportDto = AgingReportDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'As of Date (default: today)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AgingReportDto.prototype, "AsOfDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customer group ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AgingReportDto.prototype, "CustomerGroupId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Warehouse ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AgingReportDto.prototype, "WarehouseId", void 0);
class WriteOffReceivableDto {
}
exports.WriteOffReceivableDto = WriteOffReceivableDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Receivable ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WriteOffReceivableDto.prototype, "ReceivableId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reason for write-off' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], WriteOffReceivableDto.prototype, "Reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Write-off Amount (partial write-off)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], WriteOffReceivableDto.prototype, "Amount", void 0);
