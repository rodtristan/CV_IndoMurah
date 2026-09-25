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
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma-service");
const client_1 = require("@prisma/client");
let NotificationService = class NotificationService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createNotification(dto, UserId) {
        const notification = await this.prisma.notification.create({
            data: {
                UserID: dto.UserId,
                Title: dto.Title,
                Message: dto.Message,
                TypeID: dto.TypeId || 1,
                ReferenceType: dto.ReferenceType,
                ReferenceID: dto.ReferenceId,
            },
            include: {
                Type: true,
            },
        });
        return {
            success: true,
            notification: this.formatNotification(notification),
        };
    }
    async createBulkNotification(dto, createdById) {
        const Notifications = await this.prisma.notification.createMany({
            data: dto.UserIds.map((UserId) => ({
                UserID: UserId,
                Title: dto.Title,
                Message: dto.Message,
                TypeID: dto.TypeId || 1,
            })),
        });
        return {
            success: true,
            Count: Notifications.count,
        };
    }
    async getNotification(notificationId) {
        const notification = await this.prisma.notification.findUnique({
            where: { ID: notificationId },
            include: {
                Type: true,
                User: true,
            },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        return this.formatNotification(notification);
    }
    async listNotifications(dto) {
        const where = {};
        if (dto.UserId) {
            where.UserID = dto.UserId;
        }
        if (dto.TypeId) {
            where.TypeID = dto.TypeId;
        }
        if (dto.UnreadOnly) {
            where.IsRead = false;
        }
        const page = dto.Page || 1;
        const limit = dto.Limit || 20;
        const skip = (page - 1) * limit;
        const [Notifications, Total, unreadCount] = await Promise.all([
            this.prisma.notification.findMany({
                where,
                include: {
                    Type: true,
                    User: true,
                },
                orderBy: { CreatedAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.notification.count({ where }),
            this.prisma.notification.count({
                where: { ...where, IsRead: false },
            }),
        ]);
        return {
            data: Notifications.map((n) => this.formatNotification(n)),
            unreadCount,
            pagination: {
                page: dto.Page || 1,
                limit: dto.Limit || 20,
                Total,
                TotalPages: Math.ceil(Total / limit),
            },
        };
    }
    async markAsRead(dto, UserId) {
        await this.prisma.notification.updateMany({
            where: {
                ID: { in: dto.NotificationIds },
                UserID: UserId,
            },
            data: {
                IsRead: true,
            },
        });
        return {
            success: true,
            message: `${dto.NotificationIds.length} Notifications marked as read`,
        };
    }
    async markAllAsRead(UserId) {
        const Result = await this.prisma.notification.updateMany({
            where: {
                UserID: UserId,
                IsRead: false,
            },
            data: {
                IsRead: true,
            },
        });
        return {
            success: true,
            Count: Result.count,
        };
    }
    async deleteNotification(notificationId, UserId) {
        const notification = await this.prisma.notification.findUnique({
            where: { ID: notificationId },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        if (notification.UserID !== UserId) {
            throw new common_1.NotFoundException('Notification not found');
        }
        await this.prisma.notification.delete({
            where: { ID: notificationId },
        });
        return {
            success: true,
            message: 'Notification deleted',
        };
    }
    async deleteReadNotifications(UserId) {
        const Result = await this.prisma.notification.deleteMany({
            where: {
                UserID: UserId,
                IsRead: true,
            },
        });
        return {
            success: true,
            Count: Result.count,
        };
    }
    async getNotificationSettings(UserId) {
        const settings = await this.prisma.notificationSetting.findMany({
            where: { UserID: UserId },
            include: {
                Type: true,
            },
        });
        const allTypes = await this.prisma.notificationType.findMany({
            where: { IsActive: true },
        });
        return {
            settings: settings.map((s) => ({
                TypeId: s.TypeID,
                TypeName: s.Type?.Name,
                emailEnabled: s.EmailEnabled,
                pushEnabled: s.PushEnabled,
                inAppEnabled: s.InAppEnabled,
                threshold: s.Threshold ? Number(s.Threshold) : null,
            })),
            allTypes: allTypes.map((t) => ({
                ID: t.ID,
                Code: t.Code,
                Name: t.Name,
                Description: t.Description,
                icon: t.Icon,
                color: t.Color,
            })),
        };
    }
    async updateNotificationSettings(dto, TypeId) {
        const setting = await this.prisma.notificationSetting.upsert({
            where: {
                UserID_TypeID: {
                    UserID: dto.UserId,
                    TypeID: TypeId,
                },
            },
            create: {
                UserID: dto.UserId,
                TypeID: TypeId,
                EmailEnabled: dto.EmailEnabled ?? true,
                PushEnabled: dto.PushEnabled ?? true,
                InAppEnabled: dto.InAppEnabled ?? true,
                Threshold: dto.Threshold ? new client_1.Prisma.Decimal(dto.Threshold) : null,
            },
            update: {
                EmailEnabled: dto.EmailEnabled,
                PushEnabled: dto.PushEnabled,
                InAppEnabled: dto.InAppEnabled,
                Threshold: dto.Threshold ? new client_1.Prisma.Decimal(dto.Threshold) : null,
            },
        });
        return {
            success: true,
            setting: {
                TypeId: setting.TypeID,
                emailEnabled: setting.EmailEnabled,
                pushEnabled: setting.PushEnabled,
                inAppEnabled: setting.InAppEnabled,
                threshold: setting.Threshold ? Number(setting.Threshold) : null,
            },
        };
    }
    async getNotificationTypes() {
        const Types = await this.prisma.notificationType.findMany({
            where: { IsActive: true },
            orderBy: { SortOrder: 'asc' },
        });
        return Types.map((t) => ({
            ID: t.ID,
            Code: t.Code,
            Name: t.Name,
            Description: t.Description,
            icon: t.Icon,
            color: t.Color,
        }));
    }
    async getNotificationSummary(UserId) {
        const [unread, Total, today] = await Promise.all([
            this.prisma.notification.count({
                where: { UserID: UserId, IsRead: false },
            }),
            this.prisma.notification.count({
                where: { UserID: UserId },
            }),
            this.prisma.notification.count({
                where: {
                    UserID: UserId,
                    CreatedAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    },
                },
            }),
        ]);
        return {
            unread,
            Total,
            today,
        };
    }
    formatNotification(notification) {
        return {
            ID: notification.ID,
            UserId: notification.UserID,
            UserName: notification.User?.Name,
            title: notification.Title,
            message: notification.Message,
            TypeId: notification.TypeID,
            Type: notification.Type
                ? {
                    ID: notification.Type.ID,
                    Code: notification.Type.Code,
                    Name: notification.Type.Name,
                    icon: notification.Type.Icon,
                    color: notification.Type.Color,
                }
                : null,
            referenceType: notification.ReferenceType,
            referenceId: notification.ReferenceID,
            IsRead: notification.IsRead,
            createdAt: notification.CreatedAt,
        };
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationService);
