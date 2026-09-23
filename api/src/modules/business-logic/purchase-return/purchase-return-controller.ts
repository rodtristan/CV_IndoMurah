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
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PurchaseReturnService } from './purchase-return-service';
import {
  CreatePurchaseReturnDto,
  UpDatePurchaseReturnDto,
  PurchaseReturnQueryDto,
  ApprovePurchaseReturnDto,
  CancelPurchaseReturnDto,
} from './purchase-return.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth-guard';
import { ApiResponse } from '../../../common/dto/api-response-dto';

@ApiTags('Purchase Return - Retur Pembelian')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('business-logic/purchase-return')
export class PurchaseReturnController {
  constructor(private purchaseReturnService: PurchaseReturnService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // CREATE
  // ─────────────────────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create new purchase return (Retur Pembelian)' })
  async create(@Body() dto: CreatePurchaseReturnDto) {
    const data = await this.purchaseReturnService.create(dto);
    return ApiResponse.ok(data, 'Purchase return created successfully');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // QUERY
  // ─────────────────────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List all purchase returns' })
  async findAll(@Query() dto: PurchaseReturnQueryDto) {
    const data = await this.purchaseReturnService.findAll(dto);
    return ApiResponse.ok(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase return by ID' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    const data = await this.purchaseReturnService.findById(id);
    return ApiResponse.ok(data);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // UPDATE
  // ─────────────────────────────────────────────────────────────────────────────

  @Patch(':id')
  @ApiOperation({ summary: 'Update purchase return' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpDatePurchaseReturnDto,
  ) {
    const data = await this.purchaseReturnService.update(id, dto);
    return ApiResponse.ok(data, 'Purchase return updated');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────────────────────────────────────────

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve purchase return (Buat credit note supplier)' })
  async approve(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApprovePurchaseReturnDto,
  ) {
    const data = await this.purchaseReturnService.approve(id, dto);
    return ApiResponse.ok(data, 'Purchase return approved');
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel purchase return' })
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelPurchaseReturnDto,
  ) {
    const data = await this.purchaseReturnService.cancel(id, dto);
    return ApiResponse.ok(data, 'Purchase return cancelled');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete pending purchase return' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.purchaseReturnService.delete(id);
    return ApiResponse.ok(null, 'Purchase return deleted');
  }
}
