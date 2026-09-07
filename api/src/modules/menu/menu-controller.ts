import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MenuService } from './menu-service';
import { CreateMenuDto, UpdateMenuDto, AssignMenuDto } from './dto/menu-dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../common/dto/api-response-dto';
import { CurrentUser } from '../../common/decorators/current-user-decorator';

interface JwtUser {
  id: number;
  role_id?: number;
}

@ApiTags('Menus')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('menus')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // ─── Menu CRUD ───────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Get all menus' })
  async findAll(@Query() query: Record<string, unknown>) {
    const { data, total, skip, take } = await this.menuService.findAll(query);
    return ApiResponse.paginated(data, total, skip, take);
  }

  @Get('my-menus')
  @ApiOperation({ summary: 'Get accessible menus for the current user' })
  async myMenus(@CurrentUser() user: JwtUser) {
    const menus = await this.menuService.getAccessibleMenus(user.id, user.role_id);
    return ApiResponse.ok(menus);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get menu by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.menuService.findOne(id);
    return ApiResponse.ok(data);
  }

  @Post()
  @ApiOperation({ summary: 'Create menu' })
  async create(@Body() dto: CreateMenuDto) {
    const data = await this.menuService.create(dto);
    return ApiResponse.ok(data, 'Menu created');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update menu' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMenuDto) {
    const data = await this.menuService.update(id, dto);
    return ApiResponse.ok(data, 'Menu updated');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate menu' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const data = await this.menuService.remove(id);
    return ApiResponse.ok(data, 'Menu deactivated');
  }

  // ─── Role Menus ──────────────────────────────────────────

  @Get('role/:roleId')
  @ApiOperation({ summary: 'Get menus assigned to a role' })
  async getRoleMenus(@Param('roleId', ParseIntPipe) roleId: number) {
    const data = await this.menuService.getRoleMenus(roleId);
    return ApiResponse.ok(data);
  }

  @Post('role/:roleId/assign')
  @ApiOperation({ summary: 'Assign menu to role' })
  async assignToRole(@Param('roleId', ParseIntPipe) roleId: number, @Body() dto: AssignMenuDto) {
    const data = await this.menuService.assignMenuToRole(roleId, dto.menu_id);
    return ApiResponse.ok(data, 'Menu assigned to role');
  }

  @Delete('role/:roleId/revoke/:menuId')
  @ApiOperation({ summary: 'Revoke menu from role' })
  async revokeFromRole(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('menuId', ParseIntPipe) menuId: number,
  ) {
    const data = await this.menuService.revokeMenuFromRole(roleId, menuId);
    return ApiResponse.ok(data, 'Menu revoked from role');
  }

  // ─── User Menus ──────────────────────────────────────────

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get menus assigned to a user' })
  async getUserMenus(@Param('userId', ParseIntPipe) userId: number) {
    const data = await this.menuService.getUserMenus(userId);
    return ApiResponse.ok(data);
  }

  @Post('user/:userId/assign')
  @ApiOperation({ summary: 'Assign menu to user (overrides role default)' })
  async assignToUser(@Param('userId', ParseIntPipe) userId: number, @Body() dto: AssignMenuDto) {
    const data = await this.menuService.assignMenuToUser(userId, dto.menu_id);
    return ApiResponse.ok(data, 'Menu assigned to user');
  }

  @Delete('user/:userId/revoke/:menuId')
  @ApiOperation({ summary: 'Revoke menu from user' })
  async revokeFromUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('menuId', ParseIntPipe) menuId: number,
  ) {
    const data = await this.menuService.revokeMenuFromUser(userId, menuId);
    return ApiResponse.ok(data, 'Menu revoked from user');
  }

  // ─── Access Check ─────────────────────────────────────────

  @Get('check/:menuName')
  @ApiOperation({ summary: 'Check if current user has access to a specific menu' })
  async checkAccess(@Param('menuName') menuName: string, @CurrentUser() user: JwtUser) {
    const hasAccess = await this.menuService.checkUserAccess(user.id, user.role_id, menuName);
    return ApiResponse.ok({ menu_name: menuName, has_access: hasAccess });
  }
}
