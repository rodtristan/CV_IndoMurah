import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';
import { OpeningBalanceService, SaveOpeningDto } from './opening-balance.service';

@ApiTags('OpeningBalance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('opening-balance')
export class OpeningBalanceController {
  constructor(private readonly service: OpeningBalanceService) {}

  /** type = account | debt | receivable */
  @Get(':type')
  list(@Param('type') type: string) {
    return this.service.list(type);
  }

  /** Replace all rows of the type (save-all). */
  @Put(':type')
  saveAll(@Param('type') type: string, @Body() dto: SaveOpeningDto, @CurrentUser() user: any) {
    return this.service.saveAll(type, dto, user?.id);
  }
}
