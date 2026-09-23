import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { VoucherService } from './voucher-service';
import {
  CreateVoucherDto,
  UpdateVoucherDto,
  ValidateVoucherDto,
  VoucherFilterDto,
} from './voucher.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../../common/dto/api-response-dto';

@ApiTags('Voucher - Voucher/Promo')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-logic/voucher')
export class VoucherController {
  constructor(private voucherService: VoucherService) {}

  @Post()
  @ApiOperation({ summary: 'Create new voucher' })
  async createVoucher(@Body() dto: CreateVoucherDto) {
    const userId = 'system';
    const data = await this.voucherService.createVoucher(dto, userId);
    return ApiResponse.ok(data, 'Voucher created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'List vouchers' })
  async listVouchers(@Query() dto: VoucherFilterDto) {
    const data = await this.voucherService.listVouchers(dto);
    return ApiResponse.ok(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get voucher by ID' })
  async getVoucher(@Param('id') id: number) {
    const data = await this.voucherService.getVoucher(id);
    return ApiResponse.ok(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update voucher' })
  async updateVoucher(
    @Param('id') id: number,
    @Body() dto: UpdateVoucherDto,
  ) {
    const userId = 'system';
    const data = await this.voucherService.updateVoucher(id, dto, userId);
    return ApiResponse.ok(data, 'Voucher updated');
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate voucher code' })
  async validateVoucher(@Body() dto: ValidateVoucherDto) {
    const data = await this.voucherService.validateVoucher(dto);
    return ApiResponse.ok(data);
  }

  @Post(':id/use')
  @ApiOperation({ summary: 'Mark voucher as used' })
  async useVoucher(@Param('id') id: number) {
    const userId = 'system';
    const data = await this.voucherService.useVoucher(id, userId);
    return ApiResponse.ok(data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete (deactivate) voucher' })
  async deleteVoucher(@Param('id') id: number) {
    const userId = 'system';
    const data = await this.voucherService.deleteVoucher(id, userId);
    return ApiResponse.ok(data, 'Voucher deactivated');
  }
}
