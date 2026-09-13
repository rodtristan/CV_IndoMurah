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
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { StockInService } from './stock-in.service';
import { CreateStockInDto, UpdateStockInDto, UpdateStatusDto } from './dto/stock-in.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';
import { ApiResponse } from '../../common/dto/api-response-dto';

@ApiTags('Stock Ins')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stock-ins')
export class StockInController {
  constructor(private stockInService: StockInService) {}

  @Get()
  @ApiOperation({ summary: 'Get all stock ins (Smart Query supported)' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations: warehouse,supplier,items' })
  @ApiQuery({ name: '$where[status]', required: false, description: 'Filter by status' })
  @ApiQuery({ name: '$where[warehouse_id]', required: false, description: 'Filter by warehouse' })
  @ApiQuery({ name: '$search', required: false, description: 'Search keyword' })
  @ApiQuery({ name: '$orderBy[createdAt]', required: false, description: 'Sort: asc/desc' })
  @ApiQuery({ name: '$skip', required: false, description: 'Offset', type: Number })
  @ApiQuery({ name: '$take', required: false, description: 'Limit', type: Number })
  async findAll(@Query() query: Record<string, unknown>) {
    const { data, total, skip, take } = await this.stockInService.findAll(query);
    return ApiResponse.paginated(data, total, skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get stock in by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Query() query: any) {
    const data = await this.stockInService.findOne(id, query);
    if (!data) throw new NotFoundException('Stock in not found');
    return ApiResponse.ok(data);
  }

  @Get('report/summary')
  @ApiOperation({ summary: 'Get stock in summary report' })
  async getReport(@Query() query: any) {
    const result = await this.stockInService.getReport(query);
    return ApiResponse.ok(result);
  }

  @Post()
  @ApiOperation({ summary: 'Create stock in' })
  async create(@Body() dto: CreateStockInDto, @CurrentUser() user: any) {
    const data = await this.stockInService.create(dto, user.id);
    return ApiResponse.ok(data, 'Stock in created successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update stock in' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStockInDto) {
    const data = await this.stockInService.update(id, dto);
    return ApiResponse.ok(data, 'Stock in updated successfully');
  }

  @Put(':id/confirm')
  @ApiOperation({ summary: 'Confirm stock in' })
  async confirm(@Param('id', ParseIntPipe) id: number) {
    const data = await this.stockInService.updateStatus(id, { status: 'CONFIRMED' });
    return ApiResponse.ok(data, 'Stock in confirmed');
  }

  @Put(':id/complete')
  @ApiOperation({ summary: 'Complete stock in (updates product stock)' })
  async complete(@Param('id', ParseIntPipe) id: number) {
    const data = await this.stockInService.updateStatus(id, { status: 'COMPLETED' });
    return ApiResponse.ok(data, 'Stock in completed and product stock updated');
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel stock in' })
  async cancel(@Param('id', ParseIntPipe) id: number) {
    const data = await this.stockInService.updateStatus(id, { status: 'CANCELLED' });
    return ApiResponse.ok(data, 'Stock in cancelled');
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update stock in status' })
  async updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStatusDto) {
    const data = await this.stockInService.updateStatus(id, dto);
    return ApiResponse.ok(data, 'Status updated successfully');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete draft stock in' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.stockInService.delete(id);
    return ApiResponse.ok({ id }, 'Stock in deleted successfully');
  }
}
