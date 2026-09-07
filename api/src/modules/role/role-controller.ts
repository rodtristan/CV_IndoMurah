import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { RoleService } from './role-service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../common/dto/api-response-dto';

@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Get()
  @ApiOperation({ summary: 'Get all roles (Smart Query)' })
  @ApiQuery({ name: '$select', required: false }) @ApiQuery({ name: '$include', required: false })
  @ApiQuery({ name: '$search', required: false }) @ApiQuery({ name: '$skip', required: false, type: Number })
  @ApiQuery({ name: '$take', required: false, type: Number })
  async findAll(@Query() query: any) {
    const { data, total, skip, take } = await this.roleService.findAll(query);
    return ApiResponse.paginated(data, total, skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID (Smart Query)' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Query() query: any) {
    const data = await this.roleService.findOne(id, query);
    if (!data) throw new NotFoundException('Role not found');
    return ApiResponse.ok(data);
  }

  @Post() @ApiOperation({ summary: 'Create role' })
  async create(@Body() body: any) { return ApiResponse.ok(await this.roleService.create(body), 'Role created'); }

  @Put(':id') @ApiOperation({ summary: 'Update role' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return ApiResponse.ok(await this.roleService.update(id, body), 'Role updated'); }

  @Delete(':id') @ApiOperation({ summary: 'Deactivate role' })
  async remove(@Param('id', ParseIntPipe) id: number) { return ApiResponse.ok(await this.roleService.remove(id), 'Role deactivated'); }
}
