import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';
import { FiscalYearService } from './fiscal-year.service';

@ApiTags('FiscalYear')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fiscal-year')
export class FiscalYearController {
  constructor(private readonly service: FiscalYearService) {}

  @Get()
  status() {
    return this.service.status();
  }

  @Post('close')
  close(@Body() body: { year: number }, @CurrentUser() user: any) {
    return this.service.close(body?.year, user?.id);
  }
}
