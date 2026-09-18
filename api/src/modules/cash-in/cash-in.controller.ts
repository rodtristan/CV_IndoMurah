import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Put, Param, Body, Query } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { CashInService } from './cash-in.service';
import { CreateCashInDto, UpdateCashInDto } from './dto/cash-in.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';

@ApiTags('CashIn')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cash-in')
export class CashInController extends BaseController<
  any,
  CreateCashInDto,
  UpdateCashInDto
> {
  constructor(cashInService: CashInService) {
    super(cashInService, {
      modelName: 'CashIn',
      pluralName: 'CashIns',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'cash-in',
    });
  }

  // GET endpoints
  @Get()
  @ApiOperation({ summary: 'Get all CashIns with OData query support' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations: account' })
  @ApiQuery({ name: '$where[field]', required: false, description: 'Filter by field' })
  @ApiQuery({ name: '$orderBy[field]', required: false, description: 'Sort: asc/desc' })
  @ApiQuery({ name: '$skip', required: false, type: Number, description: 'Offset' })
  @ApiQuery({ name: '$take', required: false, type: Number, description: 'Limit' })
  @ApiQuery({ name: '$search', required: false, description: 'Search: code, description' })
  async findAll(@Query() query: any) {
    return super.findAll(query);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get count of CashIns' })
  async getCount(@Query() query: any) {
    return super.getCount(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get CashIn by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return super.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get CashIn by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return super.findByField(field, value, query);
  }

  // POST endpoints
  @Post()
  @ApiOperation({ summary: 'Create new CashIn' })
  async create(@Body() dto: CreateCashInDto, @CurrentUser() user?: any) {
    return super.create({ ...dto, createdById: user.id } as any);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple CashIns' })
  async createBulk(@Body() dtos: CreateCashInDto[]) {
    return super.createBulk(dtos);
  }

  // PATCH endpoints
  @Patch(':id')
  @ApiOperation({ summary: 'Update CashIn by ID' })
  async patchById(@Param('id') id: string, @Body() dto: Partial<UpdateCashInDto>) {
    return super.patchById(id, dto);
  }

  @Patch('by/:field/:value')
  @ApiOperation({ summary: 'Update CashIns by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: Partial<UpdateCashInDto>,
  ) {
    return super.patchByFilterReference(field, value, dto);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple CashIns' })
  async patchBulk(@Body() body: { ids: number[]; data: Partial<UpdateCashInDto> }) {
    return super.patchBulk(body);
  }

  // PUT (UPSERT) endpoints
  @Put()
  @ApiOperation({ summary: 'Upsert CashIn' })
  async upsert(@Body() body: { where: { id: number }; create: CreateCashInDto; update: Partial<UpdateCashInDto> }) {
    return super.upsert(body);
  }

  @Put('by/:field')
  @ApiOperation({ summary: 'Upsert CashIn by field reference' })
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreateCashInDto; update: Partial<UpdateCashInDto> },
  ) {
    return super.upsertByFilterReference(field, body);
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert CashIns' })
  async upsertBulk(@Body() body: { items: any[] }) {
    return super.upsertBulk(body);
  }

  // DELETE endpoints
  @Delete(':id')
  @ApiOperation({ summary: 'Delete CashIn by ID' })
  async deleteById(@Param('id') id: string) {
    return super.deleteById(id);
  }

  @Delete('by/:field/:value')
  @ApiOperation({ summary: 'Delete CashIns by field reference' })
  async deleteByFilterReference(@Param('field') field: string, @Param('value') value: string) {
    return super.deleteByFilterReference(field, value);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple CashIns' })
  async deleteBulk(@Body() body: { ids: number[] }) {
    return super.deleteBulk(body);
  }
}
