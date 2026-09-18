import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Put, Param, Body, Query } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { ExpenseCategoryService } from './expense-category.service';
import { CreateExpenseCategoryDto, UpdateExpenseCategoryDto } from './dto/expense-category.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';

@ApiTags('ExpenseCategories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expense-category')
export class ExpenseCategoryController extends BaseController<
  any,
  CreateExpenseCategoryDto,
  UpdateExpenseCategoryDto
> {
  constructor(expenseCategoryService: ExpenseCategoryService) {
    super(expenseCategoryService, {
      modelName: 'ExpenseCategory',
      pluralName: 'ExpenseCategories',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'expense-categories',
    });
  }

  // GET endpoints
  @Get()
  @ApiOperation({ summary: 'Get all expense categories with OData query support' })
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
  @ApiOperation({ summary: 'Get count of expense categories' })
  async getCount(@Query() query: any) {
    return super.getCount(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expense category by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return super.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get expense category by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return super.findByField(field, value, query);
  }

  // POST endpoints
  @Post()
  @ApiOperation({ summary: 'Create new expense category' })
  async create(@Body() dto: CreateExpenseCategoryDto) {
    return super.create(dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple expense categories' })
  async createBulk(@Body() dtos: CreateExpenseCategoryDto[]) {
    return super.createBulk(dtos);
  }

  // PATCH endpoints
  @Patch(':id')
  @ApiOperation({ summary: 'Update expense category by ID' })
  async patchById(@Param('id') id: string, @Body() dto: Partial<UpdateExpenseCategoryDto>) {
    return super.patchById(id, dto);
  }

  @Patch('by/:field/:value')
  @ApiOperation({ summary: 'Update expense categories by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: Partial<UpdateExpenseCategoryDto>,
  ) {
    return super.patchByFilterReference(field, value, dto);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple expense categories' })
  async patchBulk(@Body() body: { ids: number[]; data: Partial<UpdateExpenseCategoryDto> }) {
    return super.patchBulk(body);
  }

  // PUT (UPSERT) endpoints
  @Put()
  @ApiOperation({ summary: 'Upsert expense category' })
  async upsert(@Body() body: { where: { id: number }; create: CreateExpenseCategoryDto; update: Partial<UpdateExpenseCategoryDto> }) {
    return super.upsert(body);
  }

  @Put('by/:field')
  @ApiOperation({ summary: 'Upsert expense category by field reference' })
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreateExpenseCategoryDto; update: Partial<UpdateExpenseCategoryDto> },
  ) {
    return super.upsertByFilterReference(field, body);
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert expense categories' })
  async upsertBulk(@Body() body: { items: any[] }) {
    return super.upsertBulk(body);
  }

  // DELETE endpoints
  @Delete(':id')
  @ApiOperation({ summary: 'Delete expense category by ID' })
  async deleteById(@Param('id') id: string) {
    return super.deleteById(id);
  }

  @Delete('by/:field/:value')
  @ApiOperation({ summary: 'Delete expense categories by field reference' })
  async deleteByFilterReference(@Param('field') field: string, @Param('value') value: string) {
    return super.deleteByFilterReference(field, value);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple expense categories' })
  async deleteBulk(@Body() body: { ids: (number | string)[] }) {
    return super.deleteBulk(body);
  }
}
