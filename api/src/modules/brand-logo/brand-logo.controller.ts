import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Put, Param, Body, Query } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { BrandLogoService } from './brand-logo.service';
import { CreateBrandLogoDto, UpdateBrandLogoDto } from './dto/brand-logo.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';

@ApiTags('BrandLogos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('brand-logo')
export class BrandLogoController extends BaseController<
  any,
  CreateBrandLogoDto,
  UpdateBrandLogoDto
> {
  constructor(brandLogoService: BrandLogoService) {
    super(brandLogoService, {
      modelName: 'BrandLogo',
      pluralName: 'BrandLogos',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'brand-logo',
    });
  }

  // GET endpoints
  @Get()
  @ApiOperation({ summary: 'Get all BrandLogos with OData query support' })
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
  @ApiOperation({ summary: 'Get count of BrandLogos' })
  async getCount(@Query() query: any) {
    return super.getCount(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get BrandLogo by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return super.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get BrandLogo by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return super.findByField(field, value, query);
  }

  // POST endpoints
  @Post()
  @ApiOperation({ summary: 'Create new BrandLogo' })
  async create(@Body() dto: CreateBrandLogoDto) {
    return super.create(dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple BrandLogos' })
  async createBulk(@Body() dtos: CreateBrandLogoDto[]) {
    return super.createBulk(dtos);
  }

  // PATCH endpoints
  @Patch(':id')
  @ApiOperation({ summary: 'Update BrandLogo by ID' })
  async patchById(@Param('id') id: string, @Body() dto: UpdateBrandLogoDto) {
    return super.patchById(id, dto);
  }

  @Patch('by/:field/:value')
  @ApiOperation({ summary: 'Update BrandLogos by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: UpdateBrandLogoDto,
  ) {
    return super.patchByFilterReference(field, value, dto);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple BrandLogos' })
  async patchBulk(@Body() body: { ids: number[]; data: Partial<UpdateBrandLogoDto> }) {
    return super.patchBulk(body);
  }

  // PUT (UPSERT) endpoints
  @Put()
  @ApiOperation({ summary: 'Upsert BrandLogo' })
  async upsert(@Body() body: { where: { id: number }; create: CreateBrandLogoDto; update: Partial<UpdateBrandLogoDto> }) {
    return super.upsert(body);
  }

  @Put('by/:field')
  @ApiOperation({ summary: 'Upsert BrandLogo by field reference' })
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreateBrandLogoDto; update: Partial<UpdateBrandLogoDto> },
  ) {
    return super.upsertByFilterReference(field, body);
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert BrandLogos' })
  async upsertBulk(@Body() body: { items: any[] }) {
    return super.upsertBulk(body);
  }

  // DELETE endpoints
  @Delete(':id')
  @ApiOperation({ summary: 'Delete BrandLogo by ID' })
  async deleteById(@Param('id') id: string) {
    return super.deleteById(id);
  }

  @Delete('by/:field/:value')
  @ApiOperation({ summary: 'Delete BrandLogos by field reference' })
  async deleteByFilterReference(@Param('field') field: string, @Param('value') value: string) {
    return super.deleteByFilterReference(field, value);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple BrandLogos' })
  async deleteBulk(@Body() body: { ids: (number | string)[] }) {
    return super.deleteBulk(body);
  }
}
