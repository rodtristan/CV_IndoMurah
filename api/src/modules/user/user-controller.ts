import { Controller, Get, Put, Post, Delete, Param, Body, Query, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UserService } from './user-service';
import { CreateUserDto, UpdateUserDto } from './dto/user-dto';
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
  @ApiQuery({ name: '$select', required: false, description: 'Select fields: id,name,email,role' })
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
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.userService.findOne(id);
    if (!data) throw new NotFoundException('User not found');
    return ApiResponse.ok(data);
  }

  @Post()
  @ApiOperation({ summary: 'Create user' })
  async create(@Body() dto: CreateUserDto) {
    const data = await this.userService.create(dto);
    return ApiResponse.ok(data, 'User created successfully');
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
}
