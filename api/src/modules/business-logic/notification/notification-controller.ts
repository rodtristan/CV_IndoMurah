import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards, ForbiddenException } from '@nestjs/common';
import { NotificationService } from './notification-service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../../common/decorators/current-user-decorator';
import {
  CreateNotificationDto,
  NotificationFilterDto,
  MarkReadDto,
  UpdateNotificationSettingsDto,
  BulkNotificationDto,
} from './notification.dto';

@UseGuards(JwtAuthGuard)
@Controller('business-logic/notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  async createNotification(
    @Body() dto: CreateNotificationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.notificationService.createNotification(dto, userId);
  }

  @Post('bulk')
  async createBulkNotification(
    @Body() dto: BulkNotificationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.notificationService.createBulkNotification(dto, userId);
  }

  @Get()
  async listNotifications(@Query() dto: NotificationFilterDto) {
    return this.notificationService.listNotifications(dto);
  }

  @Get('summary')
  async getNotificationSummary(@CurrentUser('id') userId: string) {
    return this.notificationService.getNotificationSummary(userId);
  }

  @Get('types')
  async getNotificationTypes() {
    return this.notificationService.getNotificationTypes();
  }

  @Get('settings/:userId')
  async getNotificationSettings(@Param('userId') userId: string, @CurrentUser('id') currentUserId: string) {
    // Hanya boleh membaca pengaturan milik sendiri.
    if (userId !== currentUserId) throw new ForbiddenException('Tidak boleh mengakses pengaturan user lain');
    return this.notificationService.getNotificationSettings(userId);
  }

  @Get(':id')
  async getNotification(@Param('id', ParseIntPipe) id: number) {
    return this.notificationService.getNotification(id);
  }

  @Post('mark-read')
  async markAsRead(
    @Body() dto: MarkReadDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.notificationService.markAsRead(dto, userId);
  }

  @Post('mark-all-read')
  async markAllAsRead(@CurrentUser('id') userId: string) {
    return this.notificationService.markAllAsRead(userId);
  }

  @Put('settings/:userId/:typeId')
  async updateNotificationSettings(
    @Param('userId') userId: string,
    @Param('typeId', ParseIntPipe) typeId: number,
    @Body() dto: UpdateNotificationSettingsDto,
    @CurrentUser('id') currentUserId: string,
  ) {
    if (userId !== currentUserId) throw new ForbiddenException('Tidak boleh mengubah pengaturan user lain');
    return this.notificationService.updateNotificationSettings({ ...dto, UserId: userId}, typeId);
  }

  @Delete(':id')
  async deleteNotification(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: string,
  ) {
    return this.notificationService.deleteNotification(id, userId);
  }

  @Delete('read/all')
  async deleteReadNotifications(@CurrentUser('id') userId: string) {
    return this.notificationService.deleteReadNotifications(userId);
  }
}
