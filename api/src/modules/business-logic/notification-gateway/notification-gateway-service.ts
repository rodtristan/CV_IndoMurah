import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { Prisma } from '@prisma/client';
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

@Injectable()
export class NotificationGatewayService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // SMS GATEWAY
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Send SMS
   * Flow: Sistem kirim SMS ke pelanggan
   */
  async sendSms(dto: SendSmsDto, UserId: string) {
    // Get Default SMS gateway
    const gateway = await this.prisma.notificationGateway.findFirst({
      where: { Type: 'SMS', IsDefault: true, IsActive: true },
    });

    if (!gateway) {
      throw new BadRequestException('No SMS gateway configured');
    }

    // Format phone Number
    const phoneNumber = this.formatPhoneNumber(dto.PhoneNumber);

    // Create notification Record
    const notification = await this.prisma.notificationLog.create({
      data: {
        Channel: 'SMS',
        Recipient: phoneNumber,
        Message: dto.Message,
        Status: 'PENDING',
        ScheduledAt: dto.ScheduledAt ? new Date(dto.ScheduledAt) : null,
        GatewayID: gateway.ID,
        CreatedByID: UserId,
      },
    });

    // If not Scheduled, send immediately
    if (!dto.ScheduledAt) {
      await this.processSmsNotification(notification.ID, phoneNumber, dto.Message);
    }

    return {
      success: true,
      notificationId: notification.ID,
      phoneNumber,
      Status: dto.ScheduledAt ? 'SCHEDULED' : 'SENT',
      ScheduledAt: dto.ScheduledAt,
    };
  }

  /**
   * Send bulk SMS
   */
  async sendBulkSms(dto: BulkSmsDto, UserId: string) {
    const gateway = await this.prisma.notificationGateway.findFirst({
      where: { Type: 'SMS', IsDefault: true, IsActive: true },
    });

    if (!gateway) {
      throw new BadRequestException('No SMS gateway configured');
    }

    const Results = {
      success: 0,
      failed: 0,
      scheduled: 0,
      errors: [] as string[],
    };

    for (const phone of dto.PhoneNumbers) {
      try {
        const formattedPhone = this.formatPhoneNumber(phone);

        const notification = await this.prisma.notificationLog.create({
          data: {
            Channel: 'SMS',
            Recipient: formattedPhone,
            Message: dto.Message,
            Status: 'PENDING',
            ScheduledAt: dto.ScheduledAt ? new Date(dto.ScheduledAt) : null,
            GatewayID: gateway.ID,
            CreatedByID: UserId,
          },
        });

        if (!dto.ScheduledAt) {
          await this.processSmsNotification(notification.ID, formattedPhone, dto.Message);
        }

        Results.success++;
        if (dto.ScheduledAt) Results.scheduled++;
      } catch (error) {
        Results.failed++;
        Results.errors.push(`${phone}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      total: dto.PhoneNumbers.length,
      ...Results,
    };
  }

  /**
   * Send SMS using template
   */
  async sendSmsWithTemplate(dto: SmsWithTemplateDto, UserId: string) {
    const template = await this.prisma.notificationTemplate.findFirst({
      where: { Code: dto.TemplateCode, IsActive: true },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Replace template variables
    let message = template.Content || '';
    if (dto.TemplateVariables) {
      for (const [key, value] of Object.entries(dto.TemplateVariables)) {
        message = message.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
      }
    }

    return this.sendSms(
      {
        PhoneNumber: dto.PhoneNumber,
        Message: message,
        ScheduledAt: dto.ScheduledAt,
      },
      UserId,
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // WHATSAPP GATEWAY
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Send WhatsApp message
   */
  async sendWhatsApp(dto: SendWhatsAppDto, UserId: string) {
    const gateway = await this.prisma.notificationGateway.findFirst({
      where: { Type: 'WHATSAPP', IsDefault: true, IsActive: true },
    });

    if (!gateway) {
      throw new BadRequestException('No WhatsApp gateway configured');
    }

    const phoneNumber = this.formatPhoneNumber(dto.PhoneNumber);

    const notification = await this.prisma.notificationLog.create({
      data: {
        Channel: 'WHATSAPP',
        Recipient: phoneNumber,
        Message: dto.Message,
        MediaUrl: dto.MediaUrl,
        MediaType: dto.MediaType,
        Status: 'PENDING',
        ScheduledAt: dto.ScheduledAt ? new Date(dto.ScheduledAt) : null,
        GatewayID: gateway.ID,
        CreatedByID: UserId,
      },
    });

    if (!dto.ScheduledAt) {
      await this.processWhatsAppNotification(notification.ID, phoneNumber, dto.Message, dto.MediaUrl);
    }

    return {
      success: true,
      notificationId: notification.ID,
      phoneNumber,
      Status: dto.ScheduledAt ? 'SCHEDULED' : 'SENT',
    };
  }

  /**
   * Send bulk WhatsApp
   */
  async sendBulkWhatsApp(dto: BulkWhatsAppDto, UserId: string) {
    const gateway = await this.prisma.notificationGateway.findFirst({
      where: { Type: 'WHATSAPP', IsDefault: true, IsActive: true },
    });

    if (!gateway) {
      throw new BadRequestException('No WhatsApp gateway configured');
    }

    const Results = {
      success: 0,
      failed: 0,
      scheduled: 0,
      errors: [] as string[],
    };

    for (const phone of dto.PhoneNumbers) {
      try {
        const formattedPhone = this.formatPhoneNumber(phone);

        const notification = await this.prisma.notificationLog.create({
          data: {
            Channel: 'WHATSAPP',
            Recipient: formattedPhone,
            Message: dto.Message,
            MediaUrl: dto.MediaUrl,
            Status: 'PENDING',
            ScheduledAt: dto.ScheduledAt ? new Date(dto.ScheduledAt) : null,
            GatewayID: gateway.ID,
            CreatedByID: UserId,
          },
        });

        if (!dto.ScheduledAt) {
          await this.processWhatsAppNotification(notification.ID, formattedPhone, dto.Message, dto.MediaUrl);
        }

        Results.success++;
        if (dto.ScheduledAt) Results.scheduled++;
      } catch (error) {
        Results.failed++;
        Results.errors.push(`${phone}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      total: dto.PhoneNumbers.length,
      ...Results,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // AUTO NOTIFICATIONS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Send Payment reminder
   */
  async sendPaymentReminder(dto: PaymentReminderDto, UserId: string) {
    const Customer = await this.prisma.customer.findUnique({
      where: { ID: dto.CustomerId },
    });

    if (!Customer) {
      throw new NotFoundException('Customer not found');
    }

    const Sale = await this.prisma.sale.findUnique({
      where: { ID: dto.SaleId },
    });

    if (!Sale) {
      throw new NotFoundException('Sale not found');
    }

    const message = `Yth. ${Customer.Name}, tagihan sebesar Rp ${this.formatCurrency(dto.Amount)} sudah jatuh tempo pada ${this.formatDate(dto.DueDate)}. Mohon segera lakukan pembayaran. Terima kasih.`;

    const Results: any = { CustomerId: dto.CustomerId };

    if (dto.Method === 'SMS' || dto.Method === 'BOTH') {
      if (Customer.Phone) {
        Results.sms = await this.sendSms({ PhoneNumber: Customer.Phone, Message: message }, UserId);
      }
    }

    if (dto.Method === 'WHATSAPP' || dto.Method === 'BOTH') {
      if (Customer.Phone) {
        Results.whatsapp = await this.sendWhatsApp({ PhoneNumber: Customer.Phone, Message: message }, UserId);
      }
    }

    return {
      success: true,
      ...Results,
    };
  }

  /**
   * Send Stock Alert notification
   */
  async sendStockAlertNotification(dto: StockAlertNotificationDto, UserId: string) {
    const Product = await this.prisma.product.findUnique({
      where: { ID: dto.ProductId },
    });

    if (!Product) {
      throw new NotFoundException('Product not found');
    }

    const message = `⚠️ ALERT STOK: ${Product.Name} (${Product.Code}) - Stok saat ini: ${dto.CurrentStock} (Min: ${dto.MinimumStock}). Mohon segera lakukan pemesanan ulang.`;

    // Get Default recipients if not specified
    const recipients = dto.Recipients || [];

    const Results: any[] = [];
    for (const phone of recipients) {
      const Result = await this.sendWhatsApp({ PhoneNumber: phone, Message: message }, UserId);
      Results.push(Result);
    }

    return {
      success: true,
      ProductId: dto.ProductId,
      ProductName: Product.Name,
      recipientsCount: recipients.length,
      Results,
    };
  }

  /**
   * Send birthday greeting
   */
  async sendBirthdayGreeting(dto: BirthdayGreetingDto, UserId: string) {
    const Customer = await this.prisma.customer.findUnique({
      where: { ID: dto.CustomerId },
    });

    if (!Customer) {
      throw new NotFoundException('Customer not found');
    }

    const message = `Selamat ulang tahun, ${Customer.Name}! 🎂🎉 Semoga tahun ini penuh kebahagiaan dan kesehatan. Selamat berbelanja di Toko CV IndoMurah dan nikmati promo spesial untuk Anda!`;

    const Results: any = { CustomerId: dto.CustomerId };

    if (dto.Method === 'SMS' || dto.Method === 'BOTH') {
      if (Customer.Phone) {
        Results.sms = await this.sendSms({ PhoneNumber: Customer.Phone, Message: message }, UserId);
      }
    }

    if (dto.Method === 'WHATSAPP' || dto.Method === 'BOTH') {
      if (Customer.Phone) {
        Results.whatsapp = await this.sendWhatsApp({ PhoneNumber: Customer.Phone, Message: message }, UserId);
      }
    }

    return {
      success: true,
      ...Results,
    };
  }

  /**
   * Send promotion to Customers
   */
  async sendPromotion(dto: PromotionDto, UserId: string) {
    // Get Target Customers
    let Customers: any[] = [];

    if (dto.CustomerIds && dto.CustomerIds.length > 0) {
      Customers = await this.prisma.customer.findMany({
        where: { ID: { in: dto.CustomerIds } },
        select: { ID: true, Phone: true, Name: true },
      });
    } else if (dto.CustomerGroupId) {
      Customers = await this.prisma.customer.findMany({
        where: { CustomerGroupID: dto.CustomerGroupId, IsActive: true },
        select: { ID: true, Phone: true, Name: true },
      });
    } else {
      // All Active Customers with phone
      Customers = await this.prisma.customer.findMany({
        where: { IsActive: true, Phone: { not: null } },
        select: { ID: true, Phone: true, Name: true },
      });
    }

    const message = `📢 ${dto.Title}\n\n${dto.Message}\n\nSelamat berbelanja!`;

    const Results = {
      TotalCustomers: Customers.length,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const Customer of Customers) {
      if (!Customer.Phone) continue;

      try {
        if (dto.Method === 'WHATSAPP' || dto.Method === 'BOTH') {
          await this.sendWhatsApp(
            {
              PhoneNumber: Customer.Phone,
              Message: message.replace('{Name}', Customer.Name),
              MediaUrl: dto.MediaUrl,
            },
            UserId,
          );
        } else {
          await this.sendSms(
            {
              PhoneNumber: Customer.Phone,
              Message: message.replace('{Name}', Customer.Name),
              ScheduledAt: dto.ScheduledAt,
            },
            UserId,
          );
        }
        Results.sent++;
      } catch (error) {
        Results.failed++;
        Results.errors.push(`${Customer.Name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      success: true,
      ...Results,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TEMPLATE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create SMS template
   */
  async createTemplate(dto: SmsTemplateDto, UserId: string) {
    const existing = await this.prisma.notificationTemplate.findFirst({
      where: { Code: dto.Code },
    });

    if (existing) {
      throw new BadRequestException('Template Code already exists');
    }

    const template = await this.prisma.notificationTemplate.create({
      data: {
        Code: dto.Code,
        Name: dto.Name,
        Content: dto.Content,
        Description: dto.Description,
        Channel: 'SMS',
        IsActive: true,
      },
    });

    return {
      success: true,
      template: this.formatTemplate(template),
    };
  }

  /**
   * List templates
   */
  async listTemplates(channel?: string) {
    const where: any = { IsActive: true };
    if (channel) where.Channel = channel;

    const templates = await this.prisma.notificationTemplate.findMany({
      where,
      orderBy: { Name: 'asc' },
    });

    return templates.map((t) => this.formatTemplate(t));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // NOTIFICATION LOGS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get notification logs
   */
  async getNotificationLogs(dto: NotificationLogFilterDto) {
    const where: any = {};

    if (dto.Channel) where.Channel = dto.Channel;
    if (dto.Status) where.Status = dto.Status;

    if (dto.StartDate || dto.EndDate) {
      where.CreatedAt = {};
      if (dto.StartDate) {
        where.CreatedAt.gte = new Date(dto.StartDate);
      }
      if (dto.EndDate) {
        where.CreatedAt.lte = new Date(dto.EndDate);
      }
    }

    if (dto.Search) {
      where.OR = [
        { Recipient: { contains: dto.Search, mode: 'insensitive' } },
        { Message: { contains: dto.Search, mode: 'insensitive' } },
      ];
    }

    const Logs = await this.prisma.notificationLog.findMany({
      where,
      include: { Gateway: true },
      orderBy: { CreatedAt: 'desc' },
      take: 100,
    });

    return Logs.map((l) => ({
      ID: l.ID,
      channel: l.Channel,
      recipient: l.Recipient,
      message: l.Message,
      status: l.Status,
      mediaUrl: l.MediaUrl,
      scheduledAt: l.ScheduledAt,
      sentAt: l.SentAt,
      deliveredAt: l.DeliveredAt,
      gateway: l.Gateway?.Name,
      errorMessage: l.ErrorMessage,
      createdAt: l.CreatedAt,
    }));
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(startDate?: string, endDate?: string) {
    const where: any = {};

    if (startDate || endDate) {
      where.CreatedAt = {};
      if (startDate) where.CreatedAt.gte = new Date(startDate);
      if (endDate) where.CreatedAt.lte = new Date(endDate);
    }

    const [Total, sent, delivered, failed] = await Promise.all([
      this.prisma.notificationLog.count({ where }),
      this.prisma.notificationLog.count({ where: { ...where, Status: 'SENT' } }),
      this.prisma.notificationLog.count({ where: { ...where, Status: 'DELIVERED' } }),
      this.prisma.notificationLog.count({ where: { ...where, Status: 'FAILED' } }),
    ]);

    const byChannel = await this.prisma.notificationLog.groupBy({
      by: ['Channel'],
      where,
      _count: true,
    });

    return {
      total: Total,
      sent,
      delivered,
      failed,
      successRate: Total > 0 ? ((sent + delivered) / Total) * 100 : 0,
      byChannel: byChannel.map((b) => ({
        channel: b.Channel,
        count: b._count,
      })),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GATEWAY CONFIGURATION
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Configure SMS gateway
   */
  async configureSmsGateway(dto: SmsGatewayConfigDto, UserId: string) {
    if (dto.IsDefault) {
      // Reset other gateways as non-Default
      await this.prisma.notificationGateway.updateMany({
        where: { Type: 'SMS', IsDefault: true },
        data: { IsDefault: false },
      });
    }

    const gateway = await this.prisma.notificationGateway.upsert({
      where: { ID: 0 },
      create: {
        Name: dto.Name,
        Type: 'SMS',
        ApiUrl: dto.ApiUrl,
        ApiKey: dto.ApiKey,
        SenderId: dto.SenderId,
        IsDefault: dto.IsDefault || false,
        IsActive: true,
      },
      update: {
        Name: dto.Name,
        ApiUrl: dto.ApiUrl,
        ApiKey: dto.ApiKey,
        SenderId: dto.SenderId,
        IsDefault: dto.IsDefault || false,
      },
    });

    return {
      success: true,
      gateway: this.formatGateway(gateway),
    };
  }

  /**
   * Configure WhatsApp gateway
   */
  async configureWhatsAppGateway(dto: WhatsAppGatewayConfigDto, UserId: string) {
    if (dto.IsDefault) {
      await this.prisma.notificationGateway.updateMany({
        where: { Type: 'WHATSAPP', IsDefault: true },
        data: { IsDefault: false },
      });
    }

    const gateway = await this.prisma.notificationGateway.upsert({
      where: { ID: 0 },
      create: {
        Name: dto.Name,
        Type: 'WHATSAPP',
        GatewayType: dto.GatewayType,
        ApiUrl: dto.ApiUrl,
        ApiKey: dto.ApiKey,
        PhoneNumberId: dto.PhoneNumberId,
        IsDefault: dto.IsDefault || false,
        IsActive: true,
      },
      update: {
        Name: dto.Name,
        GatewayType: dto.GatewayType,
        ApiUrl: dto.ApiUrl,
        ApiKey: dto.ApiKey,
        PhoneNumberId: dto.PhoneNumberId,
        IsDefault: dto.IsDefault || false,
      },
    });

    return {
      success: true,
      gateway: this.formatGateway(gateway),
    };
  }

  /**
   * List configured gateways
   */
  async listGateways() {
    const gateways = await this.prisma.notificationGateway.findMany({
      orderBy: [{ IsDefault: 'desc' }, { Name: 'asc' }],
    });

    return gateways.map((g) => this.formatGateway(g));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  private async processSmsNotification(
    notificationId: number,
    phoneNumber: string,
    message: string,
  ) {
    // In real implementation, this would call the actual SMS gateway API
    // For now, we simulate the send

    try {
      // Simulate API call to SMS gateway

      await this.prisma.notificationLog.update({
        where: { ID: notificationId },
        data: {
          Status: 'SENT',
          SentAt: new Date(),
          ExternalId: `SMS-${Date.now()}`,
        },
      });

      // Simulate delivery confirmation (would be webhook in real implementation)
      setTimeout(async () => {
        await this.prisma.notificationLog.update({
          where: { ID: notificationId },
          data: { Status: 'DELIVERED', DeliveredAt: new Date() },
        }).catch(() => {});
      }, 2000);

      return { success: true };
    } catch (error) {
      await this.prisma.notificationLog.update({
        where: { ID: notificationId },
        data: {
          Status: 'FAILED',
          ErrorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  private async processWhatsAppNotification(
    notificationId: number,
    phoneNumber: string,
    message: string,
    mediaUrl?: string,
  ) {
    // Similar implementation to SMS
    try {
      await this.prisma.notificationLog.update({
        where: { ID: notificationId },
        data: {
          Status: 'SENT',
          SentAt: new Date(),
          ExternalId: `WA-${Date.now()}`,
        },
      });

      setTimeout(async () => {
        await this.prisma.notificationLog.update({
          where: { ID: notificationId },
          data: { Status: 'DELIVERED', DeliveredAt: new Date() },
        }).catch(() => {});
      }, 2000);

      return { success: true };
    } catch (error) {
      await this.prisma.notificationLog.update({
        where: { ID: notificationId },
        data: {
          Status: 'FAILED',
          ErrorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  private formatPhoneNumber(phone: string): string {
    // Remove all non-digits
    let digits = phone.replace(/\D/g, '');

    // Add Indonesia Country Code if not present
    if (!digits.startsWith('62') && !digits.startsWith('+62')) {
      if (digits.startsWith('0')) {
        digits = '62' + digits.substring(1);
      } else if (digits.startsWith('8')) {
        digits = '62' + digits;
      }
    }

    // Add @c.us suffix for WhatsApp
    return digits + '@c.us';
  }

  private formatCurrency(Amount: number): string {
    return new Intl.NumberFormat('ID-ID').format(Amount);
  }

  private formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('ID-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  private formatTemplate(template: any) {
    return {
      ID: template.ID,
      code: template.Code,
      name: template.Name,
      content: template.Content,
      description: template.Description,
      channel: template.Channel,
      isActive: template.IsActive,
    };
  }

  private formatGateway(gateway: any) {
    return {
      ID: gateway.ID,
      name: gateway.Name,
      type: gateway.Type,
      gatewayType: gateway.GatewayType,
      apiUrl: gateway.ApiUrl,
      isDefault: gateway.IsDefault,
      isActive: gateway.IsActive,
    };
  }
}
