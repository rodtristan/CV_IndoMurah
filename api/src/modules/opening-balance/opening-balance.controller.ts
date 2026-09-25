import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../common/dto/api-response-dto';
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
  async list(@Param('type') type: string) {
    return ApiResponse.ok(await this.service.list(type));
  }

  /** Replace all rows of the type (save-all). */
  @Put(':type')
  async saveAll(@Param('type') type: string, @Body() dto: SaveOpeningDto, @CurrentUser() user: any) {
    return ApiResponse.ok(await this.service.saveAll(type, dto, user?.id), 'Saldo awal tersimpan');
  }
}
