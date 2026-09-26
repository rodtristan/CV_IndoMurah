import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Put, Param, Body, Query } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { NotificationService } from './notification.service';
import { CreateNotificationDto, UpdateNotificationDto } from './dto/notification.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController extends BaseController<
  any,
  CreateNotificationDto,
  UpdateNotificationDto
> {
  constructor(private readonly notificationService: NotificationService) {
    super(notificationService, {
      modelName: 'Notification',
      pluralName: 'Notifications',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'notifications',
    });
  }

  // GET endpoints
  @Get()
  @ApiOperation({ summary: 'Get all Notifications with OData query support' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations' })
  @ApiQuery({ name: '$where[field]', required: false, description: 'Filter by field' })
  @ApiQuery({ name: '$orderBy[field]', required: false, description: 'Sort: asc/desc' })
  @ApiQuery({ name: '$skip', required: false, type: Number, description: 'Offset' })
  @ApiQuery({ name: '$take', required: false, type: Number, description: 'Limit' })
  @ApiQuery({ name: '$search', required: false, description: 'Search keyword' })
  async findAll(@Query() query: any) {
    return super.findAll(query);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get count of Notifications' })
  async getCount(@Query() query: any) {
    return super.getCount(query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count for the current user' })
  async unreadCount(@CurrentUser() user: any) {
    const count = await this.notificationService.unreadCount(user.id);
    return { success: true, data: { count } };
  }

  @Patch('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read for the current user' })
  async markAllRead(@CurrentUser() user: any) {
    const data = await this.notificationService.markAllRead(user.id);
    return { success: true, data, message: 'All notifications marked as read' };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark one notification as read' })
  async markRead(@Param('id') id: string) {
    const data = await this.notificationService.markRead(Number(id));
    return { success: true, data, message: 'Notification marked as read' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Notification by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return super.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get Notification by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return super.findByField(field, value, query);
  }

  // POST endpoints
  @Post()
  @ApiOperation({ summary: 'Create new Notification' })
  async create(@Body() dto: CreateNotificationDto) {
    const data = await this.notificationService.createNotification(dto);
    return { success: true, data, message: 'Notification created successfully' };
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple Notifications' })
  async createBulk(@Body() dtos: CreateNotificationDto[]) {
    return super.createBulk(dtos);
  }

  // PATCH endpoints
  @Patch(':id')
  @ApiOperation({ summary: 'Update Notification by ID' })
  async patchById(@Param('id') id: string, @Body() dto: UpdateNotificationDto) {
    return super.patchById(id, dto);
  }

  @Patch('by/:field/:value')
  @ApiOperation({ summary: 'Update Notifications by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: UpdateNotificationDto,
  ) {
    return super.patchByFilterReference(field, value, dto);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple Notifications' })
  async patchBulk(@Body() body: { ids: number[]; data: Partial<UpdateNotificationDto> }) {
    return super.patchBulk(body);
  }

  // PUT (UPSERT) endpoints
  @Put()
  @ApiOperation({ summary: 'Upsert Notification' })
  async upsert(@Body() body: { where: { id: number }; create: CreateNotificationDto; update: Partial<UpdateNotificationDto> }) {
    return super.upsert(body);
  }

  @Put('by/:field')
  @ApiOperation({ summary: 'Upsert Notification by field reference' })
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreateNotificationDto; update: Partial<UpdateNotificationDto> },
  ) {
    return super.upsertByFilterReference(field, body);
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert Notifications' })
  async upsertBulk(@Body() body: { items: any[] }) {
    return super.upsertBulk(body);
  }

  // DELETE endpoints
  @Delete(':id')
  @ApiOperation({ summary: 'Delete Notification by ID' })
  async deleteById(@Param('id') id: string) {
    return super.deleteById(id);
  }

  @Delete('by/:field/:value')
  @ApiOperation({ summary: 'Delete Notifications by field reference' })
  async deleteByFilterReference(@Param('field') field: string, @Param('value') value: string) {
    return super.deleteByFilterReference(field, value);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple Notifications' })
  async deleteBulk(@Body() body: { ids: (number | string)[] }) {
    return super.deleteBulk(body);
  }
}
