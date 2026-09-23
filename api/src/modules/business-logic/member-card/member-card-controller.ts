import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { MemberCardService } from './member-card-service';
import {
  CreateMemberCardDto,
  UpdateMemberCardDto,
  CardTopUpDto,
  CardWithdrawDto,
  CardTransferDto,
  ReplaceCardDto,
  MemberCardFilterDto,
  CardTransactionFilterDto,
  CardBalanceReportDto,
} from './member-card.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../../common/dto/api-response-dto';

@ApiTags('Member Card - Kartu Anggota')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-logic/member-card')
export class MemberCardController {
  constructor(private memberCardService: MemberCardService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // CARD MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create new member card' })
  async createCard(@Body() dto: CreateMemberCardDto) {
    const data = await this.memberCardService.createCard(dto, 'system');
    return ApiResponse.ok(data, 'Member card created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'List member cards' })
  async listCards(@Query() dto: MemberCardFilterDto) {
    const data = await this.memberCardService.listCards(dto);
    return ApiResponse.ok(data);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get card statistics' })
  async getCardStats() {
    const data = await this.memberCardService.getCardStats();
    return ApiResponse.ok(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get card by ID' })
  async getCard(@Param('id') id: number) {
    const data = await this.memberCardService.getCard(id);
    return ApiResponse.ok(data);
  }

  @Get('number/:cardNumber')
  @ApiOperation({ summary: 'Get card by card number' })
  async getCardByNumber(@Param('cardNumber') cardNumber: string) {
    const data = await this.memberCardService.getCardByNumber(cardNumber);
    return ApiResponse.ok(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update member card' })
  async updateCard(@Param('id') id: number, @Body() dto: UpdateMemberCardDto) {
    const data = await this.memberCardService.updateCard(id, dto, 'system');
    return ApiResponse.ok(data, 'Card updated successfully');
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate member card' })
  async activateCard(@Param('id') id: number) {
    const data = await this.memberCardService.activateCard(id, 'system');
    return ApiResponse.ok(data, 'Card activated successfully');
  }

  @Post(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate member card' })
  async deactivateCard(@Param('id') id: number) {
    const data = await this.memberCardService.deactivateCard(id, 'system');
    return ApiResponse.ok(data, 'Card deactivated successfully');
  }

  @Post(':id/replace')
  @ApiOperation({ summary: 'Replace lost/damaged card' })
  async replaceCard(@Param('id') id: number, @Body() dto: ReplaceCardDto) {
    const data = await this.memberCardService.replaceCard(id, dto, 'system');
    return ApiResponse.ok(data, 'Card replaced successfully');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CARD TRANSACTIONS
  // ─────────────────────────────────────────────────────────────────────────────

  @Get(':id/balance')
  @ApiOperation({ summary: 'Get card balance' })
  async getBalance(@Param('id') id: number) {
    const data = await this.memberCardService.getBalance(id);
    return ApiResponse.ok(data);
  }

  @Post(':id/top-up')
  @ApiOperation({ summary: 'Top-up card balance' })
  async topUp(@Param('id') id: number, @Body() dto: CardTopUpDto) {
    const data = await this.memberCardService.topUp(id, dto, 'system');
    return ApiResponse.ok(data, 'Top-up successful');
  }

  @Post(':id/withdraw')
  @ApiOperation({ summary: 'Withdraw from card' })
  async withdraw(@Param('id') id: number, @Body() dto: CardWithdrawDto) {
    const data = await this.memberCardService.withdraw(id, dto, 'system');
    return ApiResponse.ok(data, 'Withdrawal successful');
  }

  @Post(':id/transfer')
  @ApiOperation({ summary: 'Transfer balance to another card' })
  async transfer(@Param('id') id: number, @Body() dto: CardTransferDto) {
    const data = await this.memberCardService.transfer(id, dto, 'system');
    return ApiResponse.ok(data, 'Transfer successful');
  }

  @Get(':id/transactions')
  @ApiOperation({ summary: 'Get card transaction history' })
  async getTransactions(@Param('id') id: number, @Query() dto: CardTransactionFilterDto) {
    const data = await this.memberCardService.getTransactions(id, dto);
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // REPORTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('reports/balance')
  @ApiOperation({ summary: 'Get card balance report' })
  async getBalanceReport(@Query() dto: CardBalanceReportDto) {
    const data = await this.memberCardService.getBalanceReport(dto);
    return ApiResponse.ok(data);
  }
}
