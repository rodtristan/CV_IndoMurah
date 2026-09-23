import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationGatewayService } from './notification-gateway-service';
import {
  SendSmsDto,
  BulkSmsDto,
  SmsTemplateDto,
  SmsWithTemplateDto,
  SendWhatsAppDto,
  BulkWhatsAppDto,
  PaymentReminderDto,
  StockAlertNotificationDto,
  BirthdayGreetingDto,
  PromotionDto,
  NotificationLogFilterDto,
  SmsGatewayConfigDto,
  WhatsAppGatewayConfigDto,
} from './notification-gateway.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../../common/dto/api-response-dto';

@ApiTags('Notification Gateway - SMS & WhatsApp')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-logic/notification-gateway')
export class NotificationGatewayController {
  constructor(private notificationService: NotificationGatewayService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // SMS
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('sms/send')
  @ApiOperation({ summary: 'Send single SMS' })
  async sendSms(@Body() dto: SendSmsDto) {
    const data = await this.notificationService.sendSms(dto, 'system');
    return ApiResponse.ok(data, 'SMS sent successfully');
  }

  @Post('sms/bulk')
  @ApiOperation({ summary: 'Send bulk SMS' })
  async sendBulkSms(@Body() dto: BulkSmsDto) {
    const data = await this.notificationService.sendBulkSms(dto, 'system');
    return ApiResponse.ok(data);
  }

  @Post('sms/template')
  @ApiOperation({ summary: 'Send SMS using template' })
  async sendSmsWithTemplate(@Body() dto: SmsWithTemplateDto) {
    const data = await this.notificationService.sendSmsWithTemplate(dto, 'system');
    return ApiResponse.ok(data, 'SMS sent successfully');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // WHATSAPP
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('whatsapp/send')
  @ApiOperation({ summary: 'Send single WhatsApp message' })
  async sendWhatsApp(@Body() dto: SendWhatsAppDto) {
    const data = await this.notificationService.sendWhatsApp(dto, 'system');
    return ApiResponse.ok(data, 'WhatsApp message sent successfully');
  }

  @Post('whatsapp/bulk')
  @ApiOperation({ summary: 'Send bulk WhatsApp messages' })
  async sendBulkWhatsApp(@Body() dto: BulkWhatsAppDto) {
    const data = await this.notificationService.sendBulkWhatsApp(dto, 'system');
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // AUTO NOTIFICATIONS
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('auto/payment-reminder')
  @ApiOperation({ summary: 'Send payment reminder to customer' })
  async sendPaymentReminder(@Body() dto: PaymentReminderDto) {
    const data = await this.notificationService.sendPaymentReminder(dto, 'system');
    return ApiResponse.ok(data);
  }

  @Post('auto/stock-alert')
  @ApiOperation({ summary: 'Send stock alert notification' })
  async sendStockAlertNotification(@Body() dto: StockAlertNotificationDto) {
    const data = await this.notificationService.sendStockAlertNotification(dto, 'system');
    return ApiResponse.ok(data);
  }

  @Post('auto/birthday-greeting')
  @ApiOperation({ summary: 'Send birthday greeting to customer' })
  async sendBirthdayGreeting(@Body() dto: BirthdayGreetingDto) {
    const data = await this.notificationService.sendBirthdayGreeting(dto, 'system');
    return ApiResponse.ok(data);
  }

  @Post('auto/promotion')
  @ApiOperation({ summary: 'Send promotion to customers' })
  async sendPromotion(@Body() dto: PromotionDto) {
    const data = await this.notificationService.sendPromotion(dto, 'system');
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TEMPLATES
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('template')
  @ApiOperation({ summary: 'Create notification template' })
  async createTemplate(@Body() dto: SmsTemplateDto) {
    const data = await this.notificationService.createTemplate(dto, 'system');
    return ApiResponse.ok(data, 'Template created successfully');
  }

  @Get('template')
  @ApiOperation({ summary: 'List notification templates' })
  async listTemplates(@Query('channel') channel?: string) {
    const data = await this.notificationService.listTemplates(channel);
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // LOGS & STATS
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('logs')
  @ApiOperation({ summary: 'Get notification logs' })
  async getNotificationLogs(@Query() dto: NotificationLogFilterDto) {
    const data = await this.notificationService.getNotificationLogs(dto);
    return ApiResponse.ok(data);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get notification statistics' })
  async getNotificationStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const data = await this.notificationService.getNotificationStats(startDate, endDate);
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GATEWAY CONFIGURATION
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('config/sms')
  @ApiOperation({ summary: 'Configure SMS gateway' })
  async configureSmsGateway(@Body() dto: SmsGatewayConfigDto) {
    const data = await this.notificationService.configureSmsGateway(dto, 'system');
    return ApiResponse.ok(data, 'SMS gateway configured successfully');
  }

  @Post('config/whatsapp')
  @ApiOperation({ summary: 'Configure WhatsApp gateway' })
  async configureWhatsAppGateway(@Body() dto: WhatsAppGatewayConfigDto) {
    const data = await this.notificationService.configureWhatsAppGateway(dto, 'system');
    return ApiResponse.ok(data, 'WhatsApp gateway configured successfully');
  }

  @Get('config')
  @ApiOperation({ summary: 'List configured gateways' })
  async listGateways() {
    const data = await this.notificationService.listGateways();
    return ApiResponse.ok(data);
  }
}
