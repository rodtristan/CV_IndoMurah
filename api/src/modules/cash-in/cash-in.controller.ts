import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CashInService } from './cash-in.service';
import { CreateCashInDto, UpdateCashInDto } from './dto/cash-in.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../common/dto/api-response-dto';
import { CurrentUser } from '../../common/decorators/current-user-decorator';

interface JwtUser { id: string; }

@ApiTags('Cash In')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cash-ins')
export class CashInController {
  constructor(private readonly cashInService: CashInService) {}

  @Get()
  @ApiOperation({ summary: 'Get all cash ins' })
  async findAll(@Query() query: Record<string, unknown>) {
    const { data, total, skip, take } = await this.cashInService.findAll(query);
    return ApiResponse.paginated(data, total, skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cash in by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.cashInService.findOne(id);
    return ApiResponse.ok(data);
  }

  @Post()
  @ApiOperation({ summary: 'Create cash in' })
  async create(@Body() dto: CreateCashInDto, @CurrentUser() user: JwtUser) {
    const data = await this.cashInService.create(dto, user.id);
    return ApiResponse.ok(data, 'Cash In created');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update cash in' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCashInDto) {
    const data = await this.cashInService.update(id, dto);
    return ApiResponse.ok(data, 'Cash In updated');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete cash in' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.cashInService.remove(id);
    return ApiResponse.ok(null, 'Cash In deleted');
  }
}
