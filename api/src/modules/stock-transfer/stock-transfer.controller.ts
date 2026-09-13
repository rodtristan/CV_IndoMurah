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
import { StockTransferService } from './stock-transfer.service';
import { CreateStockTransferDto, UpdateStockTransferDto, UpdateStatusDto } from './dto/stock-transfer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';
import { ApiResponse } from '../../common/dto/api-response-dto';

@ApiTags('Stock Transfers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stock-transfers')
export class StockTransferController {
  constructor(private stockTransferService: StockTransferService) {}

  @Get()
  @ApiOperation({ summary: 'Get all stock transfers (Smart Query supported)' })
  @ApiQuery({ name: '$select', required: false, description: 'Select fields' })
  @ApiQuery({ name: '$include', required: false, description: 'Include relations: fromWarehouse,toWarehouse,items' })
  @ApiQuery({ name: '$where[status]', required: false, description: 'Filter by status' })
  @ApiQuery({ name: '$where[from_warehouse_id]', required: false, description: 'Filter by from warehouse' })
  @ApiQuery({ name: '$where[to_warehouse_id]', required: false, description: 'Filter by to warehouse' })
  @ApiQuery({ name: '$search', required: false, description: 'Search keyword' })
  @ApiQuery({ name: '$orderBy[createdAt]', required: false, description: 'Sort: asc/desc' })
  @ApiQuery({ name: '$skip', required: false, description: 'Offset', type: Number })
  @ApiQuery({ name: '$take', required: false, description: 'Limit', type: Number })
  async findAll(@Query() query: Record<string, unknown>) {
    const { data, total, skip, take } = await this.stockTransferService.findAll(query);
    return ApiResponse.paginated(data, total, skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get stock transfer by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Query() query: any) {
    const data = await this.stockTransferService.findOne(id, query);
    if (!data) throw new NotFoundException('Stock transfer not found');
    return ApiResponse.ok(data);
  }

  @Get('report/summary')
  @ApiOperation({ summary: 'Get stock transfer summary report' })
  async getReport(@Query() query: any) {
    const result = await this.stockTransferService.getReport(query);
    return ApiResponse.ok(result);
  }

  @Post()
  @ApiOperation({ summary: 'Create stock transfer' })
  async create(@Body() dto: CreateStockTransferDto, @CurrentUser() user: any) {
    const data = await this.stockTransferService.create(dto, user.id);
    return ApiResponse.ok(data, 'Stock transfer created successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update stock transfer' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStockTransferDto) {
    const data = await this.stockTransferService.update(id, dto);
    return ApiResponse.ok(data, 'Stock transfer updated successfully');
  }

  @Put(':id/confirm')
  @ApiOperation({ summary: 'Confirm stock transfer' })
  async confirm(@Param('id', ParseIntPipe) id: number) {
    const data = await this.stockTransferService.updateStatus(id, { status: 'CONFIRMED' });
    return ApiResponse.ok(data, 'Stock transfer confirmed');
  }

  @Put(':id/complete')
  @ApiOperation({ summary: 'Complete stock transfer (updates product stock)' })
  async complete(@Param('id', ParseIntPipe) id: number) {
    const data = await this.stockTransferService.updateStatus(id, { status: 'COMPLETED' });
    return ApiResponse.ok(data, 'Stock transfer completed and product stock updated');
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel stock transfer' })
  async cancel(@Param('id', ParseIntPipe) id: number) {
    const data = await this.stockTransferService.updateStatus(id, { status: 'CANCELLED' });
    return ApiResponse.ok(data, 'Stock transfer cancelled');
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update stock transfer status' })
  async updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStatusDto) {
    const data = await this.stockTransferService.updateStatus(id, dto);
    return ApiResponse.ok(data, 'Status updated successfully');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete draft stock transfer' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.stockTransferService.delete(id);
    return ApiResponse.ok({ id }, 'Stock transfer deleted successfully');
  }
}
