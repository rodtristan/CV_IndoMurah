import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CashTransferService } from './cash-transfer.service';
import { CreateCashTransferDto, UpdateCashTransferDto } from './dto/cash-transfer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../common/dto/api-response-dto';
import { CurrentUser } from '../../common/decorators/current-user-decorator';

interface JwtUser { id: string; }

@ApiTags('Cash Transfer')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cash-transfers')
export class CashTransferController {
  constructor(private readonly cashTransferService: CashTransferService) {}

  @Get()
  @ApiOperation({ summary: 'Get all cash transfers' })
  async findAll(@Query() query: Record<string, unknown>) {
    const { data, total, skip, take } = await this.cashTransferService.findAll(query);
    return ApiResponse.paginated(data, total, skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cash transfer by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.cashTransferService.findOne(id);
    return ApiResponse.ok(data);
  }

  @Post()
  @ApiOperation({ summary: 'Create cash transfer' })
  async create(@Body() dto: CreateCashTransferDto, @CurrentUser() user: JwtUser) {
    const data = await this.cashTransferService.create(dto, user.id);
    return ApiResponse.ok(data, 'Cash Transfer created');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update cash transfer' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCashTransferDto) {
    const data = await this.cashTransferService.update(id, dto);
    return ApiResponse.ok(data, 'Cash Transfer updated');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete cash transfer' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.cashTransferService.remove(id);
    return ApiResponse.ok(null, 'Cash Transfer deleted');
  }
}
