import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CashOutService } from './cash-out.service';
import { CreateCashOutDto, UpdateCashOutDto } from './dto/cash-out.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../common/dto/api-response-dto';
import { CurrentUser } from '../../common/decorators/current-user-decorator';

interface JwtUser { id: string; }

@ApiTags('Cash Out')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cash-outs')
export class CashOutController {
  constructor(private readonly cashOutService: CashOutService) {}

  @Get()
  @ApiOperation({ summary: 'Get all cash outs' })
  async findAll(@Query() query: Record<string, unknown>) {
    const { data, total, skip, take } = await this.cashOutService.findAll(query);
    return ApiResponse.paginated(data, total, skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cash out by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.cashOutService.findOne(id);
    return ApiResponse.ok(data);
  }

  @Post()
  @ApiOperation({ summary: 'Create cash out' })
  async create(@Body() dto: CreateCashOutDto, @CurrentUser() user: JwtUser) {
    const data = await this.cashOutService.create(dto, user.id);
    return ApiResponse.ok(data, 'Cash Out created');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update cash out' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCashOutDto) {
    const data = await this.cashOutService.update(id, dto);
    return ApiResponse.ok(data, 'Cash Out updated');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete cash out' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.cashOutService.remove(id);
    return ApiResponse.ok(null, 'Cash Out deleted');
  }
}
