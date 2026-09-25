import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Put, Param, Body, Query } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { BankService } from './bank.service';
import { CreateBankDto, UpdateBankDto } from './dto/bank.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';

@ApiTags('Bank')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bank')
export class BankController extends BaseController<
  any,
  CreateBankDto,
  UpdateBankDto
> {
  constructor(bankService: BankService) {
    super(bankService, {
      modelName: 'Bank',
      pluralName: 'Banks',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'bank',
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all Banks with OData query support' })
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
  @ApiOperation({ summary: 'Get count of Banks' })
  async getCount(@Query() query: any) {
    return super.getCount(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Bank by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return super.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get Bank by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return super.findByField(field, value, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create new Bank' })
  async create(@Body() dto: CreateBankDto) {
    return super.create(dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple Banks' })
  async createBulk(@Body() dtos: CreateBankDto[]) {
    return super.createBulk(dtos);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Bank by ID' })
  async patchById(@Param('id') id: string, @Body() dto: Partial<UpdateBankDto>) {
    return super.patchById(id, dto);
  }

  @Patch('by/:field/:value')
  @ApiOperation({ summary: 'Update Banks by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: Partial<UpdateBankDto>,
  ) {
    return super.patchByFilterReference(field, value, dto);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple Banks' })
  async patchBulk(@Body() body: { ids: number[]; data: Partial<UpdateBankDto> }) {
    return super.patchBulk(body);
  }

  @Put()
  @ApiOperation({ summary: 'Upsert Bank' })
  async upsert(@Body() body: { where: { id: number }; create: CreateBankDto; update: Partial<UpdateBankDto> }) {
    return super.upsert(body);
  }

  @Put('by/:field')
  @ApiOperation({ summary: 'Upsert Bank by field reference' })
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreateBankDto; update: Partial<UpdateBankDto> },
  ) {
    return super.upsertByFilterReference(field, body);
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert Banks' })
  async upsertBulk(@Body() body: { items: any[] }) {
    return super.upsertBulk(body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Bank by ID' })
  async deleteById(@Param('id') id: string) {
    return super.deleteById(id);
  }

  @Delete('by/:field/:value')
  @ApiOperation({ summary: 'Delete Banks by field reference' })
  async deleteByFilterReference(@Param('field') field: string, @Param('value') value: string) {
    return super.deleteByFilterReference(field, value);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple Banks' })
  async deleteBulk(@Body() body: { ids: number[] }) {
    return super.deleteBulk(body);
  }
}
