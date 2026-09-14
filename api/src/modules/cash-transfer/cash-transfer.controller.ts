import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Put, Param, Body, Query } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { CashTransferService } from './cash-transfer.service';
import { CreateCashTransferDto, UpdateCashTransferDto } from './dto/cash-transfer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';

@ApiTags('CashTransfer')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cash-transfer')
export class CashTransferController extends BaseController<
  any,
  CreateCashTransferDto,
  UpdateCashTransferDto
> {
  constructor(cashTransferService: CashTransferService) {
    super(cashTransferService, {
      modelName: 'CashTransfer',
      pluralName: 'CashTransfers',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'cash-transfer',
    });
  }

  // GET endpoints
  @Get()
  @ApiOperation({ summary: 'Get all CashTransfers with OData query support' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations: fromAccount, toAccount' })
  @ApiQuery({ name: '$where[field]', required: false, description: 'Filter by field' })
  @ApiQuery({ name: '$orderBy[field]', required: false, description: 'Sort: asc/desc' })
  @ApiQuery({ name: '$skip', required: false, type: Number, description: 'Offset' })
  @ApiQuery({ name: '$take', required: false, type: Number, description: 'Limit' })
  @ApiQuery({ name: '$search', required: false, description: 'Search: code, description' })
  async findAll(@Query() query: any) {
    return super.findAll(query);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get count of CashTransfers' })
  async getCount(@Query() query: any) {
    return super.getCount(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get CashTransfer by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return super.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get CashTransfer by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return super.findByField(field, value, query);
  }

  // POST endpoints
  @Post()
  @ApiOperation({ summary: 'Create new CashTransfer' })
  async create(@Body() dto: CreateCashTransferDto, @CurrentUser() user?: any) {
    return super.create({ ...dto, createdById: user.id } as any);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple CashTransfers' })
  async createBulk(@Body() dtos: CreateCashTransferDto[]) {
    return super.createBulk(dtos);
  }

  // PATCH endpoints
  @Patch(':id')
  @ApiOperation({ summary: 'Update CashTransfer by ID' })
  async patchById(@Param('id') id: string, @Body() dto: Partial<UpdateCashTransferDto>) {
    return super.patchById(id, dto);
  }

  @Patch('by/:field/:value')
  @ApiOperation({ summary: 'Update CashTransfers by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: Partial<UpdateCashTransferDto>,
  ) {
    return super.patchByFilterReference(field, value, dto);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple CashTransfers' })
  async patchBulk(@Body() body: { ids: number[]; data: Partial<UpdateCashTransferDto> }) {
    return super.patchBulk(body);
  }

  // PUT (UPSERT) endpoints
  @Put()
  @ApiOperation({ summary: 'Upsert CashTransfer' })
  async upsert(@Body() body: { where: { id: number }; create: CreateCashTransferDto; update: Partial<UpdateCashTransferDto> }) {
    return super.upsert(body);
  }

  @Put('by/:field')
  @ApiOperation({ summary: 'Upsert CashTransfer by field reference' })
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreateCashTransferDto; update: Partial<UpdateCashTransferDto> },
  ) {
    return super.upsertByFilterReference(field, body);
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert CashTransfers' })
  async upsertBulk(@Body() body: { items: any[] }) {
    return super.upsertBulk(body);
  }

  // DELETE endpoints
  @Delete(':id')
  @ApiOperation({ summary: 'Delete CashTransfer by ID' })
  async deleteById(@Param('id') id: string) {
    return super.deleteById(id);
  }

  @Delete('by/:field/:value')
  @ApiOperation({ summary: 'Delete CashTransfers by field reference' })
  async deleteByFilterReference(@Param('field') field: string, @Param('value') value: string) {
    return super.deleteByFilterReference(field, value);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple CashTransfers' })
  async deleteBulk(@Body() body: { ids: number[] }) {
    return super.deleteBulk(body);
  }
}
