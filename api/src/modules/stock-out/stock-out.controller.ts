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
import { StockOutService } from './stock-out.service';
import { CreateStockOutDto, UpdateStockOutDto, UpdateStatusDto } from './dto/stock-out.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';
import { ApiResponse } from '../../common/dto/api-response-dto';

@ApiTags('Stock Outs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stock-outs')
export class StockOutController {
  constructor(private stockOutService: StockOutService) {}

  @Get()
  @ApiOperation({ summary: 'Get all stock outs (Smart Query supported)' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations: warehouse,items' })
  @ApiQuery({ name: '$where[status]', required: false, description: 'Filter by status' })
  @ApiQuery({ name: '$where[warehouse_id]', required: false, description: 'Filter by warehouse' })
  @ApiQuery({ name: '$search', required: false, description: 'Search keyword' })
  @ApiQuery({ name: '$orderBy[createdAt]', required: false, description: 'Sort: asc/desc' })
  @ApiQuery({ name: '$skip', required: false, description: 'Offset', type: Number })
  @ApiQuery({ name: '$take', required: false, description: 'Limit', type: Number })
  async findAll(@Query() query: Record<string, unknown>) {
    const { data, total, skip, take } = await this.stockOutService.findAll(query);
    return ApiResponse.paginated(data, total, skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get stock out by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Query() query: any) {
    const data = await this.stockOutService.findOne(id, query);
    if (!data) throw new NotFoundException('Stock out not found');
    return ApiResponse.ok(data);
  }

  @Get('report/summary')
  @ApiOperation({ summary: 'Get stock out summary report' })
  async getReport(@Query() query: any) {
    const result = await this.stockOutService.getReport(query);
    return ApiResponse.ok(result);
  }

  @Post()
  @ApiOperation({ summary: 'Create stock out' })
  async create(@Body() dto: CreateStockOutDto, @CurrentUser() user: any) {
    const data = await this.stockOutService.create(dto, user.id);
    return ApiResponse.ok(data, 'Stock out created successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update stock out' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStockOutDto) {
    const data = await this.stockOutService.update(id, dto);
    return ApiResponse.ok(data, 'Stock out updated successfully');
  }

  @Put(':id/confirm')
  @ApiOperation({ summary: 'Confirm stock out' })
  async confirm(@Param('id', ParseIntPipe) id: number) {
    const data = await this.stockOutService.updateStatus(id, { status: 'CONFIRMED' });
    return ApiResponse.ok(data, 'Stock out confirmed');
  }

  @Put(':id/complete')
  @ApiOperation({ summary: 'Complete stock out (updates product stock)' })
  async complete(@Param('id', ParseIntPipe) id: number) {
    const data = await this.stockOutService.updateStatus(id, { status: 'COMPLETED' });
    return ApiResponse.ok(data, 'Stock out completed and product stock updated');
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel stock out' })
  async cancel(@Param('id', ParseIntPipe) id: number) {
    const data = await this.stockOutService.updateStatus(id, { status: 'CANCELLED' });
    return ApiResponse.ok(data, 'Stock out cancelled');
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update stock out status' })
  async updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStatusDto) {
    const data = await this.stockOutService.updateStatus(id, dto);
    return ApiResponse.ok(data, 'Status updated successfully');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete draft stock out' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.stockOutService.delete(id);
    return ApiResponse.ok({ id }, 'Stock out deleted successfully');
  }
}
