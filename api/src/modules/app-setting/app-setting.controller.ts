import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Put, Param, Body, Query } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { AppSettingService } from './app-setting.service';
import { CreateAppSettingDto, UpdateAppSettingDto } from './dto/app-setting.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';

@ApiTags('AppSettings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('app-setting')
export class AppSettingController extends BaseController<
  any,
  CreateAppSettingDto,
  UpdateAppSettingDto
> {
  constructor(appSettingService: AppSettingService) {
    super(appSettingService, {
      modelName: 'AppSetting',
      pluralName: 'AppSettings',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'app-setting',
    });
  }

  // GET endpoints
  @Get()
  @ApiOperation({ summary: 'Get all AppSettings with OData query support' })
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
  @ApiOperation({ summary: 'Get count of AppSettings' })
  async getCount(@Query() query: any) {
    return super.getCount(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get AppSetting by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return super.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get AppSetting by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return super.findByField(field, value, query);
  }

  // POST endpoints
  @Post()
  @ApiOperation({ summary: 'Create new AppSetting' })
  async create(@Body() dto: CreateAppSettingDto) {
    return super.create(dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple AppSettings' })
  async createBulk(@Body() dtos: CreateAppSettingDto[]) {
    return super.createBulk(dtos);
  }

  // PATCH endpoints
  @Patch(':id')
  @ApiOperation({ summary: 'Update AppSetting by ID' })
  async patchById(@Param('id') id: string, @Body() dto: Partial<UpdateAppSettingDto>) {
    return super.patchById(id, dto);
  }

  @Patch('by/:field/:value')
  @ApiOperation({ summary: 'Update AppSettings by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: Partial<UpdateAppSettingDto>,
  ) {
    return super.patchByFilterReference(field, value, dto);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple AppSettings' })
  async patchBulk(@Body() body: { ids: number[]; data: Partial<UpdateAppSettingDto> }) {
    return super.patchBulk(body);
  }

  // PUT (UPSERT) endpoints
  @Put()
  @ApiOperation({ summary: 'Upsert AppSetting' })
  async upsert(@Body() body: { where: { id: number }; create: CreateAppSettingDto; update: Partial<UpdateAppSettingDto> }) {
    return super.upsert(body);
  }

  @Put('by/:field')
  @ApiOperation({ summary: 'Upsert AppSetting by field reference' })
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreateAppSettingDto; update: Partial<UpdateAppSettingDto> },
  ) {
    return super.upsertByFilterReference(field, body);
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert AppSettings' })
  async upsertBulk(@Body() body: { items: any[] }) {
    return super.upsertBulk(body);
  }

  // DELETE endpoints
  @Delete(':id')
  @ApiOperation({ summary: 'Delete AppSetting by ID' })
  async deleteById(@Param('id') id: string) {
    return super.deleteById(id);
  }

  @Delete('by/:field/:value')
  @ApiOperation({ summary: 'Delete AppSettings by field reference' })
  async deleteByFilterReference(@Param('field') field: string, @Param('value') value: string) {
    return super.deleteByFilterReference(field, value);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple AppSettings' })
  async deleteBulk(@Body() body: { ids: (number | string)[] }) {
    return super.deleteBulk(body);
  }
}
