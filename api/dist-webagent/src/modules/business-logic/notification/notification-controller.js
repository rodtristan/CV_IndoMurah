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
exports.NotificationController = void 0;
const common_1 = require("@nestjs/common");
const notification_service_1 = require("./notification-service");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth-guard");
const current_user_decorator_1 = require("../../../common/decorators/current-user-decorator");
const notification_dto_1 = require("./notification.dto");
let NotificationController = class NotificationController {
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    async createNotification(dto, userId) {
        return this.notificationService.createNotification(dto, userId);
    }
    async createBulkNotification(dto, userId) {
        return this.notificationService.createBulkNotification(dto, userId);
    }
    async listNotifications(dto) {
        return this.notificationService.listNotifications(dto);
    }
    async getNotificationSummary(userId) {
        return this.notificationService.getNotificationSummary(userId);
    }
    async getNotificationTypes() {
        return this.notificationService.getNotificationTypes();
    }
    async getNotificationSettings(userId, currentUserId) {
        if (userId !== currentUserId)
            throw new common_1.ForbiddenException('Tidak boleh mengakses pengaturan user lain');
        return this.notificationService.getNotificationSettings(userId);
    }
    async getNotification(id) {
        return this.notificationService.getNotification(id);
    }
    async markAsRead(dto, userId) {
        return this.notificationService.markAsRead(dto, userId);
    }
    async markAllAsRead(userId) {
        return this.notificationService.markAllAsRead(userId);
    }
    async updateNotificationSettings(userId, typeId, dto, currentUserId) {
        if (userId !== currentUserId)
            throw new common_1.ForbiddenException('Tidak boleh mengubah pengaturan user lain');
        return this.notificationService.updateNotificationSettings({ ...dto, UserId: userId }, typeId);
    }
    async deleteNotification(id, userId) {
        return this.notificationService.deleteNotification(id, userId);
    }
    async deleteReadNotifications(userId) {
        return this.notificationService.deleteReadNotifications(userId);
    }
};
exports.NotificationController = NotificationController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [notification_dto_1.CreateNotificationDto, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "createNotification", null);
__decorate([
    (0, common_1.Post)('bulk'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [notification_dto_1.BulkNotificationDto, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "createBulkNotification", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [notification_dto_1.NotificationFilterDto]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "listNotifications", null);
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getNotificationSummary", null);
__decorate([
    (0, common_1.Get)('types'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getNotificationTypes", null);
__decorate([
    (0, common_1.Get)('settings/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getNotificationSettings", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getNotification", null);
__decorate([
    (0, common_1.Post)('mark-read'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [notification_dto_1.MarkReadDto, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Post)('mark-all-read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markAllAsRead", null);
__decorate([
    (0, common_1.Put)('settings/:userId/:typeId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('typeId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, notification_dto_1.UpdateNotificationSettingsDto, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "updateNotificationSettings", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "deleteNotification", null);
__decorate([
    (0, common_1.Delete)('read/all'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "deleteReadNotifications", null);
exports.NotificationController = NotificationController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('business-logic/notifications'),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationController);
