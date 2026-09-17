import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Put, Param, Body, Query } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { CompanyService } from './company.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';

@ApiTags('Company')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('company')
export class CompanyController extends BaseController<
  any,
  CreateCompanyDto,
  UpdateCompanyDto
> {
  constructor(companyService: CompanyService) {
    super(companyService, {
      modelName: 'Company',
      pluralName: 'Companies',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'company',
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all companies with OData query support' })
  @ApiQuery({ name: '$select', required: false })
  @ApiQuery({ name: '$where[field]', required: false })
  @ApiQuery({ name: '$orderBy[field]', required: false })
  @ApiQuery({ name: '$skip', required: false, type: Number })
  @ApiQuery({ name: '$take', required: false, type: Number })
  @ApiQuery({ name: '$search', required: false })
  async findAll(@Query() query: any) {
    return super.findAll(query);
  }

  @Get('count')
  async getCount(@Query() query: any) {
    return super.getCount(query);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Query() query: any) {
    return super.findById(id, query);
  }

  @Get('by/:field/:value')
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return super.findByField(field, value, query);
  }

  @Post()
  async create(@Body() dto: CreateCompanyDto) {
    return super.create(dto);
  }

  @Post('bulk')
  async createBulk(@Body() dtos: CreateCompanyDto[]) {
    return super.createBulk(dtos);
  }

  @Patch(':id')
  async patchById(@Param('id') id: string, @Body() dto: Partial<UpdateCompanyDto>) {
    return super.patchById(id, dto);
  }

  @Patch('by/:field/:value')
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: Partial<UpdateCompanyDto>,
  ) {
    return super.patchByFilterReference(field, value, dto);
  }

  @Patch('bulk')
  async patchBulk(@Body() body: { ids: number[]; data: Partial<UpdateCompanyDto> }) {
    return super.patchBulk(body);
  }

  @Put()
  async upsert(@Body() body: { where: { id: number }; create: CreateCompanyDto; update: Partial<UpdateCompanyDto> }) {
    return super.upsert(body);
  }

  @Put('by/:field')
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreateCompanyDto; update: Partial<UpdateCompanyDto> },
  ) {
    return super.upsertByFilterReference(field, body);
  }

  @Put('bulk')
  async upsertBulk(@Body() body: { items: any[] }) {
    return super.upsertBulk(body);
  }

  @Delete(':id')
  async deleteById(@Param('id') id: string) {
    return super.deleteById(id);
  }

  @Delete('by/:field/:value')
  async deleteByFilterReference(@Param('field') field: string, @Param('value') value: string) {
    return super.deleteByFilterReference(field, value);
  }

  @Delete('bulk')
  async deleteBulk(@Body() body: { ids: (number | string)[] }) {
    return super.deleteBulk(body);
  }
}
