import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { StockTransferService } from './stock-transfer-service';
import {
  CreateStockTransferDto,
  StockTransferFilterDto,
  StockTransferSummaryDto,
} from './stock-transfer.dto';

@Controller('business-logic/stock-transfers')
export class StockTransferController {
  constructor(private readonly stockTransferService: StockTransferService) {}

  @Post()
  async createStockTransfer(
    @Body() dto: CreateStockTransferDto,
    @Query('userId') userId: string = 'system',
  ) {
    return this.stockTransferService.createStockTransfer(dto, userId);
  }

  @Get()
  async listStockTransfers(@Query() dto: StockTransferFilterDto) {
    return this.stockTransferService.listStockTransfers(dto);
  }

  @Get('summary')
  async getStockTransferSummary(@Query() dto: StockTransferSummaryDto) {
    return this.stockTransferService.getStockTransferSummary(dto);
  }

  @Get(':id')
  async getStockTransfer(@Param('id', ParseIntPipe) id: number) {
    return this.stockTransferService.getStockTransfer(id);
  }

  @Post(':id/complete')
  async completeStockTransfer(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId') userId: string = 'system',
  ) {
    return this.stockTransferService.completeStockTransfer(id, userId);
  }

  @Post(':id/cancel')
  async cancelStockTransfer(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId') userId: string = 'system',
  ) {
    return this.stockTransferService.cancelStockTransfer(id, userId);
  }
}
