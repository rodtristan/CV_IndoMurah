import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Put, Param, Body, Query } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { SalesPersonService } from './sales-person.service';
import { CreateSalesPersonDto, UpdateSalesPersonDto } from './dto/sales-person.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';

@ApiTags('SalesPerson')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('SalesPerson')
export class SalesPersonController extends BaseController<
  any,
  CreateSalesPersonDto,
  UpdateSalesPersonDto
> {
  constructor(salesPersonService: SalesPersonService) {
    super(salesPersonService, {
      modelName: 'SalesPerson',
      pluralName: 'SalesPersons',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'sales-person',
    });
  }

  // GET endpoints
  @Get()
  @ApiOperation({ summary: 'Get all SalesPersons with OData query support' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations: ' })
  @ApiQuery({ name: '$where[field]', required: false, description: 'Filter by field' })
  @ApiQuery({ name: '$orderBy[field]', required: false, description: 'Sort: asc/desc' })
  @ApiQuery({ name: '$skip', required: false, type: Number, description: 'Offset' })
  @ApiQuery({ name: '$take', required: false, type: Number, description: 'Limit' })
  @ApiQuery({ name: '$search', required: false, description: 'Search: name' })
  async findAll(@Query() query: any) {
    return super.findAll(query);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get count of SalesPersons' })
  async getCount(@Query() query: any) {
    return super.getCount(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get SalesPerson by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return super.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get SalesPerson by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return super.findByField(field, value, query);
  }

  // POST endpoints
  @Post()
  @ApiOperation({ summary: 'Create new SalesPerson' })
  async create(@Body() dto: CreateSalesPersonDto) {
    return super.create(dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple SalesPersons' })
  async createBulk(@Body() dtos: CreateSalesPersonDto[]) {
    return super.createBulk(dtos);
  }

  // PATCH endpoints
  @Patch(':id')
  @ApiOperation({ summary: 'Update SalesPerson by ID' })
  async patchById(@Param('id') id: string, @Body() dto: Partial<UpdateSalesPersonDto>) {
    return super.patchById(id, dto);
  }

  @Patch('by/:field/:value')
  @ApiOperation({ summary: 'Update SalesPersons by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: Partial<UpdateSalesPersonDto>,
  ) {
    return super.patchByFilterReference(field, value, dto);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple SalesPersons' })
  async patchBulk(@Body() body: { ids: number[]; data: Partial<UpdateSalesPersonDto> }) {
    return super.patchBulk(body);
  }

  // PUT (UPSERT) endpoints
  @Put()
  @ApiOperation({ summary: 'Upsert SalesPerson' })
  async upsert(@Body() body: { where: { id: number }; create: CreateSalesPersonDto; update: Partial<UpdateSalesPersonDto> }) {
    return super.upsert(body);
  }

  @Put('by/:field')
  @ApiOperation({ summary: 'Upsert SalesPerson by field reference' })
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreateSalesPersonDto; update: Partial<UpdateSalesPersonDto> },
  ) {
    return super.upsertByFilterReference(field, body);
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert SalesPersons' })
  async upsertBulk(@Body() body: { items: any[] }) {
    return super.upsertBulk(body);
  }

  // DELETE endpoints
  @Delete(':id')
  @ApiOperation({ summary: 'Delete SalesPerson by ID' })
  async deleteById(@Param('id') id: string) {
    return super.deleteById(id);
  }

  @Delete('by/:field/:value')
  @ApiOperation({ summary: 'Delete SalesPersons by field reference' })
  async deleteByFilterReference(@Param('field') field: string, @Param('value') value: string) {
    return super.deleteByFilterReference(field, value);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple SalesPersons' })
  async deleteBulk(@Body() body: { ids: number[] }) {
    return super.deleteBulk(body);
  }
}
