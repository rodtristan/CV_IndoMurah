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
exports.NotificationGatewayService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
let NotificationGatewayService = class NotificationGatewayService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async sendSms(dto, UserId) {
        const gateway = await this.prisma.notificationGateway.findFirst({
            where: { Type: 'SMS', IsDefault: true, IsActive: true },
        });
        if (!gateway) {
            throw new common_1.BadRequestException('No SMS gateway configured');
        }
        const phoneNumber = this.formatPhoneNumber(dto.PhoneNumber);
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
    async sendBulkSms(dto, UserId) {
        const gateway = await this.prisma.notificationGateway.findFirst({
            where: { Type: 'SMS', IsDefault: true, IsActive: true },
        });
        if (!gateway) {
            throw new common_1.BadRequestException('No SMS gateway configured');
        }
        const Results = {
            success: 0,
            failed: 0,
            scheduled: 0,
            errors: [],
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
                if (dto.ScheduledAt)
                    Results.scheduled++;
            }
            catch (error) {
                Results.failed++;
                Results.errors.push(`${phone}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        return {
            total: dto.PhoneNumbers.length,
            ...Results,
        };
    }
    async sendSmsWithTemplate(dto, UserId) {
        const template = await this.prisma.notificationTemplate.findFirst({
            where: { Code: dto.TemplateCode, IsActive: true },
        });
        if (!template) {
            throw new common_1.NotFoundException('Template not found');
        }
        let message = template.Content || '';
        if (dto.TemplateVariables) {
            for (const [key, value] of Object.entries(dto.TemplateVariables)) {
                message = message.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
            }
        }
        return this.sendSms({
            PhoneNumber: dto.PhoneNumber,
            Message: message,
            ScheduledAt: dto.ScheduledAt,
        }, UserId);
    }
    async sendWhatsApp(dto, UserId) {
        const gateway = await this.prisma.notificationGateway.findFirst({
            where: { Type: 'WHATSAPP', IsDefault: true, IsActive: true },
        });
        if (!gateway) {
            throw new common_1.BadRequestException('No WhatsApp gateway configured');
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
    async sendBulkWhatsApp(dto, UserId) {
        const gateway = await this.prisma.notificationGateway.findFirst({
            where: { Type: 'WHATSAPP', IsDefault: true, IsActive: true },
        });
        if (!gateway) {
            throw new common_1.BadRequestException('No WhatsApp gateway configured');
        }
        const Results = {
            success: 0,
            failed: 0,
            scheduled: 0,
            errors: [],
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
                if (dto.ScheduledAt)
                    Results.scheduled++;
            }
            catch (error) {
                Results.failed++;
                Results.errors.push(`${phone}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        return {
            total: dto.PhoneNumbers.length,
            ...Results,
        };
    }
    async sendPaymentReminder(dto, UserId) {
        const Customer = await this.prisma.customer.findUnique({
            where: { ID: dto.CustomerId },
        });
        if (!Customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const Sale = await this.prisma.sale.findUnique({
            where: { ID: dto.SaleId },
        });
        if (!Sale) {
            throw new common_1.NotFoundException('Sale not found');
        }
        const message = `Yth. ${Customer.Name}, tagihan sebesar Rp ${this.formatCurrency(dto.Amount)} sudah jatuh tempo pada ${this.formatDate(dto.DueDate)}. Mohon segera lakukan pembayaran. Terima kasih.`;
        const Results = { CustomerId: dto.CustomerId };
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
    async sendStockAlertNotification(dto, UserId) {
        const Product = await this.prisma.product.findUnique({
            where: { ID: dto.ProductId },
        });
        if (!Product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const message = `⚠️ ALERT STOK: ${Product.Name} (${Product.Code}) - Stok saat ini: ${dto.CurrentStock} (Min: ${dto.MinimumStock}). Mohon segera lakukan pemesanan ulang.`;
        const recipients = dto.Recipients || [];
        const Results = [];
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
    async sendBirthdayGreeting(dto, UserId) {
        const Customer = await this.prisma.customer.findUnique({
            where: { ID: dto.CustomerId },
        });
        if (!Customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const message = `Selamat ulang tahun, ${Customer.Name}! 🎂🎉 Semoga tahun ini penuh kebahagiaan dan kesehatan. Selamat berbelanja di Toko CV IndoMurah dan nikmati promo spesial untuk Anda!`;
        const Results = { CustomerId: dto.CustomerId };
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
    async sendPromotion(dto, UserId) {
        let Customers = [];
        if (dto.CustomerIds && dto.CustomerIds.length > 0) {
            Customers = await this.prisma.customer.findMany({
                where: { ID: { in: dto.CustomerIds } },
                select: { ID: true, Phone: true, Name: true },
            });
        }
        else if (dto.CustomerGroupId) {
            Customers = await this.prisma.customer.findMany({
                where: { CustomerGroupID: dto.CustomerGroupId, IsActive: true },
                select: { ID: true, Phone: true, Name: true },
            });
        }
        else {
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
            errors: [],
        };
        for (const Customer of Customers) {
            if (!Customer.Phone)
                continue;
            try {
                if (dto.Method === 'WHATSAPP' || dto.Method === 'BOTH') {
                    await this.sendWhatsApp({
                        PhoneNumber: Customer.Phone,
                        Message: message.replace('{Name}', Customer.Name),
                        MediaUrl: dto.MediaUrl,
                    }, UserId);
                }
                else {
                    await this.sendSms({
                        PhoneNumber: Customer.Phone,
                        Message: message.replace('{Name}', Customer.Name),
                        ScheduledAt: dto.ScheduledAt,
                    }, UserId);
                }
                Results.sent++;
            }
            catch (error) {
                Results.failed++;
                Results.errors.push(`${Customer.Name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        return {
            success: true,
            ...Results,
        };
    }
    async createTemplate(dto, UserId) {
        const existing = await this.prisma.notificationTemplate.findFirst({
            where: { Code: dto.Code },
        });
        if (existing) {
            throw new common_1.BadRequestException('Template Code already exists');
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
    async listTemplates(channel) {
        const where = { IsActive: true };
        if (channel)
            where.Channel = channel;
        const templates = await this.prisma.notificationTemplate.findMany({
            where,
            orderBy: { Name: 'asc' },
        });
        return templates.map((t) => this.formatTemplate(t));
    }
    async getNotificationLogs(dto) {
        const where = {};
        if (dto.Channel)
            where.Channel = dto.Channel;
        if (dto.Status)
            where.Status = dto.Status;
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
    async getNotificationStats(startDate, endDate) {
        const where = {};
        if (startDate || endDate) {
            where.CreatedAt = {};
            if (startDate)
                where.CreatedAt.gte = new Date(startDate);
            if (endDate)
                where.CreatedAt.lte = new Date(endDate);
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
    async configureSmsGateway(dto, UserId) {
        if (dto.IsDefault) {
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
    async configureWhatsAppGateway(dto, UserId) {
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
    async listGateways() {
        const gateways = await this.prisma.notificationGateway.findMany({
            orderBy: [{ IsDefault: 'desc' }, { Name: 'asc' }],
        });
        return gateways.map((g) => this.formatGateway(g));
    }
    async processSmsNotification(notificationId, phoneNumber, message) {
        try {
            await this.prisma.notificationLog.update({
                where: { ID: notificationId },
                data: {
                    Status: 'SENT',
                    SentAt: new Date(),
                    ExternalId: `SMS-${Date.now()}`,
                },
            });
            setTimeout(async () => {
                await this.prisma.notificationLog.update({
                    where: { ID: notificationId },
                    data: { Status: 'DELIVERED', DeliveredAt: new Date() },
                }).catch(() => { });
            }, 2000);
            return { success: true };
        }
        catch (error) {
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
    async processWhatsAppNotification(notificationId, phoneNumber, message, mediaUrl) {
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
                }).catch(() => { });
            }, 2000);
            return { success: true };
        }
        catch (error) {
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
    formatPhoneNumber(phone) {
        let digits = phone.replace(/\D/g, '');
        if (!digits.startsWith('62') && !digits.startsWith('+62')) {
            if (digits.startsWith('0')) {
                digits = '62' + digits.substring(1);
            }
            else if (digits.startsWith('8')) {
                digits = '62' + digits;
            }
        }
        return digits + '@c.us';
    }
    formatCurrency(Amount) {
        return new Intl.NumberFormat('ID-ID').format(Amount);
    }
    formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString('ID-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    }
    formatTemplate(template) {
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
    formatGateway(gateway) {
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
};
exports.NotificationGatewayService = NotificationGatewayService;
exports.NotificationGatewayService = NotificationGatewayService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationGatewayService);
