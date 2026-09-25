import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ChequePaymentService } from './cheque-payment.service';
import {
  CreateChequePaymentDto,
  UpdateChequePaymentDto,
  ClearChequeDto,
  BounceChequeDto,
  ChequePaymentFilterDto,
} from './dto/cheque-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';
import { ApiResponse } from '../../common/dto/api-response-dto';

@ApiTags('Cheque Payment - Pembayaran Cek/Giro')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cheque-payment')
export class ChequePaymentController {
  constructor(private chequePaymentService: ChequePaymentService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // CREATE
  // ─────────────────────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create new cheque payment' })
  async create(@Body() dto: CreateChequePaymentDto, @CurrentUser() user: any) {
    const data = await this.chequePaymentService.create(dto, user.ID);
    return ApiResponse.ok(data, 'Cheque payment created successfully');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // READ
  // ─────────────────────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Get all cheque payments with filters' })
  @ApiQuery({ name: 'Type', required: false, description: 'SALE or PURCHASE' })
  @ApiQuery({ name: 'Status', required: false, description: 'PENDING, CLEARED, BOUNCED, CANCELLED' })
  @ApiQuery({ name: 'BankId', required: false, type: Number })
  @ApiQuery({ name: 'StartDate', required: false })
  @ApiQuery({ name: 'EndDate', required: false })
  @ApiQuery({ name: 'Search', required: false })
  async findAll(@Query() dto: ChequePaymentFilterDto) {
    const data = await this.chequePaymentService.findAll(dto);
    return ApiResponse.ok(data);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get count of cheque payments' })
  async getCount(@Query() dto: ChequePaymentFilterDto) {
    const data = await this.chequePaymentService.findAll(dto);
    return ApiResponse.ok({ count: data.count });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cheque payment by ID' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    const data = await this.chequePaymentService.findById(id);
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // UPDATE
  // ─────────────────────────────────────────────────────────────────────────────

  @Patch(':id')
  @ApiOperation({ summary: 'Update cheque payment' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateChequePaymentDto,
  ) {
    const data = await this.chequePaymentService.update(id, dto);
    return ApiResponse.ok(data, 'Cheque payment updated successfully');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STATUS CHANGES
  // ─────────────────────────────────────────────────────────────────────────────

  @Put(':id/clear')
  @ApiOperation({ summary: 'Mark cheque as cleared' })
  async clearCheque(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ClearChequeDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.chequePaymentService.clearCheque(id, dto, user.ID);
    return ApiResponse.ok(data);
  }

  @Put(':id/bounce')
  @ApiOperation({ summary: 'Mark cheque as bounced' })
  async bounceCheque(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: BounceChequeDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.chequePaymentService.bounceCheque(id, dto, user.ID);
    return ApiResponse.ok(data);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel cheque payment' })
  async cancelCheque(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { reason: string },
    @CurrentUser() user: any,
  ) {
    const data = await this.chequePaymentService.cancelCheque(id, body.reason, user.ID);
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE
  // ─────────────────────────────────────────────────────────────────────────────

  @Delete(':id')
  @ApiOperation({ summary: 'Delete cheque payment' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    const data = await this.chequePaymentService.delete(id);
    return ApiResponse.ok(data);
  }
}
