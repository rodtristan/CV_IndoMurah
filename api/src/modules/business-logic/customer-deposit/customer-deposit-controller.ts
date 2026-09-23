import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CustomerDepositService } from './customer-deposit-service';
import {
  CreateCustomerDepositDto,
  UpdateCustomerDepositDto,
  CustomerDepositQueryDto,
  UseCustomerDepositDto,
  CustomerDepositSummaryDto,
} from './customer-deposit.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../../common/dto/api-response-dto';

@ApiTags('Customer Deposit - Deposit Pelanggan')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-logic/customer-deposit')
export class CustomerDepositController {
  constructor(private customerDepositService: CustomerDepositService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // CREATE
  // ─────────────────────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create new customer deposit (Deposit/Titipan Pelanggan)' })
  async create(@Body() dto: CreateCustomerDepositDto) {
    const data = await this.customerDepositService.create(dto);
    return ApiResponse.ok(data, 'Customer deposit created successfully');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // QUERY
  // ─────────────────────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List all customer deposits' })
  async findAll(@Query() dto: CustomerDepositQueryDto) {
    const data = await this.customerDepositService.findAll(dto);
    return ApiResponse.ok(data);
  }

  @Get('summary/:customerId')
  @ApiOperation({ summary: 'Get customer deposit summary/balance' })
  async getCustomerSummary(@Param('customerId', ParseIntPipe) customerId: number) {
    const data = await this.customerDepositService.getCustomerSummary({ CustomerId: customerId });
    return ApiResponse.ok(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get deposit by ID' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    const data = await this.customerDepositService.findById(id);
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────────────────────────────────────────

  @Post('use')
  @ApiOperation({ summary: 'Use customer deposit for payment (Potong deposit saat bayar)' })
  async useDeposit(@Body() dto: UseCustomerDepositDto) {
    const data = await this.customerDepositService.useDeposit(dto);
    return ApiResponse.ok(data, 'Deposit used successfully');
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Refund customer deposit (Kembalikan uang deposit)' })
  async refundDeposit(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { amount?: number; notes?: string; createdById?: number },
  ) {
    const data = await this.customerDepositService.refundDeposit(id, dto);
    return ApiResponse.ok(data, 'Deposit refunded successfully');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // UPDATE
  // ─────────────────────────────────────────────────────────────────────────────

  @Patch(':id')
  @ApiOperation({ summary: 'Update deposit notes' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCustomerDepositDto,
  ) {
    const data = await this.customerDepositService.update(id, dto);
    return ApiResponse.ok(data, 'Deposit updated');
  }
}
