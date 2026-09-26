import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Put, Param, Body, Query } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { DailySalesSummaryService } from './daily-sales-summary.service';
import { CreateDailySalesSummaryDto, UpdateDailySalesSummaryDto } from './dto/daily-sales-summary.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';

@ApiTags('DailySalesSummarys')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('daily-sales-summary')
export class DailySalesSummaryController extends BaseController<
  any,
  CreateDailySalesSummaryDto,
  UpdateDailySalesSummaryDto
> {
  constructor(dailySalesSummaryService: DailySalesSummaryService) {
    super(dailySalesSummaryService, {
      modelName: 'DailySalesSummary',
      pluralName: 'DailySalesSummarys',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'daily-sales-summary',
    });
  }

  // GET endpoints
  @Get()
  @ApiOperation({ summary: 'Get all DailySalesSummarys with OData query support' })
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
  @ApiOperation({ summary: 'Get count of DailySalesSummarys' })
  async getCount(@Query() query: any) {
    return super.getCount(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get DailySalesSummary by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return super.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get DailySalesSummary by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return super.findByField(field, value, query);
  }

  // POST endpoints
  @Post()
  @ApiOperation({ summary: 'Create new DailySalesSummary' })
  async create(@Body() dto: CreateDailySalesSummaryDto) {
    return super.create(dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple DailySalesSummarys' })
  async createBulk(@Body() dtos: CreateDailySalesSummaryDto[]) {
    return super.createBulk(dtos);
  }

  // PATCH endpoints
  @Patch(':id')
  @ApiOperation({ summary: 'Update DailySalesSummary by ID' })
  async patchById(@Param('id') id: string, @Body() dto: UpdateDailySalesSummaryDto) {
    return super.patchById(id, dto);
  }

  @Patch('by/:field/:value')
  @ApiOperation({ summary: 'Update DailySalesSummarys by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: UpdateDailySalesSummaryDto,
  ) {
    return super.patchByFilterReference(field, value, dto);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple DailySalesSummarys' })
  async patchBulk(@Body() body: { ids: number[]; data: Partial<UpdateDailySalesSummaryDto> }) {
    return super.patchBulk(body);
  }

  // PUT (UPSERT) endpoints
  @Put()
  @ApiOperation({ summary: 'Upsert DailySalesSummary' })
  async upsert(@Body() body: { where: { id: number }; create: CreateDailySalesSummaryDto; update: Partial<UpdateDailySalesSummaryDto> }) {
    return super.upsert(body);
  }

  @Put('by/:field')
  @ApiOperation({ summary: 'Upsert DailySalesSummary by field reference' })
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreateDailySalesSummaryDto; update: Partial<UpdateDailySalesSummaryDto> },
  ) {
    return super.upsertByFilterReference(field, body);
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert DailySalesSummarys' })
  async upsertBulk(@Body() body: { items: any[] }) {
    return super.upsertBulk(body);
  }

  // DELETE endpoints
  @Delete(':id')
  @ApiOperation({ summary: 'Delete DailySalesSummary by ID' })
  async deleteById(@Param('id') id: string) {
    return super.deleteById(id);
  }

  @Delete('by/:field/:value')
  @ApiOperation({ summary: 'Delete DailySalesSummarys by field reference' })
  async deleteByFilterReference(@Param('field') field: string, @Param('value') value: string) {
    return super.deleteByFilterReference(field, value);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple DailySalesSummarys' })
  async deleteBulk(@Body() body: { ids: (number | string)[] }) {
    return super.deleteBulk(body);
  }
}
