import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LoyaltyService } from './loyalty-service';
import {
  UpDatePointSettingsDto,
  RedeemPointsDto,
  CalculatePointsDto,
  AwardPointsDto,
  RedemptionFilterDto,
} from './loyalty.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../../common/dto/api-response-dto';

@ApiTags('Loyalty - Loyalty & Poin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-logic/loyalty')
export class LoyaltyController {
  constructor(private loyaltyService: LoyaltyService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // SETTINGS ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('settings')
  @ApiOperation({ summary: 'Get point settings' })
  async getPointSettings() {
    const data = await this.loyaltyService.getPointSettings();
    return ApiResponse.ok(data);
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Update point settings' })
  async updatePointSettings(@Body() dto: UpDatePointSettingsDto) {
    const userId = 'system';
    const data = await this.loyaltyService.updatePointSettings(dto, userId);
    return ApiResponse.ok(data, 'Point settings updated');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POINT CALCULATION ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate points for transaction' })
  async calculatePoints(@Body() dto: CalculatePointsDto) {
    const data = await this.loyaltyService.calculatePoints(dto);
    return ApiResponse.ok(data);
  }

  @Post('award')
  @ApiOperation({ summary: 'Award points to customer' })
  async awardPoints(@Body() dto: AwardPointsDto) {
    const userId = 'system';
    const data = await this.loyaltyService.awardPoints(dto, userId);
    return ApiResponse.ok(data, 'Points awarded successfully');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CUSTOMER POINTS ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get customer points summary' })
  async getCustomerPoints(@Param('customerId') customerId: number) {
    const data = await this.loyaltyService.getCustomerPoints(customerId);
    return ApiResponse.ok(data);
  }

  @Post('customer/:customerId/redeem')
  @ApiOperation({ summary: 'Redeem customer points' })
  async redeemPoints(
    @Param('customerId') customerId: number,
    @Body() dto: RedeemPointsDto,
  ) {
    const userId = 'system';
    const data = await this.loyaltyService.redeemPoints(customerId, dto, userId);
    return ApiResponse.ok(data, 'Points redeemed successfully');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // REDEMPTION LIST ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────────

  @Get('redemptions')
  @ApiOperation({ summary: 'List point redemptions' })
  async listRedemptions(@Query() dto: RedemptionFilterDto) {
    const data = await this.loyaltyService.listRedemptions(dto);
    return ApiResponse.ok(data);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get loyalty program statistics' })
  async getLoyaltyStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const data = await this.loyaltyService.getLoyaltyStats(startDate, endDate);
    return ApiResponse.ok(data);
  }
}
