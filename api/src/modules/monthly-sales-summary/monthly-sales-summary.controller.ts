import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Put, Param, Body, Query } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { MonthlySalesSummaryService } from './monthly-sales-summary.service';
import { CreateMonthlySalesSummaryDto, UpdateMonthlySalesSummaryDto } from './dto/monthly-sales-summary.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';

@ApiTags('MonthlySalesSummarys')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('monthly-sales-summary')
export class MonthlySalesSummaryController extends BaseController<
  any,
  CreateMonthlySalesSummaryDto,
  UpdateMonthlySalesSummaryDto
> {
  constructor(monthlySalesSummaryService: MonthlySalesSummaryService) {
    super(monthlySalesSummaryService, {
      modelName: 'MonthlySalesSummary',
      pluralName: 'MonthlySalesSummarys',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'monthly-sales-summary',
    });
  }

  // GET endpoints
  @Get()
  @ApiOperation({ summary: 'Get all MonthlySalesSummarys with OData query support' })
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
  @ApiOperation({ summary: 'Get count of MonthlySalesSummarys' })
  async getCount(@Query() query: any) {
    return super.getCount(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get MonthlySalesSummary by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return super.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get MonthlySalesSummary by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return super.findByField(field, value, query);
  }

  // POST endpoints
  @Post()
  @ApiOperation({ summary: 'Create new MonthlySalesSummary' })
  async create(@Body() dto: CreateMonthlySalesSummaryDto) {
    return super.create(dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple MonthlySalesSummarys' })
  async createBulk(@Body() dtos: CreateMonthlySalesSummaryDto[]) {
    return super.createBulk(dtos);
  }

  // PATCH endpoints
  @Patch(':id')
  @ApiOperation({ summary: 'Update MonthlySalesSummary by ID' })
  async patchById(@Param('id') id: string, @Body() dto: UpdateMonthlySalesSummaryDto) {
    return super.patchById(id, dto);
  }

  @Patch('by/:field/:value')
  @ApiOperation({ summary: 'Update MonthlySalesSummarys by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: UpdateMonthlySalesSummaryDto,
  ) {
    return super.patchByFilterReference(field, value, dto);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple MonthlySalesSummarys' })
  async patchBulk(@Body() body: { ids: number[]; data: Partial<UpdateMonthlySalesSummaryDto> }) {
    return super.patchBulk(body);
  }

  // PUT (UPSERT) endpoints
  @Put()
  @ApiOperation({ summary: 'Upsert MonthlySalesSummary' })
  async upsert(@Body() body: { where: { id: number }; create: CreateMonthlySalesSummaryDto; update: Partial<UpdateMonthlySalesSummaryDto> }) {
    return super.upsert(body);
  }

  @Put('by/:field')
  @ApiOperation({ summary: 'Upsert MonthlySalesSummary by field reference' })
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreateMonthlySalesSummaryDto; update: Partial<UpdateMonthlySalesSummaryDto> },
  ) {
    return super.upsertByFilterReference(field, body);
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert MonthlySalesSummarys' })
  async upsertBulk(@Body() body: { items: any[] }) {
    return super.upsertBulk(body);
  }

  // DELETE endpoints
  @Delete(':id')
  @ApiOperation({ summary: 'Delete MonthlySalesSummary by ID' })
  async deleteById(@Param('id') id: string) {
    return super.deleteById(id);
  }

  @Delete('by/:field/:value')
  @ApiOperation({ summary: 'Delete MonthlySalesSummarys by field reference' })
  async deleteByFilterReference(@Param('field') field: string, @Param('value') value: string) {
    return super.deleteByFilterReference(field, value);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple MonthlySalesSummarys' })
  async deleteBulk(@Body() body: { ids: (number | string)[] }) {
    return super.deleteBulk(body);
  }
}
