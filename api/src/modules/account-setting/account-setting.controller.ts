import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../common/dto/api-response-dto';
import { AccountSettingService } from './account-setting.service';

@ApiTags('AccountSetting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('account-setting')
export class AccountSettingController {
  constructor(private readonly service: AccountSettingService) {}

  @Get()
  async getAll() {
    return ApiResponse.ok(await this.service.getAll());
  }

  @Put()
  async saveAll(@Body() body: Record<string, number | string | null>) {
    return ApiResponse.ok(await this.service.saveAll(body), 'Setting perkiraan tersimpan');
  }
}
