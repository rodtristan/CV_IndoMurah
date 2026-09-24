import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { AccountSettingService } from './account-setting.service';

@ApiTags('AccountSetting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('account-setting')
export class AccountSettingController {
  constructor(private readonly service: AccountSettingService) {}

  @Get()
  getAll() {
    return this.service.getAll();
  }

  @Put()
  saveAll(@Body() body: Record<string, number | string | null>) {
    return this.service.saveAll(body);
  }
}
