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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationGatewayController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const notification_gateway_service_1 = require("./notification-gateway-service");
const notification_gateway_dto_1 = require("./notification-gateway.dto");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const api_response_dto_1 = require("../../../common/dto/api-response-dto");
let NotificationGatewayController = class NotificationGatewayController {
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    async sendSms(dto) {
        const data = await this.notificationService.sendSms(dto, 'system');
        return api_response_dto_1.ApiResponse.ok(data, 'SMS sent successfully');
    }
    async sendBulkSms(dto) {
        const data = await this.notificationService.sendBulkSms(dto, 'system');
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async sendSmsWithTemplate(dto) {
        const data = await this.notificationService.sendSmsWithTemplate(dto, 'system');
        return api_response_dto_1.ApiResponse.ok(data, 'SMS sent successfully');
    }
    async sendWhatsApp(dto) {
        const data = await this.notificationService.sendWhatsApp(dto, 'system');
        return api_response_dto_1.ApiResponse.ok(data, 'WhatsApp message sent successfully');
    }
    async sendBulkWhatsApp(dto) {
        const data = await this.notificationService.sendBulkWhatsApp(dto, 'system');
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async sendPaymentReminder(dto) {
        const data = await this.notificationService.sendPaymentReminder(dto, 'system');
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async sendStockAlertNotification(dto) {
        const data = await this.notificationService.sendStockAlertNotification(dto, 'system');
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async sendBirthdayGreeting(dto) {
        const data = await this.notificationService.sendBirthdayGreeting(dto, 'system');
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async sendPromotion(dto) {
        const data = await this.notificationService.sendPromotion(dto, 'system');
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async createTemplate(dto) {
        const data = await this.notificationService.createTemplate(dto, 'system');
        return api_response_dto_1.ApiResponse.ok(data, 'Template created successfully');
    }
    async listTemplates(channel) {
        const data = await this.notificationService.listTemplates(channel);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getNotificationLogs(dto) {
        const data = await this.notificationService.getNotificationLogs(dto);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async getNotificationStats(startDate, endDate) {
        const data = await this.notificationService.getNotificationStats(startDate, endDate);
        return api_response_dto_1.ApiResponse.ok(data);
    }
    async configureSmsGateway(dto) {
        const data = await this.notificationService.configureSmsGateway(dto, 'system');
        return api_response_dto_1.ApiResponse.ok(data, 'SMS gateway configured successfully');
    }
    async configureWhatsAppGateway(dto) {
        const data = await this.notificationService.configureWhatsAppGateway(dto, 'system');
        return api_response_dto_1.ApiResponse.ok(data, 'WhatsApp gateway configured successfully');
    }
    async listGateways() {
        const data = await this.notificationService.listGateways();
        return api_response_dto_1.ApiResponse.ok(data);
    }
};
exports.NotificationGatewayController = NotificationGatewayController;
__decorate([
    (0, common_1.Post)('sms/send'),
    (0, swagger_1.ApiOperation)({ summary: 'Send single SMS' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [notification_gateway_dto_1.SendSmsDto]),
    __metadata("design:returntype", Promise)
], NotificationGatewayController.prototype, "sendSms", null);
__decorate([
    (0, common_1.Post)('sms/bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Send bulk SMS' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [notification_gateway_dto_1.BulkSmsDto]),
    __metadata("design:returntype", Promise)
], NotificationGatewayController.prototype, "sendBulkSms", null);
__decorate([
    (0, common_1.Post)('sms/template'),
    (0, swagger_1.ApiOperation)({ summary: 'Send SMS using template' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [notification_gateway_dto_1.SmsWithTemplateDto]),
    __metadata("design:returntype", Promise)
], NotificationGatewayController.prototype, "sendSmsWithTemplate", null);
__decorate([
    (0, common_1.Post)('whatsapp/send'),
    (0, swagger_1.ApiOperation)({ summary: 'Send single WhatsApp message' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [notification_gateway_dto_1.SendWhatsAppDto]),
    __metadata("design:returntype", Promise)
], NotificationGatewayController.prototype, "sendWhatsApp", null);
__decorate([
    (0, common_1.Post)('whatsapp/bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Send bulk WhatsApp messages' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [notification_gateway_dto_1.BulkWhatsAppDto]),
    __metadata("design:returntype", Promise)
], NotificationGatewayController.prototype, "sendBulkWhatsApp", null);
__decorate([
    (0, common_1.Post)('auto/payment-reminder'),
    (0, swagger_1.ApiOperation)({ summary: 'Send payment reminder to customer' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [notification_gateway_dto_1.PaymentReminderDto]),
    __metadata("design:returntype", Promise)
], NotificationGatewayController.prototype, "sendPaymentReminder", null);
__decorate([
    (0, common_1.Post)('auto/stock-alert'),
    (0, swagger_1.ApiOperation)({ summary: 'Send stock alert notification' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [notification_gateway_dto_1.StockAlertNotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationGatewayController.prototype, "sendStockAlertNotification", null);
__decorate([
    (0, common_1.Post)('auto/birthday-greeting'),
    (0, swagger_1.ApiOperation)({ summary: 'Send birthday greeting to customer' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [notification_gateway_dto_1.BirthdayGreetingDto]),
    __metadata("design:returntype", Promise)
], NotificationGatewayController.prototype, "sendBirthdayGreeting", null);
__decorate([
    (0, common_1.Post)('auto/promotion'),
    (0, swagger_1.ApiOperation)({ summary: 'Send promotion to customers' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [notification_gateway_dto_1.PromotionDto]),
    __metadata("design:returntype", Promise)
], NotificationGatewayController.prototype, "sendPromotion", null);
__decorate([
    (0, common_1.Post)('template'),
    (0, swagger_1.ApiOperation)({ summary: 'Create notification template' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [notification_gateway_dto_1.SmsTemplateDto]),
    __metadata("design:returntype", Promise)
], NotificationGatewayController.prototype, "createTemplate", null);
__decorate([
    (0, common_1.Get)('template'),
    (0, swagger_1.ApiOperation)({ summary: 'List notification templates' }),
    __param(0, (0, common_1.Query)('channel')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationGatewayController.prototype, "listTemplates", null);
__decorate([
    (0, common_1.Get)('logs'),
    (0, swagger_1.ApiOperation)({ summary: 'Get notification logs' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [notification_gateway_dto_1.NotificationLogFilterDto]),
    __metadata("design:returntype", Promise)
], NotificationGatewayController.prototype, "getNotificationLogs", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get notification statistics' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NotificationGatewayController.prototype, "getNotificationStats", null);
__decorate([
    (0, common_1.Post)('config/sms'),
    (0, swagger_1.ApiOperation)({ summary: 'Configure SMS gateway' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [notification_gateway_dto_1.SmsGatewayConfigDto]),
    __metadata("design:returntype", Promise)
], NotificationGatewayController.prototype, "configureSmsGateway", null);
__decorate([
    (0, common_1.Post)('config/whatsapp'),
    (0, swagger_1.ApiOperation)({ summary: 'Configure WhatsApp gateway' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [notification_gateway_dto_1.WhatsAppGatewayConfigDto]),
    __metadata("design:returntype", Promise)
], NotificationGatewayController.prototype, "configureWhatsAppGateway", null);
__decorate([
    (0, common_1.Get)('config'),
    (0, swagger_1.ApiOperation)({ summary: 'List configured gateways' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationGatewayController.prototype, "listGateways", null);
exports.NotificationGatewayController = NotificationGatewayController = __decorate([
    (0, swagger_1.ApiTags)('Notification Gateway - SMS & WhatsApp'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/notification-gateway'),
    __metadata("design:paramtypes", [notification_gateway_service_1.NotificationGatewayService])
], NotificationGatewayController);
