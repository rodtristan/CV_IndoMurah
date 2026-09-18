import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Put, Param, Body, Query } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { LeaveBalanceService } from './leave-balance.service';
import { CreateLeaveBalanceDto, UpdateLeaveBalanceDto } from './dto/leave-balance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';

@ApiTags('LeaveBalances')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('LeaveBalance')
export class LeaveBalanceController extends BaseController<
  any,
  CreateLeaveBalanceDto,
  UpdateLeaveBalanceDto
> {
  constructor(leaveBalanceService: LeaveBalanceService) {
    super(leaveBalanceService, {
      modelName: 'LeaveBalance',
      pluralName: 'LeaveBalances',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'leave-balance',
    });
  }

  // GET endpoints
  @Get()
  @ApiOperation({ summary: 'Get all LeaveBalances with OData query support' })
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
  @ApiOperation({ summary: 'Get count of LeaveBalances' })
  async getCount(@Query() query: any) {
    return super.getCount(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get LeaveBalance by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return super.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get LeaveBalance by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return super.findByField(field, value, query);
  }

  // POST endpoints
  @Post()
  @ApiOperation({ summary: 'Create new LeaveBalance' })
  async create(@Body() dto: CreateLeaveBalanceDto) {
    return super.create(dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple LeaveBalances' })
  async createBulk(@Body() dtos: CreateLeaveBalanceDto[]) {
    return super.createBulk(dtos);
  }

  // PATCH endpoints
  @Patch(':id')
  @ApiOperation({ summary: 'Update LeaveBalance by ID' })
  async patchById(@Param('id') id: string, @Body() dto: Partial<UpdateLeaveBalanceDto>) {
    return super.patchById(id, dto);
  }

  @Patch('by/:field/:value')
  @ApiOperation({ summary: 'Update LeaveBalances by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: Partial<UpdateLeaveBalanceDto>,
  ) {
    return super.patchByFilterReference(field, value, dto);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple LeaveBalances' })
  async patchBulk(@Body() body: { ids: number[]; data: Partial<UpdateLeaveBalanceDto> }) {
    return super.patchBulk(body);
  }

  // PUT (UPSERT) endpoints
  @Put()
  @ApiOperation({ summary: 'Upsert LeaveBalance' })
  async upsert(@Body() body: { where: { id: number }; create: CreateLeaveBalanceDto; update: Partial<UpdateLeaveBalanceDto> }) {
    return super.upsert(body);
  }

  @Put('by/:field')
  @ApiOperation({ summary: 'Upsert LeaveBalance by field reference' })
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreateLeaveBalanceDto; update: Partial<UpdateLeaveBalanceDto> },
  ) {
    return super.upsertByFilterReference(field, body);
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert LeaveBalances' })
  async upsertBulk(@Body() body: { items: any[] }) {
    return super.upsertBulk(body);
  }

  // DELETE endpoints
  @Delete(':id')
  @ApiOperation({ summary: 'Delete LeaveBalance by ID' })
  async deleteById(@Param('id') id: string) {
    return super.deleteById(id);
  }

  @Delete('by/:field/:value')
  @ApiOperation({ summary: 'Delete LeaveBalances by field reference' })
  async deleteByFilterReference(@Param('field') field: string, @Param('value') value: string) {
    return super.deleteByFilterReference(field, value);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple LeaveBalances' })
  async deleteBulk(@Body() body: { ids: (number | string)[] }) {
    return super.deleteBulk(body);
  }
}
