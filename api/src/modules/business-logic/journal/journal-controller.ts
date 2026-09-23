import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JournalService } from './journal-service';
import {
  CreateJournalEntryDto,
  UpDateJournalEntryDto,
  JournalEntryQueryDto,
  CancelJournalEntryDto,
  AccountBalanceDto,
  TrialBalanceDto,
} from './journal.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../../common/dto/api-response-dto';

@ApiTags('Journal - Jurnal Umum')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-logic/journal')
export class JournalController {
  constructor(private journalService: JournalService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // CREATE
  // ─────────────────────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create new journal entry (Jurnal Umum)' })
  async create(@Body() dto: CreateJournalEntryDto) {
    const data = await this.journalService.create(dto);
    return ApiResponse.ok(data, 'Journal entry created successfully');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // QUERY
  // ─────────────────────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List all journal entries' })
  async findAll(@Query() dto: JournalEntryQueryDto) {
    const data = await this.journalService.findAll(dto);
    return ApiResponse.ok(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get journal entry by ID' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    const data = await this.journalService.findById(id);
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // UPDATE
  // ─────────────────────────────────────────────────────────────────────────────

  @Patch(':id')
  @ApiOperation({ summary: 'Update journal entry (unposted only)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpDateJournalEntryDto,
  ) {
    const data = await this.journalService.update(id, dto);
    return ApiResponse.ok(data, 'Journal entry updated');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────────────────────────────────────────

  @Post(':id/post')
  @ApiOperation({ summary: 'Post journal entry (Kunci transaksi)' })
  async post(@Param('id', ParseIntPipe) id: number) {
    const data = await this.journalService.post(id);
    return ApiResponse.ok(data, 'Journal entry posted');
  }

  @Post(':id/unpost')
  @ApiOperation({ summary: 'Unpost journal entry (Buka transaksi)' })
  async unpost(@Param('id', ParseIntPipe) id: number) {
    const data = await this.journalService.unpost(id);
    return ApiResponse.ok(data, 'Journal entry unposted');
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel journal entry' })
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelJournalEntryDto,
  ) {
    const data = await this.journalService.cancel(id, dto);
    return ApiResponse.ok(data, 'Journal entry cancelled');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // REPORTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('reports/account-balance')
  @ApiOperation({ summary: 'Get account balance as of date' })
  async getAccountBalance(@Query() dto: AccountBalanceDto) {
    const data = await this.journalService.getAccountBalance(dto);
    return ApiResponse.ok(data);
  }

  @Get('reports/trial-balance')
  @ApiOperation({ summary: 'Get trial balance report (Neraca Saldo)' })
  async getTrialBalance(@Query() dto: TrialBalanceDto) {
    const data = await this.journalService.getTrialBalance(dto);
    return ApiResponse.ok(data);
  }
}
