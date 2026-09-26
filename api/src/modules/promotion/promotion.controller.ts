import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Put, Param, Body, Query } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { PromotionService } from './promotion.service';
import { CreatePromotionDto, UpdatePromotionDto } from './dto/promotion.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';

@ApiTags('Promotion')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('promotion')
export class PromotionController extends BaseController<
  any,
  CreatePromotionDto,
  UpdatePromotionDto
> {
  constructor(promotionService: PromotionService) {
    super(promotionService, {
      modelName: 'Promotion',
      pluralName: 'Promotions',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'promotion',
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all Promotions with OData query support' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields' })
  @ApiQuery({ name: '$where[field]', required: false, description: 'Filter by field' })
  @ApiQuery({ name: '$where[type]', required: false, description: 'Filter by type' })
  @ApiQuery({ name: '$orderBy[field]', required: false, description: 'Sort: asc/desc' })
  @ApiQuery({ name: '$skip', required: false, type: Number, description: 'Offset' })
  @ApiQuery({ name: '$take', required: false, type: Number, description: 'Limit' })
  @ApiQuery({ name: '$search', required: false, description: 'Search: code, name' })
  async findAll(@Query() query: any) {
    return super.findAll(query);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get count of Promotions' })
  async getCount(@Query() query: any) {
    return super.getCount(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Promotion by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return super.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get Promotion by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return super.findByField(field, value, query);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active promotions (current date within start/end date)' })
  async getActivePromotions(@Query() query: any) {
    const now = new Date();
    query.$where = query.$where || {};
    query.$where.startDate = { lte: now };
    query.$where.endDate = { gte: now };
    query.$where.isActive = true;
    return super.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create new Promotion' })
  async create(@Body() dto: CreatePromotionDto) {
    return super.create(dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple Promotions' })
  async createBulk(@Body() dtos: CreatePromotionDto[]) {
    return super.createBulk(dtos);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Promotion by ID' })
  async patchById(@Param('id') id: string, @Body() dto: UpdatePromotionDto) {
    return super.patchById(id, dto);
  }

  @Patch('by/:field/:value')
  @ApiOperation({ summary: 'Update Promotions by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: UpdatePromotionDto,
  ) {
    return super.patchByFilterReference(field, value, dto);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple Promotions' })
  async patchBulk(@Body() body: { ids: number[]; data: Partial<UpdatePromotionDto> }) {
    return super.patchBulk(body);
  }

  @Put()
  @ApiOperation({ summary: 'Upsert Promotion' })
  async upsert(@Body() body: { where: { id: number }; create: CreatePromotionDto; update: Partial<UpdatePromotionDto> }) {
    return super.upsert(body);
  }

  @Put('by/:field')
  @ApiOperation({ summary: 'Upsert Promotion by field reference' })
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreatePromotionDto; update: Partial<UpdatePromotionDto> },
  ) {
    return super.upsertByFilterReference(field, body);
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert Promotions' })
  async upsertBulk(@Body() body: { items: any[] }) {
    return super.upsertBulk(body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Promotion by ID' })
  async deleteById(@Param('id') id: string) {
    return super.deleteById(id);
  }

  @Delete('by/:field/:value')
  @ApiOperation({ summary: 'Delete Promotions by field reference' })
  async deleteByFilterReference(@Param('field') field: string, @Param('value') value: string) {
    return super.deleteByFilterReference(field, value);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple Promotions' })
  async deleteBulk(@Body() body: { ids: number[] }) {
    return super.deleteBulk(body);
  }
}
