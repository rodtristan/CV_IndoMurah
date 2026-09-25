import { Controller, Get, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';
import { ApiResponse } from '../../common/dto/api-response-dto';
import { FiscalYearService } from '../fiscal-year/fiscal-year.service';

/**
 * Legacy routes (business-logic/accounting/fiscal-years, business-logic/accounting/year-close).
 * The only year-close implementation is FiscalYearService (FiscalYearClose + one YEAR_CLOSE journal);
 * these routes just delegate to it so old clients cannot create the former OpeningBalance 'YEAR_CLOSE'
 * rows / duplicate opening balances. New clients use GET /fiscal-year and POST /fiscal-year/close.
 */
@ApiTags('Year Close - Tutup Tahun (legacy, delegates to /fiscal-year)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-logic/accounting')
export class YearCloseController {
  constructor(private readonly fiscalYear: FiscalYearService) {}

  @Get('fiscal-years')
  @ApiOperation({ summary: 'List fiscal years (delegates to GET /fiscal-year)' })
  async getFiscalYears() {
    const s = await this.fiscalYear.status();
    return ApiResponse.ok(s.years.map((y: any) => ({ ...y, isLocked: y.closed })));
  }

  @Post('year-close')
  @ApiOperation({ summary: 'Close a fiscal year (delegates to POST /fiscal-year/close)' })
  async closeYear(@Body() body: Record<string, unknown>, @CurrentUser() user: any) {
    const year = Number(body?.fiscalYear ?? body?.year);
    if (!Number.isInteger(year)) throw new BadRequestException('fiscalYear wajib diisi');
    const data = await this.fiscalYear.close(year, user.id);
    return ApiResponse.ok(data, `Tahun buku ${year} berhasil ditutup`);
  }
}
