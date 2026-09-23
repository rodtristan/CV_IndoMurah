import { Controller, Get, Post, Put, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { AccountingService } from './accounting-service';
import {
  CreateAccountDto,
  UpdateAccountDto,
  AccountFilterDto,
  CreateJournalEntryDto,
  JournalEntryFilterDto,
  GeneralLedgerFilterDto,
  TrialBalanceDto,
  BalanceSheetDto,
  ProfitLossDto,
  CashFlowDto,
  EquityChangeDto,
  CostOfGoodsSoldDto,
  CalculateDepreciationDto,
  ClosingEntryDto,
  OpeningEntryDto,
} from './accounting.dto';

@Controller('business-logic/accounting')
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // ACCOUNT MASTER DATA
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create new account
   * POST /api/business-logic/accounting/accounts
   */
  @Post('accounts')
  async createAccount(@Body() dto: CreateAccountDto, @Request() req: any) {
    return this.accountingService.createAccount(dto, req.user?.id || '1');
  }

  /**
   * Get account by ID
   * GET /api/business-logic/accounting/accounts/:id
   */
  @Get('accounts/:id')
  async getAccount(@Param('id') id: string) {
    return this.accountingService.getAccount(parseInt(id));
  }

  /**
   * List all accounts
   * GET /api/business-logic/accounting/accounts
   */
  @Get('accounts')
  async listAccounts(@Query() dto: AccountFilterDto) {
    return this.accountingService.listAccounts(dto);
  }

  /**
   * Update account
   * PUT /api/business-logic/accounting/accounts/:id
   */
  @Put('accounts/:id')
  async updateAccount(
    @Param('id') id: string,
    @Body() dto: UpdateAccountDto,
    @Request() req: any,
  ) {
    return this.accountingService.updateAccount(parseInt(id), dto, req.user?.id || '1');
  }

  /**
   * Get account tree structure
   * GET /api/business-logic/accounting/accounts/tree
   */
  @Get('accounts/tree')
  async getAccountTree() {
    return this.accountingService.getAccountTree();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // JOURNAL ENTRIES
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create journal entry
   * POST /api/business-logic/accounting/journal
   */
  @Post('journal')
  async createJournalEntry(@Body() dto: CreateJournalEntryDto, @Request() req: any) {
    return this.accountingService.createJournalEntry(dto, req.user?.id || '1');
  }

  /**
   * Get journal entry by ID
   * GET /api/business-logic/accounting/journal/:id
   */
  @Get('journal/:id')
  async getJournalEntry(@Param('id') id: string) {
    return this.accountingService.getJournalEntry(parseInt(id));
  }

  /**
   * List journal entries
   * GET /api/business-logic/accounting/journal
   */
  @Get('journal')
  async listJournalEntries(@Query() dto: JournalEntryFilterDto) {
    return this.accountingService.listJournalEntries(dto);
  }

  /**
   * Reverse journal entry
   * POST /api/business-logic/accounting/journal/:id/reverse
   */
  @Post('journal/:id/reverse')
  async reverseJournalEntry(
    @Param('id') id: string,
    @Body('reversalDate') reversalDate: string,
    @Request() req: any,
  ) {
    return this.accountingService.reverseJournalEntry(parseInt(id), reversalDate, req.user?.id || '1');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GENERAL LEDGER
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get general ledger report
   * GET /api/business-logic/accounting/general-ledger
   */
  @Get('general-ledger')
  async getGeneralLedger(@Query() dto: GeneralLedgerFilterDto) {
    return this.accountingService.getGeneralLedger(dto);
  }

  /**
   * Get trial balance
   * GET /api/business-logic/accounting/trial-balance
   */
  @Get('trial-balance')
  async getTrialBalance(@Query() dto: TrialBalanceDto) {
    return this.accountingService.getTrialBalance(dto);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FINANCIAL REPORTS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get balance sheet
   * GET /api/business-logic/accounting/balance-sheet
   */
  @Get('balance-sheet')
  async getBalanceSheet(@Query() dto: BalanceSheetDto) {
    return this.accountingService.getBalanceSheet(dto);
  }

  /**
   * Get profit and loss report
   * GET /api/business-logic/accounting/profit-loss
   */
  @Get('profit-loss')
  async getProfitAndLoss(@Query() dto: ProfitLossDto) {
    return this.accountingService.getProfitAndLoss(dto);
  }

  /**
   * Get cash flow statement
   * GET /api/business-logic/accounting/cash-flow
   */
  @Get('cash-flow')
  async getCashFlowStatement(@Query() dto: CashFlowDto) {
    return this.accountingService.getCashFlowStatement(dto);
  }

  /**
   * Get equity changes report
   * GET /api/business-logic/accounting/equity-changes
   */
  @Get('equity-changes')
  async getEquityChanges(@Query() dto: EquityChangeDto) {
    return this.accountingService.getEquityChanges(dto);
  }

  /**
   * Get cost of goods sold report
   * GET /api/business-logic/accounting/cogs
   */
  @Get('cogs')
  async getCostOfGoodsSold(@Query() dto: CostOfGoodsSoldDto) {
    return this.accountingService.getCostOfGoodsSold(dto);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DEPRECIATION
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Calculate depreciation
   * GET /api/business-logic/accounting/depreciation
   */
  @Get('depreciation')
  async calculateDepreciation(@Query() dto: CalculateDepreciationDto) {
    return this.accountingService.calculateDepreciation(dto);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PERIOD CLOSING
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create closing entries
   * POST /api/business-logic/accounting/closing
   */
  @Post('closing')
  async createClosingEntries(@Body() dto: ClosingEntryDto, @Request() req: any) {
    return this.accountingService.createClosingEntries(dto, req.user?.id || '1');
  }

  /**
   * Create opening entries
   * POST /api/business-logic/accounting/opening
   */
  @Post('opening')
  async createOpeningEntries(@Body() dto: OpeningEntryDto, @Request() req: any) {
    return this.accountingService.createOpeningEntries(dto, req.user?.id || '1');
  }
}
