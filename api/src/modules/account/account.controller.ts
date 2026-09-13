import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AccountService } from './account.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../common/dto/api-response-dto';

@ApiTags('Accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  @ApiOperation({ summary: 'Get all accounts (Smart Query supported)' })
  @ApiQuery({ name: '$select', required: false })
  @ApiQuery({ name: '$where[code]', required: false })
  @ApiQuery({ name: '$where[name]', required: false })
  @ApiQuery({ name: '$where[type]', required: false })
  @ApiQuery({ name: '$where[isActive]', required: false })
  @ApiQuery({ name: '$search', required: false })
  @ApiQuery({ name: '$orderBy[code]', required: false })
  @ApiQuery({ name: '$skip', required: false })
  @ApiQuery({ name: '$take', required: false })
  async findAll(@Query() query: Record<string, unknown>) {
    const { data, total, skip, take } = await this.accountService.findAll(query);
    return ApiResponse.paginated(data, total, skip, take);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get accounts as tree structure' })
  async getTree() {
    const data = await this.accountService.getTree();
    return ApiResponse.ok(data);
  }

  @Get('by-type/:type')
  @ApiOperation({ summary: 'Get accounts by type' })
  async getByType(@Param('type') type: string) {
    const data = await this.accountService.getByType(type);
    return ApiResponse.ok(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.accountService.findOne(id);
    return ApiResponse.ok(data);
  }

  @Post()
  @ApiOperation({ summary: 'Create account' })
  async create(@Body() dto: CreateAccountDto) {
    const data = await this.accountService.create(dto);
    return ApiResponse.ok(data, 'Account created');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update account' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAccountDto) {
    const data = await this.accountService.update(id, dto);
    return ApiResponse.ok(data, 'Account updated');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete account (soft delete)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.accountService.remove(id);
    return ApiResponse.ok(null, 'Account deleted');
  }
}
