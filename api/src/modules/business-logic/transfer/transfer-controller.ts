import { Controller, Get, Post, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { TransferService } from './transfer-service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../../common/decorators/current-user-decorator';
import {
  CreateTransferDto,
  TransferFilterDto,
  TransferSummaryDto,
} from './transfer.dto';

@UseGuards(JwtAuthGuard)
@Controller('business-logic/transfers')
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @Post()
  async createTransfer(
    @Body() dto: CreateTransferDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.transferService.createTransfer(dto, userId);
  }

  @Get()
  async listTransfers(@Query() dto: TransferFilterDto) {
    return this.transferService.listTransfers(dto);
  }

  @Get('summary')
  async getTransferSummary(@Query() dto: TransferSummaryDto) {
    return this.transferService.getTransferSummary(dto);
  }

  @Get('accounts')
  async getAccounts() {
    return this.transferService.getAccounts();
  }

  @Get(':id')
  async getTransfer(@Param('id', ParseIntPipe) id: number) {
    return this.transferService.getTransfer(id);
  }

  @Delete(':id')
  async deleteTransfer(@Param('id', ParseIntPipe) id: number) {
    return this.transferService.deleteTransfer(id);
  }
}
