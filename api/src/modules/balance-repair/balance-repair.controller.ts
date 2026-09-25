import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { BalanceRepairService } from './balance-repair.service';
import {
  RepairBalanceDto,
  BalanceCheckDto,
} from './balance-repair.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';

@Controller('accounting')
@UseGuards(JwtAuthGuard)
export class BalanceRepairController {
  constructor(private readonly balanceRepairService: BalanceRepairService) {}

  @Get('balance-discrepancies')
  async checkDiscrepancies(@Query() dto: BalanceCheckDto) {
    return this.balanceRepairService.checkDiscrepancies(dto);
  }

  @Get('balance/:accountId')
  async getAccountBalance(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Query('asOfDate') asOfDate?: string,
  ) {
    return this.balanceRepairService.getAccountBalance(accountId, asOfDate);
  }

  @Get('balance-history/:accountId')
  async getBalanceHistory(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.balanceRepairService.getBalanceHistory(accountId, startDate, endDate);
  }

  @Post('repair-balance')
  async repairBalance(
    @Body() dto: RepairBalanceDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.balanceRepairService.repairBalance(dto, userId);
  }
}
