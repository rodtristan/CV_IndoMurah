import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Put, Param, Body, Query } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { EMoneyService } from './e-money.service';
import { CreateEMoneyDto, UpdateEMoneyDto } from './dto/e-money.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';

@ApiTags('E-Money')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('e-money')
export class EMoneyController extends BaseController<
  any,
  CreateEMoneyDto,
  UpdateEMoneyDto
> {
  constructor(eMoneyService: EMoneyService) {
    super(eMoneyService, {
      modelName: 'EMoney',
      pluralName: 'EMoneys',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'e-money',
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all E-Money providers with OData query support' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields' })
  @ApiQuery({ name: '$where[field]', required: false, description: 'Filter by field' })
  @ApiQuery({ name: '$orderBy[field]', required: false, description: 'Sort: asc/desc' })
  @ApiQuery({ name: '$skip', required: false, type: Number, description: 'Offset' })
  @ApiQuery({ name: '$take', required: false, type: Number, description: 'Limit' })
  @ApiQuery({ name: '$search', required: false, description: 'Search: code, name' })
  async findAll(@Query() query: any) {
    return super.findAll(query);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get count of E-Money providers' })
  async getCount(@Query() query: any) {
    return super.getCount(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get E-Money by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return super.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get E-Money by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return super.findByField(field, value, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create new E-Money provider' })
  async create(@Body() dto: CreateEMoneyDto) {
    return super.create(dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple E-Money providers' })
  async createBulk(@Body() dtos: CreateEMoneyDto[]) {
    return super.createBulk(dtos);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update E-Money by ID' })
  async patchById(@Param('id') id: string, @Body() dto: UpdateEMoneyDto) {
    return super.patchById(id, dto);
  }

  @Patch('by/:field/:value')
  @ApiOperation({ summary: 'Update E-Money by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: UpdateEMoneyDto,
  ) {
    return super.patchByFilterReference(field, value, dto);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple E-Money providers' })
  async patchBulk(@Body() body: { ids: number[]; data: Partial<UpdateEMoneyDto> }) {
    return super.patchBulk(body);
  }

  @Put()
  @ApiOperation({ summary: 'Upsert E-Money' })
  async upsert(@Body() body: { where: { id: number }; create: CreateEMoneyDto; update: Partial<UpdateEMoneyDto> }) {
    return super.upsert(body);
  }

  @Put('by/:field')
  @ApiOperation({ summary: 'Upsert E-Money by field reference' })
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreateEMoneyDto; update: Partial<UpdateEMoneyDto> },
  ) {
    return super.upsertByFilterReference(field, body);
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert E-Money providers' })
  async upsertBulk(@Body() body: { items: any[] }) {
    return super.upsertBulk(body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete E-Money by ID' })
  async deleteById(@Param('id') id: string) {
    return super.deleteById(id);
  }

  @Delete('by/:field/:value')
  @ApiOperation({ summary: 'Delete E-Money by field reference' })
  async deleteByFilterReference(@Param('field') field: string, @Param('value') value: string) {
    return super.deleteByFilterReference(field, value);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple E-Money providers' })
  async deleteBulk(@Body() body: { ids: number[] }) {
    return super.deleteBulk(body);
  }
}
