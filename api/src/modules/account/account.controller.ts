import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Put, Param, Body, Query } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { AccountService } from './account.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../common/dto/api-response-dto';

@ApiTags('Account')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('account')
export class AccountController extends BaseController<
  any,
  CreateAccountDto,
  UpdateAccountDto
> {
  constructor(private readonly accountService: AccountService) {
    super(accountService, {
      modelName: 'Account',
      pluralName: 'Accounts',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'account',
    });
  }

  // GET endpoints
  @Get()
  @ApiOperation({ summary: 'Get all Accounts with OData query support' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations: parent, children' })
  @ApiQuery({ name: '$where[field]', required: false, description: 'Filter by field' })
  @ApiQuery({ name: '$orderBy[field]', required: false, description: 'Sort: asc/desc' })
  @ApiQuery({ name: '$skip', required: false, type: Number, description: 'Offset' })
  @ApiQuery({ name: '$take', required: false, type: Number, description: 'Limit' })
  @ApiQuery({ name: '$search', required: false, description: 'Search: code, name' })
  async findAll(@Query() query: any) {
    const r: any = await super.findAll(query);
    if (r?.data) r.data = await this.accountService.overlayBalance(r.data);
    return r;
  }

  @Get('balances')
  @ApiOperation({ summary: 'Saldo per akun dari buku besar (jurnal posted + saldo awal). asOf=YYYY-MM-DD opsional' })
  async balances(@Query('asOf') asOf?: string) {
    const to = asOf ? new Date(`${asOf}T23:59:59.999`) : undefined;
    if (to && isNaN(to.getTime())) return ApiResponse.error('asOf tidak valid');
    return ApiResponse.ok(await this.accountService.balances(to));
  }

  @Get('count')
  @ApiOperation({ summary: 'Get count of Accounts' })
  async getCount(@Query() query: any) {
    return super.getCount(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Account by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    const r: any = await super.findById(id, query);
    if (r?.data) r.data = await this.accountService.overlayBalance(r.data);
    return r;
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get Account by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return super.findByField(field, value, query);
  }

  // POST endpoints
  @Post()
  @ApiOperation({ summary: 'Create new Account' })
  async create(@Body() dto: CreateAccountDto) {
    return super.create(dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple Accounts' })
  async createBulk(@Body() dtos: CreateAccountDto[]) {
    return super.createBulk(dtos);
  }

  // PATCH endpoints
  @Patch(':id')
  @ApiOperation({ summary: 'Update Account by ID' })
  async patchById(@Param('id') id: string, @Body() dto: UpdateAccountDto) {
    return super.patchById(id, dto);
  }

  @Patch('by/:field/:value')
  @ApiOperation({ summary: 'Update Accounts by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: UpdateAccountDto,
  ) {
    return super.patchByFilterReference(field, value, dto);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple Accounts' })
  async patchBulk(@Body() body: { ids: number[]; data: Partial<UpdateAccountDto> }) {
    return super.patchBulk(body);
  }

  // PUT (UPSERT) endpoints
  @Put()
  @ApiOperation({ summary: 'Upsert Account' })
  async upsert(@Body() body: { where: { id: number }; create: CreateAccountDto; update: Partial<UpdateAccountDto> }) {
    return super.upsert(body);
  }

  @Put('by/:field')
  @ApiOperation({ summary: 'Upsert Account by field reference' })
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreateAccountDto; update: Partial<UpdateAccountDto> },
  ) {
    return super.upsertByFilterReference(field, body);
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert Accounts' })
  async upsertBulk(@Body() body: { items: any[] }) {
    return super.upsertBulk(body);
  }

  // DELETE endpoints
  @Delete(':id')
  @ApiOperation({ summary: 'Delete Account by ID' })
  async deleteById(@Param('id') id: string) {
    return super.deleteById(id);
  }

  @Delete('by/:field/:value')
  @ApiOperation({ summary: 'Delete Accounts by field reference' })
  async deleteByFilterReference(@Param('field') field: string, @Param('value') value: string) {
    return super.deleteByFilterReference(field, value);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple Accounts' })
  async deleteBulk(@Body() body: { ids: number[] }) {
    return super.deleteBulk(body);
  }
}
