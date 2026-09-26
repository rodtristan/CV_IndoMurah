import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Put, Param, Body, Query } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { SubRegionService } from './sub-region.service';
import { CreateSubRegionDto, UpdateSubRegionDto } from './dto/sub-region.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';

@ApiTags('Sub Region')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sub-region')
export class SubRegionController extends BaseController<
  any,
  CreateSubRegionDto,
  UpdateSubRegionDto
> {
  constructor(subRegionService: SubRegionService) {
    super(subRegionService, {
      modelName: 'SubRegion',
      pluralName: 'SubRegions',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'sub-region',
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all Sub Regions with OData query support' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations: region, shippingCosts' })
  @ApiQuery({ name: '$where[field]', required: false, description: 'Filter by field' })
  @ApiQuery({ name: '$where[regionId]', required: false, description: 'Filter by region ID' })
  @ApiQuery({ name: '$orderBy[field]', required: false, description: 'Sort: asc/desc' })
  @ApiQuery({ name: '$skip', required: false, type: Number, description: 'Offset' })
  @ApiQuery({ name: '$take', required: false, type: Number, description: 'Limit' })
  @ApiQuery({ name: '$search', required: false, description: 'Search: code, name' })
  async findAll(@Query() query: any) {
    return super.findAll(query);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get count of Sub Regions' })
  async getCount(@Query() query: any) {
    return super.getCount(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Sub Region by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return super.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get Sub Region by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return super.findByField(field, value, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create new Sub Region' })
  async create(@Body() dto: CreateSubRegionDto) {
    return super.create(dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple Sub Regions' })
  async createBulk(@Body() dtos: CreateSubRegionDto[]) {
    return super.createBulk(dtos);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Sub Region by ID' })
  async patchById(@Param('id') id: string, @Body() dto: UpdateSubRegionDto) {
    return super.patchById(id, dto);
  }

  @Patch('by/:field/:value')
  @ApiOperation({ summary: 'Update Sub Region by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: UpdateSubRegionDto,
  ) {
    return super.patchByFilterReference(field, value, dto);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple Sub Regions' })
  async patchBulk(@Body() body: { ids: number[]; data: Partial<UpdateSubRegionDto> }) {
    return super.patchBulk(body);
  }

  @Put()
  @ApiOperation({ summary: 'Upsert Sub Region' })
  async upsert(@Body() body: { where: { id: number }; create: CreateSubRegionDto; update: Partial<UpdateSubRegionDto> }) {
    return super.upsert(body);
  }

  @Put('by/:field')
  @ApiOperation({ summary: 'Upsert Sub Region by field reference' })
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreateSubRegionDto; update: Partial<UpdateSubRegionDto> },
  ) {
    return super.upsertByFilterReference(field, body);
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert Sub Regions' })
  async upsertBulk(@Body() body: { items: any[] }) {
    return super.upsertBulk(body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Sub Region by ID' })
  async deleteById(@Param('id') id: string) {
    return super.deleteById(id);
  }

  @Delete('by/:field/:value')
  @ApiOperation({ summary: 'Delete Sub Region by field reference' })
  async deleteByFilterReference(@Param('field') field: string, @Param('value') value: string) {
    return super.deleteByFilterReference(field, value);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple Sub Regions' })
  async deleteBulk(@Body() body: { ids: number[] }) {
    return super.deleteBulk(body);
  }
}
