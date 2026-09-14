import { Controller, Get, Put, Post, Delete, Param, Body, Query, UseGuards, NotFoundException, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UserService } from './user-service';
import { UpdateUserDto, AssignRoleDto } from './dto/user-dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../common/dto/api-response-dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users (Smart Query supported)' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields: id,name,email' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations: userRoles' })
  @ApiQuery({ name: '$where[isActive]', required: false, description: 'Filter: true/false' })
  @ApiQuery({ name: '$search', required: false, description: 'Search keyword' })
  @ApiQuery({ name: '$orderBy[createdAt]', required: false, description: 'Sort: asc/desc' })
  @ApiQuery({ name: '$skip', required: false, description: 'Offset', type: Number })
  @ApiQuery({ name: '$take', required: false, description: 'Limit', type: Number })
  async findAll(@Query() query: any) {
    const { data, total, skip, take } = await this.userService.findAll(query);
    return ApiResponse.paginated(data, total, skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID (Smart Query supported)' })
  async findOne(@Param('id') id: string, @Query() query: any) {
    const data = await this.userService.findOne(id, query);
    if (!data) throw new NotFoundException('User not found');
    return ApiResponse.ok(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const data = await this.userService.update(id, dto);
    return ApiResponse.ok(data, 'User updated successfully');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete user' })
  async softDelete(@Param('id') id: string) {
    const data = await this.userService.softDelete(id);
    return ApiResponse.ok(data, 'User deactivated successfully');
  }

  // ─── UserRole — extra roles on top of main role ────────

  @Get(':id/roles')
  @ApiOperation({ summary: 'Get main role + extra roles (UserRole) for a user' })
  async getRoles(@Param('id') id: string) {
    const data = await this.userService.getRoles(id);
    return ApiResponse.ok(data);
  }

  @Post(':id/roles')
  @ApiOperation({ summary: "Grant an extra role to a user (UserRole) — also seeds that role's menus" })
  async assignRole(@Param('id') id: string, @Body() dto: AssignRoleDto) {
    const data = await this.userService.assignRole(id, dto.roleId);
    return ApiResponse.ok(data, 'Role assigned to user');
  }

  @Delete(':id/roles/:roleId')
  @ApiOperation({ summary: 'Revoke an extra role from a user' })
  async revokeRole(@Param('id') id: string, @Param('roleId', ParseIntPipe) roleId: number) {
    const data = await this.userService.revokeRole(id, roleId);
    return ApiResponse.ok(data, 'Role revoked from user');
  }
}
