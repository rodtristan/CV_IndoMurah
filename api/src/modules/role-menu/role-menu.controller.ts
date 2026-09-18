import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UseGuards, Controller, Get, Post, Patch, Delete, Put, Param, Body, Query } from '@nestjs/common';
import { BaseController } from '../../common/templates/base.controller';
import { RoleMenuService } from './role-menu.service';
import { CreateRoleMenuDto, UpdateRoleMenuDto } from './dto/role-menu.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';

@ApiTags('RoleMenus')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('RoleMenu')
export class RoleMenuController extends BaseController<
  any,
  CreateRoleMenuDto,
  UpdateRoleMenuDto
> {
  constructor(roleMenuService: RoleMenuService) {
    super(roleMenuService, {
      modelName: 'RoleMenu',
      pluralName: 'RoleMenus',
      primaryKeyType: 'number',
      paramId: 'id',
      routePrefix: 'role-menu',
    });
  }

  // GET endpoints
  @Get()
  @ApiOperation({ summary: 'Get all RoleMenus with OData query support' })
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
  @ApiOperation({ summary: 'Get count of RoleMenus' })
  async getCount(@Query() query: any) {
    return super.getCount(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get RoleMenu by ID' })
  async findById(@Param('id') id: string, @Query() query: any) {
    return super.findById(id, query);
  }

  @Get('by/:field/:value')
  @ApiOperation({ summary: 'Get RoleMenu by field reference' })
  async findByField(@Param('field') field: string, @Param('value') value: string, @Query() query: any) {
    return super.findByField(field, value, query);
  }

  // POST endpoints
  @Post()
  @ApiOperation({ summary: 'Create new RoleMenu' })
  async create(@Body() dto: CreateRoleMenuDto) {
    return super.create(dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple RoleMenus' })
  async createBulk(@Body() dtos: CreateRoleMenuDto[]) {
    return super.createBulk(dtos);
  }

  // PATCH endpoints
  @Patch(':id')
  @ApiOperation({ summary: 'Update RoleMenu by ID' })
  async patchById(@Param('id') id: string, @Body() dto: Partial<UpdateRoleMenuDto>) {
    return super.patchById(id, dto);
  }

  @Patch('by/:field/:value')
  @ApiOperation({ summary: 'Update RoleMenus by field reference' })
  async patchByFilterReference(
    @Param('field') field: string,
    @Param('value') value: string,
    @Body() dto: Partial<UpdateRoleMenuDto>,
  ) {
    return super.patchByFilterReference(field, value, dto);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple RoleMenus' })
  async patchBulk(@Body() body: { ids: number[]; data: Partial<UpdateRoleMenuDto> }) {
    return super.patchBulk(body);
  }

  // PUT (UPSERT) endpoints
  @Put()
  @ApiOperation({ summary: 'Upsert RoleMenu' })
  async upsert(@Body() body: { where: { id: number }; create: CreateRoleMenuDto; update: Partial<UpdateRoleMenuDto> }) {
    return super.upsert(body);
  }

  @Put('by/:field')
  @ApiOperation({ summary: 'Upsert RoleMenu by field reference' })
  async upsertByFilterReference(
    @Param('field') field: string,
    @Body() body: { filterValue: any; create: CreateRoleMenuDto; update: Partial<UpdateRoleMenuDto> },
  ) {
    return super.upsertByFilterReference(field, body);
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert RoleMenus' })
  async upsertBulk(@Body() body: { items: any[] }) {
    return super.upsertBulk(body);
  }

  // DELETE endpoints
  @Delete(':id')
  @ApiOperation({ summary: 'Delete RoleMenu by ID' })
  async deleteById(@Param('id') id: string) {
    return super.deleteById(id);
  }

  @Delete('by/:field/:value')
  @ApiOperation({ summary: 'Delete RoleMenus by field reference' })
  async deleteByFilterReference(@Param('field') field: string, @Param('value') value: string) {
    return super.deleteByFilterReference(field, value);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple RoleMenus' })
  async deleteBulk(@Body() body: { ids: (number | string)[] }) {
    return super.deleteBulk(body);
  }
}
