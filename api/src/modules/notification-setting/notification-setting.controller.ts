import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Put, Param, Body, Query } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { NotificationSettingService } from './notification-setting.service';
import { CreateNotificationSettingDto, UpdateNotificationSettingDto } from './dto/notification-setting.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';

@ApiTags('NotificationSettings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notification-setting')
export class NotificationSettingController extends BaseController<
  any,
  CreateNotificationSettingDto,
  UpdateNotificationSettingDto
> {
  constructor(notificationSettingService: NotificationSettingService) {
    super(notificationSettingService, {
      modelName: 'NotificationSetting',
      pluralName: 'NotificationSettings',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'notification-setting',
    });
  }

  // GET endpoints
  @Get()
  @ApiOperation({ summary: 'Get all NotificationSettings with OData query support' })
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
  @ApiOperation({ summary: 'Get count of NotificationSettings' })
  async getCount(@Query() query: any) {
    return super.getCount(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get NotificationSetting by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return super.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get NotificationSetting by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return super.findByField(field, value, query);
  }

  // POST endpoints
  @Post()
  @ApiOperation({ summary: 'Create new NotificationSetting' })
  async create(@Body() dto: CreateNotificationSettingDto) {
    return super.create(dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple NotificationSettings' })
  async createBulk(@Body() dtos: CreateNotificationSettingDto[]) {
    return super.createBulk(dtos);
  }

  // PATCH endpoints
  @Patch(':id')
  @ApiOperation({ summary: 'Update NotificationSetting by ID' })
  async patchById(@Param('id') id: string, @Body() dto: Partial<UpdateNotificationSettingDto>) {
    return super.patchById(id, dto);
  }

  @Patch('by/:field/:value')
  @ApiOperation({ summary: 'Update NotificationSettings by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: Partial<UpdateNotificationSettingDto>,
  ) {
    return super.patchByFilterReference(field, value, dto);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple NotificationSettings' })
  async patchBulk(@Body() body: { ids: number[]; data: Partial<UpdateNotificationSettingDto> }) {
    return super.patchBulk(body);
  }

  // PUT (UPSERT) endpoints
  @Put()
  @ApiOperation({ summary: 'Upsert NotificationSetting' })
  async upsert(@Body() body: { where: { id: number }; create: CreateNotificationSettingDto; update: Partial<UpdateNotificationSettingDto> }) {
    return super.upsert(body);
  }

  @Put('by/:field')
  @ApiOperation({ summary: 'Upsert NotificationSetting by field reference' })
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreateNotificationSettingDto; update: Partial<UpdateNotificationSettingDto> },
  ) {
    return super.upsertByFilterReference(field, body);
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert NotificationSettings' })
  async upsertBulk(@Body() body: { items: any[] }) {
    return super.upsertBulk(body);
  }

  // DELETE endpoints
  @Delete(':id')
  @ApiOperation({ summary: 'Delete NotificationSetting by ID' })
  async deleteById(@Param('id') id: string) {
    return super.deleteById(id);
  }

  @Delete('by/:field/:value')
  @ApiOperation({ summary: 'Delete NotificationSettings by field reference' })
  async deleteByFilterReference(@Param('field') field: string, @Param('value') value: string) {
    return super.deleteByFilterReference(field, value);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple NotificationSettings' })
  async deleteBulk(@Body() body: { ids: (number | string)[] }) {
    return super.deleteBulk(body);
  }
}
