import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../common/dto/api-response-dto';
import { CurrentUser } from '../../common/decorators/current-user-decorator';
import { FiscalYearService } from './fiscal-year.service';

@ApiTags('FiscalYear')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fiscal-year')
export class FiscalYearController {
  constructor(private readonly service: FiscalYearService) {}

  @Get()
  async status() {
    return ApiResponse.ok(await this.service.status());
  }

  @Post('close')
  async close(@Body() body: { year: number }, @CurrentUser() user: any) {
    return ApiResponse.ok(await this.service.close(body?.year, user?.id), `Tahun ${body?.year} berhasil ditutup`);
  }
}
