import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Put, Param, Body, Query } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { ShippingCostService } from './shipping-cost.service';
import { CreateShippingCostDto, UpdateShippingCostDto } from './dto/shipping-cost.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';

@ApiTags('Shipping Cost')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('shipping-cost')
export class ShippingCostController extends BaseController<
  any,
  CreateShippingCostDto,
  UpdateShippingCostDto
> {
  constructor(shippingCostService: ShippingCostService) {
    super(shippingCostService, {
      modelName: 'ShippingCost',
      pluralName: 'ShippingCosts',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'shipping-cost',
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all Shipping Costs with OData query support' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations: region, subRegion' })
  @ApiQuery({ name: '$where[field]', required: false, description: 'Filter by field' })
  @ApiQuery({ name: '$where[regionId]', required: false, description: 'Filter by region ID' })
  @ApiQuery({ name: '$where[subRegionId]', required: false, description: 'Filter by sub region ID' })
  @ApiQuery({ name: '$orderBy[field]', required: false, description: 'Sort: asc/desc' })
  @ApiQuery({ name: '$skip', required: false, type: Number, description: 'Offset' })
  @ApiQuery({ name: '$take', required: false, type: Number, description: 'Limit' })
  @ApiQuery({ name: '$search', required: false, description: 'Search: code, name' })
  async findAll(@Query() query: any) {
    return super.findAll(query);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get count of Shipping Costs' })
  async getCount(@Query() query: any) {
    return super.getCount(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Shipping Cost by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return super.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get Shipping Cost by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return super.findByField(field, value, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create new Shipping Cost' })
  async create(@Body() dto: CreateShippingCostDto) {
    return super.create(dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple Shipping Costs' })
  async createBulk(@Body() dtos: CreateShippingCostDto[]) {
    return super.createBulk(dtos);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Shipping Cost by ID' })
  async patchById(@Param('id') id: string, @Body() dto: UpdateShippingCostDto) {
    return super.patchById(id, dto);
  }

  @Patch('by/:field/:value')
  @ApiOperation({ summary: 'Update Shipping Cost by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: UpdateShippingCostDto,
  ) {
    return super.patchByFilterReference(field, value, dto);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple Shipping Costs' })
  async patchBulk(@Body() body: { ids: number[]; data: Partial<UpdateShippingCostDto> }) {
    return super.patchBulk(body);
  }

  @Put()
  @ApiOperation({ summary: 'Upsert Shipping Cost' })
  async upsert(@Body() body: { where: { id: number }; create: CreateShippingCostDto; update: Partial<UpdateShippingCostDto> }) {
    return super.upsert(body);
  }

  @Put('by/:field')
  @ApiOperation({ summary: 'Upsert Shipping Cost by field reference' })
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreateShippingCostDto; update: Partial<UpdateShippingCostDto> },
  ) {
    return super.upsertByFilterReference(field, body);
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert Shipping Costs' })
  async upsertBulk(@Body() body: { items: any[] }) {
    return super.upsertBulk(body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Shipping Cost by ID' })
  async deleteById(@Param('id') id: string) {
    return super.deleteById(id);
  }

  @Delete('by/:field/:value')
  @ApiOperation({ summary: 'Delete Shipping Cost by field reference' })
  async deleteByFilterReference(@Param('field') field: string, @Param('value') value: string) {
    return super.deleteByFilterReference(field, value);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple Shipping Costs' })
  async deleteBulk(@Body() body: { ids: number[] }) {
    return super.deleteBulk(body);
  }
}
