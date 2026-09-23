import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { NotificationService } from './notification-service';
import {
  CreateNotificationDto,
  NotificationFilterDto,
  MarkReadDto,
  UpdateNotificationSettingsDto,
  BulkNotificationDto,
} from './notification.dto';

@Controller('business-logic/notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  async createNotification(
    @Body() dto: CreateNotificationDto,
    @Query('userId') userId: string = 'system',
  ) {
    return this.notificationService.createNotification(dto, userId);
  }

  @Post('bulk')
  async createBulkNotification(
    @Body() dto: BulkNotificationDto,
    @Query('userId') userId: string = 'system',
  ) {
    return this.notificationService.createBulkNotification(dto, userId);
  }

  @Get()
  async listNotifications(@Query() dto: NotificationFilterDto) {
    return this.notificationService.listNotifications(dto);
  }

  @Get('summary')
  async getNotificationSummary(@Query('userId') userId: string) {
    return this.notificationService.getNotificationSummary(userId);
  }

  @Get('types')
  async getNotificationTypes() {
    return this.notificationService.getNotificationTypes();
  }

  @Get('settings/:userId')
  async getNotificationSettings(@Param('userId') userId: string) {
    return this.notificationService.getNotificationSettings(userId);
  }

  @Get(':id')
  async getNotification(@Param('id', ParseIntPipe) id: number) {
    return this.notificationService.getNotification(id);
  }

  @Post('mark-read')
  async markAsRead(
    @Body() dto: MarkReadDto,
    @Query('userId') userId: string,
  ) {
    return this.notificationService.markAsRead(dto, userId);
  }

  @Post('mark-all-read')
  async markAllAsRead(@Query('userId') userId: string) {
    return this.notificationService.markAllAsRead(userId);
  }

  @Put('settings/:userId/:typeId')
  async updateNotificationSettings(
    @Param('userId') userId: string,
    @Param('typeId', ParseIntPipe) typeId: number,
    @Body() dto: UpdateNotificationSettingsDto,
  ) {
    return this.notificationService.updateNotificationSettings({ ...dto, UserId: userId}, typeId);
  }

  @Delete(':id')
  async deleteNotification(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId') userId: string,
  ) {
    return this.notificationService.deleteNotification(id, userId);
  }

  @Delete('read/all')
  async deleteReadNotifications(@Query('userId') userId: string) {
    return this.notificationService.deleteReadNotifications(userId);
  }
}
