import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { YearCloseService } from './year-close.service';
import { YearCloseDto } from './year-close.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';
import { ApiResponse } from '../../common/dto/api-response-dto';

@ApiTags('Year Close - Tutup Tahun')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-logic/accounting')
export class YearCloseController {
  constructor(private yearCloseService: YearCloseService) {}

  @Get('fiscal-years')
  @ApiOperation({ summary: 'Get list of fiscal years with financial summary' })
  async getFiscalYears() {
    const data = await this.yearCloseService.getFiscalYears();
    return ApiResponse.ok(data);
  }

  @Post('year-close')
  @ApiOperation({ summary: 'Close a fiscal year' })
  async closeYear(@Body() dto: YearCloseDto, @CurrentUser() user: any) {
    const data = await this.yearCloseService.closeYear(dto, user.ID);
    return ApiResponse.ok(data, `Fiscal year ${dto.fiscalYear} closed successfully`);
  }
}
