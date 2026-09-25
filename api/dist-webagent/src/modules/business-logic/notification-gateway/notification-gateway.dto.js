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
exports.WhatsAppGatewayConfigDto = exports.SmsGatewayConfigDto = exports.NotificationLogFilterDto = exports.PromotionDto = exports.BirthdayGreetingDto = exports.StockAlertNotificationDto = exports.PaymentReminderDto = exports.BulkWhatsAppDto = exports.SendWhatsAppDto = exports.SmsWithTemplateDto = exports.SmsTemplateDto = exports.BulkSmsDto = exports.SendSmsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class SendSmsDto {
}
exports.SendSmsDto = SendSmsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recipient phone number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SendSmsDto.prototype, "PhoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Message content' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SendSmsDto.prototype, "Message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sender ID/Name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendSmsDto.prototype, "SenderName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Scheduled send time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SendSmsDto.prototype, "ScheduledAt", void 0);
class BulkSmsDto {
}
exports.BulkSmsDto = BulkSmsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recipient phone numbers', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], BulkSmsDto.prototype, "PhoneNumbers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Message content' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BulkSmsDto.prototype, "Message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Scheduled send time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BulkSmsDto.prototype, "ScheduledAt", void 0);
class SmsTemplateDto {
}
exports.SmsTemplateDto = SmsTemplateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template Code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SmsTemplateDto.prototype, "Code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template Name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SmsTemplateDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template content (use {variable} for placeholders)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SmsTemplateDto.prototype, "Content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SmsTemplateDto.prototype, "Description", void 0);
class SmsWithTemplateDto {
}
exports.SmsWithTemplateDto = SmsWithTemplateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recipient phone number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SmsWithTemplateDto.prototype, "PhoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template Code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SmsWithTemplateDto.prototype, "TemplateCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Template variables' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SmsWithTemplateDto.prototype, "TemplateVariables", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Scheduled send time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SmsWithTemplateDto.prototype, "ScheduledAt", void 0);
class SendWhatsAppDto {
}
exports.SendWhatsAppDto = SendWhatsAppDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recipient phone number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SendWhatsAppDto.prototype, "PhoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Message content' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SendWhatsAppDto.prototype, "Message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Media URL (for media messages)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendWhatsAppDto.prototype, "MediaUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Media Type' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendWhatsAppDto.prototype, "MediaType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Scheduled send time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SendWhatsAppDto.prototype, "ScheduledAt", void 0);
class BulkWhatsAppDto {
}
exports.BulkWhatsAppDto = BulkWhatsAppDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recipient phone numbers', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], BulkWhatsAppDto.prototype, "PhoneNumbers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Message content' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BulkWhatsAppDto.prototype, "Message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Media URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkWhatsAppDto.prototype, "MediaUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Scheduled send time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BulkWhatsAppDto.prototype, "ScheduledAt", void 0);
class PaymentReminderDto {
}
exports.PaymentReminderDto = PaymentReminderDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PaymentReminderDto.prototype, "CustomerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Invoice/Sale ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PaymentReminderDto.prototype, "SaleId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Amount due' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PaymentReminderDto.prototype, "Amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Due Date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], PaymentReminderDto.prototype, "DueDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Send method: SMS, WHATSAPP, BOTH' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaymentReminderDto.prototype, "Method", void 0);
class StockAlertNotificationDto {
}
exports.StockAlertNotificationDto = StockAlertNotificationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StockAlertNotificationDto.prototype, "ProductId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current stock' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StockAlertNotificationDto.prototype, "CurrentStock", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Minimum stock level' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StockAlertNotificationDto.prototype, "MinimumStock", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Recipient phone numbers', type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], StockAlertNotificationDto.prototype, "Recipients", void 0);
class BirthdayGreetingDto {
}
exports.BirthdayGreetingDto = BirthdayGreetingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BirthdayGreetingDto.prototype, "CustomerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Send method: SMS, WHATSAPP, BOTH' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BirthdayGreetingDto.prototype, "Method", void 0);
class PromotionDto {
}
exports.PromotionDto = PromotionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Promotion title' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PromotionDto.prototype, "Title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Promotion message' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PromotionDto.prototype, "Message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Media URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PromotionDto.prototype, "MediaUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Target customer group ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PromotionDto.prototype, "CustomerGroupId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Target specific customer IDs', type: [Number] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    __metadata("design:type", Array)
], PromotionDto.prototype, "CustomerIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Send method: SMS, WHATSAPP, BOTH' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PromotionDto.prototype, "Method", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Scheduled send time' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], PromotionDto.prototype, "ScheduledAt", void 0);
class NotificationLogFilterDto {
}
exports.NotificationLogFilterDto = NotificationLogFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Channel: SMS, WHATSAPP, EMAIL, PUSH' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NotificationLogFilterDto.prototype, "Channel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status: PENDING, SENT, DELIVERED, FAILED' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NotificationLogFilterDto.prototype, "Status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], NotificationLogFilterDto.prototype, "StartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End Date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], NotificationLogFilterDto.prototype, "EndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search keyword' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NotificationLogFilterDto.prototype, "Search", void 0);
class SmsGatewayConfigDto {
}
exports.SmsGatewayConfigDto = SmsGatewayConfigDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Gateway Name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SmsGatewayConfigDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'API URL' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SmsGatewayConfigDto.prototype, "ApiUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'API Key' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SmsGatewayConfigDto.prototype, "ApiKey", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sender ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SmsGatewayConfigDto.prototype, "SenderId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is default' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SmsGatewayConfigDto.prototype, "IsDefault", void 0);
class WhatsAppGatewayConfigDto {
}
exports.WhatsAppGatewayConfigDto = WhatsAppGatewayConfigDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Gateway Name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], WhatsAppGatewayConfigDto.prototype, "Name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Gateway Type: WHATSAPP_BUSINESS, FONNTE, WA_BLAST, etc' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], WhatsAppGatewayConfigDto.prototype, "GatewayType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'API URL' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], WhatsAppGatewayConfigDto.prototype, "ApiUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'API Key or Token' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WhatsAppGatewayConfigDto.prototype, "ApiKey", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Phone number ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WhatsAppGatewayConfigDto.prototype, "PhoneNumberId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is default' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], WhatsAppGatewayConfigDto.prototype, "IsDefault", void 0);
