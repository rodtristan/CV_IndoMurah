import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Put, Param, Body, Query } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { SupplierDepositService } from './supplier-deposit.service';
import { CreateSupplierDepositDto, UpdateSupplierDepositDto } from './dto/supplier-deposit.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';

@ApiTags('SupplierDeposit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('supplier-deposit')
export class SupplierDepositController extends BaseController<
  any,
  CreateSupplierDepositDto,
  UpdateSupplierDepositDto
> {
  constructor(supplierDepositService: SupplierDepositService) {
    super(supplierDepositService, {
      modelName: 'SupplierDeposit',
      pluralName: 'SupplierDeposits',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'supplier-deposit',
    });
  }

  // GET endpoints
  @Get()
  @ApiOperation({ summary: 'Get all SupplierDeposits with OData query support' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations: supplier' })
  @ApiQuery({ name: '$where[field]', required: false, description: 'Filter by field' })
  @ApiQuery({ name: '$orderBy[field]', required: false, description: 'Sort: asc/desc' })
  @ApiQuery({ name: '$skip', required: false, type: Number, description: 'Offset' })
  @ApiQuery({ name: '$take', required: false, type: Number, description: 'Limit' })
  @ApiQuery({ name: '$search', required: false, description: 'Search: code, description' })
  async findAll(@Query() query: any) {
    return super.findAll(query);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get count of SupplierDeposits' })
  async getCount(@Query() query: any) {
    return super.getCount(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get SupplierDeposit by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return super.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get SupplierDeposit by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return super.findByField(field, value, query);
  }

  // POST endpoints
  @Post()
  @ApiOperation({ summary: 'Create new SupplierDeposit' })
  async create(@Body() dto: CreateSupplierDepositDto) {
    return super.create(dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple SupplierDeposits' })
  async createBulk(@Body() dtos: CreateSupplierDepositDto[]) {
    return super.createBulk(dtos);
  }

  // PATCH endpoints
  @Patch(':id')
  @ApiOperation({ summary: 'Update SupplierDeposit by ID' })
  async patchById(@Param('id') id: string, @Body() dto: Partial<UpdateSupplierDepositDto>) {
    return super.patchById(id, dto);
  }

  @Patch('by/:field/:value')
  @ApiOperation({ summary: 'Update SupplierDeposits by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: Partial<UpdateSupplierDepositDto>,
  ) {
    return super.patchByFilterReference(field, value, dto);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple SupplierDeposits' })
  async patchBulk(@Body() body: { ids: number[]; data: Partial<UpdateSupplierDepositDto> }) {
    return super.patchBulk(body);
  }

  // PUT (UPSERT) endpoints
  @Put()
  @ApiOperation({ summary: 'Upsert SupplierDeposit' })
  async upsert(@Body() body: { where: { id: number }; create: CreateSupplierDepositDto; update: Partial<UpdateSupplierDepositDto> }) {
    return super.upsert(body);
  }

  @Put('by/:field')
  @ApiOperation({ summary: 'Upsert SupplierDeposit by field reference' })
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreateSupplierDepositDto; update: Partial<UpdateSupplierDepositDto> },
  ) {
    return super.upsertByFilterReference(field, body);
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert SupplierDeposits' })
  async upsertBulk(@Body() body: { items: any[] }) {
    return super.upsertBulk(body);
  }

  // DELETE endpoints
  @Delete(':id')
  @ApiOperation({ summary: 'Delete SupplierDeposit by ID' })
  async deleteById(@Param('id') id: string) {
    return super.deleteById(id);
  }

  @Delete('by/:field/:value')
  @ApiOperation({ summary: 'Delete SupplierDeposits by field reference' })
  async deleteByFilterReference(@Param('field') field: string, @Param('value') value: string) {
    return super.deleteByFilterReference(field, value);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple SupplierDeposits' })
  async deleteBulk(@Body() body: { ids: number[] }) {
    return super.deleteBulk(body);
  }
}
